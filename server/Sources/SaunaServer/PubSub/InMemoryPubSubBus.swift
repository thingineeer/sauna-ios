import Foundation

/// Process-local pub/sub used for unit tests and as a dev-time fallback when
/// `REDIS_URL` is unset/unreachable. Backed by a single actor for serialized,
/// concurrency-safe state mutation.
///
/// Semantics:
/// - Fan-out is best-effort and synchronous within a publish call.
/// - Handlers run on a detached Task to avoid blocking the publisher.
public final class InMemoryPubSubBus: PubSubBus {
    private let state = State()

    public init() {}

    public func subscribe(
        channel: String,
        handler: @Sendable @escaping (Data) -> Void
    ) async throws -> SubscriptionToken {
        let token = SubscriptionToken(channel: channel)
        await state.add(token: token, handler: handler)
        return token
    }

    public func publish(channel: String, payload: Data) async throws {
        let handlers = await state.handlers(for: channel)
        for h in handlers {
            // Detach so a slow/throwing handler can't stall the publisher.
            Task.detached { h(payload) }
        }
    }

    public func unsubscribe(_ token: SubscriptionToken) async {
        await state.remove(token: token)
    }

    /// Test helper.
    public func subscriberCount(channel: String) async -> Int {
        await state.handlers(for: channel).count
    }

    // MARK: - State

    private actor State {
        // channel -> [tokenId : handler]
        private var channels: [String: [UUID: @Sendable (Data) -> Void]] = [:]

        func add(token: SubscriptionToken, handler: @Sendable @escaping (Data) -> Void) {
            channels[token.channel, default: [:]][token.id] = handler
        }

        func remove(token: SubscriptionToken) {
            channels[token.channel]?.removeValue(forKey: token.id)
            if channels[token.channel]?.isEmpty == true {
                channels.removeValue(forKey: token.channel)
            }
        }

        func handlers(for channel: String) -> [@Sendable (Data) -> Void] {
            Array(channels[channel]?.values ?? [:].values)
        }
    }
}
