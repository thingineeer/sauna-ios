import Foundation

public protocol ObserveRoomMessagesUseCase: Sendable {
    func callAsFunction(_ room: Room.Kind) -> AsyncStream<Message>
}

public struct DefaultObserveRoomMessagesUseCase<R: ObserveDelegating>: ObserveRoomMessagesUseCase {
    private let repo: R
    public init(repo: R) { self.repo = repo }
    public func callAsFunction(_ room: Room.Kind) -> AsyncStream<Message> {
        repo.observeMessages(for: room)
    }
}

public protocol ObserveDelegating: Sendable {
    func observeMessages(for room: Room.Kind) -> AsyncStream<Message>
}
