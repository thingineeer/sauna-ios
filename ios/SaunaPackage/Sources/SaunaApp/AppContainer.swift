import Foundation
import Domain
import DomainInterfaces

/// Composition root. Holds the live (or mock) instances of every UseCase /
/// Repository the feature modules need. Built once at app boot and injected
/// into the View tree via `.environment(_:)`.
@Observable
@MainActor
public final class AppContainer {
    public let clock: ClockProviding
    public let random: RandomGenerating

    public let nicknameRepository: NicknameRepositoryStub
    public let roomRepository: RoomRepositoryStub
    public let authenticator: AuthenticatorStub

    public init(
        clock: ClockProviding = SystemClock(),
        random: RandomGenerating = SystemRandomGenerator()
    ) {
        self.clock = clock
        self.random = random
        self.nicknameRepository = NicknameRepositoryStub()
        self.roomRepository = RoomRepositoryStub()
        self.authenticator = AuthenticatorStub()
    }

    public static func live() -> AppContainer { AppContainer() }
    public static func mock() -> AppContainer {
        AppContainer(
            clock: FixedClock(Date(timeIntervalSinceReferenceDate: 0)),
            random: StubRandomGenerator()
        )
    }
}

// ─── Stubs (replaced in Phase 2 by real Data layer) ───────────────────

/// In-process nickname holder. Real implementation lives in `Data`
/// (Keychain-backed).
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

/// In-process room repository — emits canned bubbles for previewing.
public final class RoomRepositoryStub: RoomRepository, @unchecked Sendable {
    public init() {}
    public func observeMessages(for room: Domain.Room.Kind) -> AsyncStream<Domain.Message> {
        AsyncStream { continuation in
            continuation.finish()  // Phase 1: features simulate locally
        }
    }
    public func send(_ text: String, to room: Domain.Room.Kind) async throws {}
    public func occupancy(of room: Domain.Room.Kind) async throws -> Int { 0 }
    public func rooms() async throws -> [Domain.Room] { [] }
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
