import Foundation
import Domain
import DomainInterface

/// Domain 의 mock/stub 구현체들. TMA Testing 타겟 — Feature 의 Tests + App 의
/// composition root (mock 환경) 가 의존한다.
///
/// 이 모듈은 절대 운영 빌드에 들어가지 않는다 (App 의 mock 빌드 / Feature
/// Example app / *Tests 만 link).

@MainActor
public final class NicknameRepositoryStub: NicknameRepository, @unchecked Sendable {
    private var cached: Nickname?
    public init(initial: Nickname? = nil) { self.cached = initial }
    public func currentNickname() async throws -> Nickname {
        if let c = cached { return c }
        let n = NicknameMinter.mint(at: Date(), random: SystemRandomGenerator())
        cached = n
        return n
    }
    public func reroll() async throws -> Nickname {
        let n = NicknameMinter.mint(at: Date(), random: SystemRandomGenerator())
        cached = n
        return n
    }
}

public final class RoomRepositoryStub: RoomRepository, @unchecked Sendable {
    public init() {}
    public func observeMessages(for room: Room.Kind) -> AsyncStream<Message> {
        AsyncStream { continuation in continuation.finish() }
    }
    public func send(_ text: String, to room: Room.Kind) async throws {}
    public func occupancy(of room: Room.Kind) async throws -> Int { 0 }
    public func rooms() async throws -> [Room] { [] }
}

public final class AuthenticatorStub: Authenticator, @unchecked Sendable {
    public init() {}
    public func hasRegisteredCredential() async -> Bool { false }
    public func register(displayName: String) async throws -> User {
        let n = NicknameMinter.mint(at: Date(), random: SystemRandomGenerator())
        return User(id: UUID().uuidString, nickname: n, hasPasskey: true)
    }
    public func authenticate() async throws -> User {
        throw AuthenticatorError.noCredential
    }
    public func clear() async throws {}
}
