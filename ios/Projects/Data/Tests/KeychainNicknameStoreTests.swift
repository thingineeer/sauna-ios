import XCTest
import DomainInterface
import Domain
@testable import Data

final class KeychainNicknameStoreTests: XCTestCase {
    /// In-memory keychain — independent from Security framework so the test
    /// runs on Linux and inside `swift test` without entitlements.
    actor InMemoryKeychain {
        private var store: [String: Data] = [:]
        func read(_ key: String) -> Data? { store[key] }
        func write(_ key: String, _ data: Data) { store[key] = data }
        func delete(_ key: String) { store[key] = nil }
    }

    private func makeStore(
        keychain: InMemoryKeychain = InMemoryKeychain(),
        clock: ClockProviding,
        random: RandomGenerating = StubRandomGenerator(ints: [0, 0, 0])
    ) -> KeychainNicknameStore {
        KeychainNicknameStore(
            accessor: { op in
                switch op {
                case .read(let service, let account):
                    let key = "\(service):\(account)"
                    let result: Data? = await unwrap { await keychain.read(key) }
                    return result
                case .write(let service, let account, let data):
                    let key = "\(service):\(account)"
                    await keychain.write(key, data)
                    return nil
                case .delete(let service, let account):
                    let key = "\(service):\(account)"
                    await keychain.delete(key)
                    return nil
                }
            },
            clock: clock,
            random: random
        )
    }

    func testFirstCallMintsAndPersists() async throws {
        let kc = InMemoryKeychain()
        let now = ymd(2026, 4, 28, hour: 13)
        let store = makeStore(keychain: kc, clock: FixedClock(now))
        let n = try await store.currentNickname()
        XCTAssertFalse(n.value.isEmpty)
        let cached = try await store.currentNickname()
        XCTAssertEqual(cached, n, "second call returns the same cached nickname")
    }

    func testRerollReplacesCache() async throws {
        let now = ymd(2026, 4, 28, hour: 13)
        let store = makeStore(
            clock: FixedClock(now),
            random: StubRandomGenerator(ints: [0, 0, 0, 1, 1, 1])
        )
        let first = try await store.currentNickname()
        let rerolled = try await store.reroll()
        XCTAssertNotEqual(first.value, rerolled.value)
        let after = try await store.currentNickname()
        XCTAssertEqual(after, rerolled, "after reroll, current returns rerolled")
    }

    func testStaleCacheIsReplaced() async throws {
        let kc = InMemoryKeychain()
        let yesterday = FixedClock(ymd(2026, 4, 27, hour: 13))
        let storeY = makeStore(keychain: kc, clock: yesterday)
        let dayOldNick = try await storeY.currentNickname()
        // Same keychain, advance to next day
        let today = FixedClock(ymd(2026, 4, 28, hour: 13))
        let storeT = makeStore(
            keychain: kc, clock: today,
            random: StubRandomGenerator(ints: [3, 3, 0xBEEF])
        )
        let fresh = try await storeT.currentNickname()
        XCTAssertNotEqual(fresh.value, dayOldNick.value)
        XCTAssertEqual(fresh.tag, "BEEF")
    }

    // MARK: - helpers

    private func ymd(_ y: Int, _ m: Int, _ d: Int, hour: Int) -> Date {
        var c = DateComponents()
        c.timeZone = TimeZone(identifier: "Asia/Seoul")
        c.year = y; c.month = m; c.day = d; c.hour = hour
        return NicknameKST.calendar.date(from: c)!  // swiftlint:disable:this force_unwrapping
    }
}

private func unwrap<T>(_ block: () async throws -> T) async rethrows -> T {
    try await block()
}
