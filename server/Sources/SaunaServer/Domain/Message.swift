import Foundation

/// Wire shape of a single ephemeral message.
///
/// Matches the React reference in
/// `design-handoff/v3-jjimjilbang/lib/jjim-screens-main.jsx` (lines 270–540):
/// each `RiseMsg` carries `{ nickname, text, ts, senderId }`.
///
/// IMPORTANT (PRD §8, tech-stack-final §0):
/// - `text` is broadcast through pub/sub fanout and dropped.
/// - It is NEVER persisted (no Postgres, no log line, no in-memory queue
///   beyond the per-connection write side).
public struct ChatMessage: Codable, Sendable, Hashable {
    public let id: String
    public let room: RoomKind
    public let senderId: String
    public let nickname: String
    public let text: String
    /// Server-assigned epoch millis at fanout time.
    public let sentAtMillis: Int64

    public init(
        id: String,
        room: RoomKind,
        senderId: String,
        nickname: String,
        text: String,
        sentAtMillis: Int64
    ) {
        self.id = id
        self.room = room
        self.senderId = senderId
        self.nickname = nickname
        self.text = text
        self.sentAtMillis = sentAtMillis
    }
}

/// Inbound frame from a connected client.
/// Today only the simple `send` shape; later phases may add `typing`,
/// `presence`, etc. Tagged via `kind` for forward compatibility.
public enum InboundFrame: Codable, Sendable {
    case send(SendPayload)

    public struct SendPayload: Codable, Sendable, Hashable {
        public let text: String
        /// Optional client-supplied id used for echo-suppression (idempotency).
        public let clientId: String?

        public init(text: String, clientId: String? = nil) {
            self.text = text
            self.clientId = clientId
        }
    }

    private enum CodingKeys: String, CodingKey { case kind, payload }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let kind = try c.decode(String.self, forKey: .kind)
        switch kind {
        case "send":
            let payload = try c.decode(SendPayload.self, forKey: .payload)
            self = .send(payload)
        default:
            throw DecodingError.dataCorruptedError(
                forKey: .kind, in: c,
                debugDescription: "Unknown frame kind '\(kind)'"
            )
        }
    }

    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .send(let p):
            try c.encode("send", forKey: .kind)
            try c.encode(p, forKey: .payload)
        }
    }
}

/// Outbound frame the server pushes to clients.
public enum OutboundFrame: Codable, Sendable {
    case message(ChatMessage)
    case error(ErrorPayload)

    public struct ErrorPayload: Codable, Sendable, Hashable {
        public let code: String
        public let reason: String
        public init(code: String, reason: String) {
            self.code = code
            self.reason = reason
        }
    }

    private enum CodingKeys: String, CodingKey { case kind, payload }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let kind = try c.decode(String.self, forKey: .kind)
        switch kind {
        case "message":
            self = .message(try c.decode(ChatMessage.self, forKey: .payload))
        case "error":
            self = .error(try c.decode(ErrorPayload.self, forKey: .payload))
        default:
            throw DecodingError.dataCorruptedError(
                forKey: .kind, in: c,
                debugDescription: "Unknown frame kind '\(kind)'"
            )
        }
    }

    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .message(let m):
            try c.encode("message", forKey: .kind)
            try c.encode(m, forKey: .payload)
        case .error(let e):
            try c.encode("error", forKey: .kind)
            try c.encode(e, forKey: .payload)
        }
    }
}
