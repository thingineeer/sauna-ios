import XCTest
@testable import SaunaServer

final class InMemoryPubSubBusTests: XCTestCase {
    func testPublishReachesSubscriber() async throws {
        let bus = InMemoryPubSubBus()
        let received = Inbox()

        let token = try await bus.subscribe(channel: "room:daily") { data in
            Task { await received.add(data) }
        }

        let payload = Data("hello".utf8)
        try await bus.publish(channel: "room:daily", payload: payload)

        // Handlers run on a detached Task — give the runtime a moment.
        try await received.wait(forCount: 1)

        let bytes = await received.values
        XCTAssertEqual(bytes, [payload])

        await bus.unsubscribe(token)
    }

    func testMultipleSubscribersAllReceive() async throws {
        let bus = InMemoryPubSubBus()
        let inboxA = Inbox()
        let inboxB = Inbox()

        let tA = try await bus.subscribe(channel: "room:stock") { data in
            Task { await inboxA.add(data) }
        }
        let tB = try await bus.subscribe(channel: "room:stock") { data in
            Task { await inboxB.add(data) }
        }

        try await bus.publish(channel: "room:stock", payload: Data("a".utf8))
        try await bus.publish(channel: "room:stock", payload: Data("b".utf8))

        try await inboxA.wait(forCount: 2)
        try await inboxB.wait(forCount: 2)

        let countA = await inboxA.values.count
        let countB = await inboxB.values.count
        XCTAssertEqual(countA, 2)
        XCTAssertEqual(countB, 2)

        await bus.unsubscribe(tA)
        await bus.unsubscribe(tB)
    }

    func testUnsubscribeStopsDelivery() async throws {
        let bus = InMemoryPubSubBus()
        let inbox = Inbox()

        let token = try await bus.subscribe(channel: "room:job") { data in
            Task { await inbox.add(data) }
        }
        try await bus.publish(channel: "room:job", payload: Data("first".utf8))
        try await inbox.wait(forCount: 1)

        await bus.unsubscribe(token)

        try await bus.publish(channel: "room:job", payload: Data("second".utf8))
        // Allow time for any pending delivery.
        try await Task.sleep(nanoseconds: 80_000_000) // 80ms

        let count = await inbox.values.count
        XCTAssertEqual(count, 1, "no further messages should be delivered after unsubscribe")
    }

    func testCrossChannelIsolation() async throws {
        let bus = InMemoryPubSubBus()
        let dailyInbox = Inbox()

        let token = try await bus.subscribe(channel: "room:daily") { data in
            Task { await dailyInbox.add(data) }
        }

        try await bus.publish(channel: "room:stock", payload: Data("ignored".utf8))
        try await Task.sleep(nanoseconds: 60_000_000) // 60ms

        let count = await dailyInbox.values.count
        XCTAssertEqual(count, 0)
        await bus.unsubscribe(token)
    }
}

/// Concurrency-safe collector used by the tests above.
private actor Inbox {
    private(set) var values: [Data] = []

    func add(_ data: Data) {
        values.append(data)
    }

    /// Polls until at least `count` items have arrived, or fails after timeout.
    func wait(forCount count: Int, timeoutMillis: Int = 1_000) async throws {
        let deadline = Date().addingTimeInterval(Double(timeoutMillis) / 1_000.0)
        while values.count < count {
            if Date() >= deadline {
                throw InboxTimeout(expected: count, got: values.count)
            }
            try await Task.sleep(nanoseconds: 10_000_000) // 10ms
        }
    }

    struct InboxTimeout: Error {
        let expected: Int
        let got: Int
    }
}
