import Foundation
import DomainInterface

/// Pure-Domain use case interface — separates "policy" (what should happen)
/// from "mechanism" (how the repo achieves it).
public protocol SendMessageUseCase: Sendable {
    func callAsFunction(_ text: String, to room: Room.Kind) async throws
}

public enum SendMessageError: Error, Equatable {
    case empty
    case tooLong(limit: Int)
    case rateLimited(retryAfter: TimeInterval)
    case downstream(String)
}

/// Repository-agnostic policy. Trims, validates length, applies in-process
/// rate-limit guard, then forwards to the repo. Network failures bubble as
/// `.downstream` so callers don't have to crack open the underlying error.
public struct DefaultSendMessageUseCase<R: SendDelegating>: SendMessageUseCase {
    public static var maxLength: Int { 240 }

    private let repo: R
    private let clock: ClockProviding
    private let limiter: SendRateLimiting

    public init(repo: R, clock: ClockProviding, limiter: SendRateLimiting) {
        self.repo = repo
        self.clock = clock
        self.limiter = limiter
    }

    public func callAsFunction(_ text: String, to room: Room.Kind) async throws {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { throw SendMessageError.empty }
        guard trimmed.count <= Self.maxLength else {
            throw SendMessageError.tooLong(limit: Self.maxLength)
        }
        if let retry = limiter.checkAndRecord(at: clock.now()) {
            throw SendMessageError.rateLimited(retryAfter: retry)
        }
        do {
            try await repo.send(trimmed, to: room)
        } catch {
            throw SendMessageError.downstream(String(describing: error))
        }
    }
}

/// Narrow protocol so the use case doesn't drag the whole `RoomRepository`.
public protocol SendDelegating: Sendable {
    func send(_ text: String, to room: Room.Kind) async throws
}
