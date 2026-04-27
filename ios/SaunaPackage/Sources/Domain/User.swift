import Foundation

/// Anonymous user. The only stable bit is `id` (Keychain UUID); everything else
/// rotates daily. PII never enters this struct.
public struct User: Equatable, Sendable {
    public let id: String
    public let nickname: Nickname
    public let hasPasskey: Bool

    public init(id: String, nickname: Nickname, hasPasskey: Bool) {
        self.id = id
        self.nickname = nickname
        self.hasPasskey = hasPasskey
    }
}
