import Foundation
import Domain
import DomainInterfaces
import Data
import NetworkCore

/// Composition root. Holds the live (or mock) instances of every UseCase /
/// Repository the feature modules need. Built once at app boot and injected
/// into the View tree via `.environment(_:)`.
@Observable
@MainActor
public final class AppContainer {
    public let env: AppEnvironment
    public let clock: ClockProviding
    public let random: RandomGenerating

    public let nicknameRepository: any NicknameRepository
    public let roomRepository: any RoomRepository
    public let authenticator: any Authenticator

    /// Token holder — Passkey login fills this; everywhere that needs the
    /// auth header reads through this provider. Avoids passing tokens around.
    public private(set) var sessionToken: String?

    public init(
        env: AppEnvironment,
        clock: ClockProviding = SystemClock(),
        random: RandomGenerating = SystemRandomGenerator(),
        nicknameRepository: any NicknameRepository,
        roomRepository: any RoomRepository,
        authenticator: any Authenticator
    ) {
        self.env = env
        self.clock = clock
        self.random = random
        self.nicknameRepository = nicknameRepository
        self.roomRepository = roomRepository
        self.authenticator = authenticator
    }

    public func setSessionToken(_ token: String?) { sessionToken = token }

    // MARK: - factories

    /// Production. Backed by Keychain + URLSession. Falls back to a stub room
    /// repository when `env.useStubRoom == true` (handy for previews while the
    /// server is offline).
    public static func live(env: AppEnvironment = .fromBundle()) -> AppContainer {
        let session = URLSession(configuration: .ephemeral)
        let http = URLSessionNetworkClient(session: session)
        let ws = URLSessionWebSocketClient(session: session)

        // Token provider closure — captures the container weakly so it always
        // sees the latest token without a publish/subscribe.
        weak var ref: AppContainer?
        let tokenProvider: @Sendable () async -> String? = { @MainActor in ref?.sessionToken }

        let nickname = KeychainNicknameStore()

        let roomRepo: any RoomRepository = env.useStubRoom
            ? RoomRepositoryStub()
            : RemoteRoomRepository(
                config: .init(
                    baseURL: env.httpBaseURL,
                    wsBaseURL: env.wsBaseURL,
                    authTokenProvider: tokenProvider
                ),
                http: http,
                ws: ws
            )

        let auth = PasskeyAuthenticator(
            relyingPartyId: env.httpBaseURL.host ?? "sauna.app",
            http: http,
            tokenSink: { @MainActor token in ref?.setSessionToken(token) }
        )

        let container = AppContainer(
            env: env,
            nicknameRepository: nickname,
            roomRepository: roomRepo,
            authenticator: auth
        )
        ref = container
        return container
    }

    /// Previews / unit tests. Pure stubs.
    public static func mock(env: AppEnvironment = .preview) -> AppContainer {
        AppContainer(
            env: env,
            clock: FixedClock(Date(timeIntervalSinceReferenceDate: 0)),
            random: StubRandomGenerator(),
            nicknameRepository: NicknameRepositoryStub(),
            roomRepository: RoomRepositoryStub(),
            authenticator: AuthenticatorStub()
        )
    }
}

// ─── In-memory stubs (used by mock() and previews) ────────────────────

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
    public func observeMessages(for room: Domain.Room.Kind) -> AsyncStream<Domain.Message> {
        AsyncStream { continuation in continuation.finish() }
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
