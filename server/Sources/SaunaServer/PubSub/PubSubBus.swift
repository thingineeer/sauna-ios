import Foundation

/// Abstraction over publish / subscribe / unsubscribe used by `RoomController`.
///
/// Two implementations exist:
/// - `RedisPubSubBus` (production, RediStack)
/// - `InMemoryPubSubBus` (process-local, tests + dev fallback)
///
/// Channel naming: `room:<RoomKind.rawValue>` (e.g. `room:daily`).
/// Payload is a JSON-encoded `ChatMessage`. Bus implementations MUST treat
/// the bytes as opaque — no parsing, no logging of contents.
public protocol PubSubBus: Sendable {
    /// Subscribe a handler to one channel. Returns a token — call
    /// `unsubscribe(_:)` when the connection closes to free resources and
    /// detach the handler. Handlers are invoked once per published message.
    func subscribe(
        channel: String,
        handler: @Sendable @escaping (Data) -> Void
    ) async throws -> SubscriptionToken

    /// Publish raw bytes to a channel. Failure is best-effort — pub/sub is
    /// not durable; callers do not retry.
    func publish(channel: String, payload: Data) async throws

    /// Detach a previously-issued subscription.
    func unsubscribe(_ token: SubscriptionToken) async
}

/// Opaque handle returned by `subscribe(_:_:)`.
public struct SubscriptionToken: Hashable, Sendable {
    public let id: UUID
    public let channel: String

    public init(id: UUID = UUID(), channel: String) {
        self.id = id
        self.channel = channel
    }
}

/// Standard channel name for a room. Centralized to avoid string drift.
public enum PubSubChannel {
    public static func room(_ kind: RoomKind) -> String {
        "room:\(kind.rawValue)"
    }
}
