import Foundation
import Domain

public protocol NicknameRepository: Sendable {
    /// Fetches today's nickname (issuing a new one if expired).
    func currentNickname() async throws -> Nickname

    /// Forces a re-roll (used by Onboard 3 "다시 뽑기 (오늘 1회)").
    /// Throws `NicknameRepositoryError.rerollLimitExceeded` after the daily quota.
    func reroll() async throws -> Nickname
}

public enum NicknameRepositoryError: Error, Equatable {
    case rerollLimitExceeded
    case offline
}
