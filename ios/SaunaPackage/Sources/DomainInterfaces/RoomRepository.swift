import Foundation
import Domain

public protocol RoomRepository: Sendable {
    /// Live stream of messages for a room. Closes when the upstream WS disconnects.
    func observeMessages(for room: Room.Kind) -> AsyncStream<Message>

    /// Send text. Throws on rate limit, invalid room, or network failure.
    func send(_ text: String, to room: Room.Kind) async throws

    /// Polled occupancy. The Home cards refresh this periodically.
    func occupancy(of room: Room.Kind) async throws -> Int

    /// All rooms in their canonical order, with current occupancy filled in.
    func rooms() async throws -> [Room]
}
