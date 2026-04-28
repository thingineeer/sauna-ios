import Foundation

public struct Message: Equatable, Identifiable, Sendable {
    public let id: UUID
    public let roomId: Room.Kind
    public let nickname: String
    public let text: String
    public let createdAt: Date
    public let senderId: String

    public init(
        id: UUID = UUID(),
        roomId: Room.Kind,
        nickname: String,
        text: String,
        createdAt: Date,
        senderId: String
    ) {
        self.id = id
        self.roomId = roomId
        self.nickname = nickname
        self.text = text
        self.createdAt = createdAt
        self.senderId = senderId
    }

    public func isMine(currentUserId: String) -> Bool {
        senderId == currentUserId
    }
}
