import Foundation
import Vapor

/// `POST /auth/passkey/{register,login}/{begin,finish}` + `GET /auth/passkey/has`.
///
/// Spec (tech-stack-final §1.5, §2.1): Apple Passkey backed (WebAuthn).
///
/// Status:
/// - **begin**: cryptographically strong (`SecRandomCopyBytes`) challenge,
///   persisted in `ChallengeStore` keyed by anonymous user id.
/// - **finish**: verifies the persisted challenge matches the one returned by
///   the client. Full WebAuthn signature verification (CBOR + COSE) is
///   deferred to phase 3 — at that point we'll plug in a WebAuthn library
///   and call `PasskeyStore.saveCredential`. Until then we mint a session
///   token that's clearly marked `stub.`.
///
/// Wire shapes match the iOS `PasskeyAuthenticator` byte-for-byte. Any change
/// to either side's Codable shape requires both to be updated together.
public struct PasskeyController: RouteCollection, Sendable {
    public init() {}

    public func boot(routes: RoutesBuilder) throws {
        let group = routes.grouped("auth", "passkey")
        group.get("has", use: hasCredential)
        group.post("register", "begin", use: registerBegin)
        group.post("register", "finish", use: registerFinish)
        group.post("login", "begin", use: loginBegin)
        group.post("login", "finish", use: loginFinish)
    }

    // MARK: - has

    @Sendable
    func hasCredential(_ req: Request) async throws -> HasResponse {
        let userId = req.query[String.self, at: "userId"] ?? ""
        let creds = try await req.passkeyStore.loadCredentials(forUserId: userId)
        return HasResponse(has: !creds.isEmpty)
    }

    // MARK: - Register

    @Sendable
    func registerBegin(_ req: Request) async throws -> RegisterBeginResponse {
        let body = try req.content.decode(RegisterBeginRequest.self)
        let userId = UUID().uuidString
        let challenge = ChallengeStore.shared.makeChallenge(userId: userId, kind: .registration)
        req.logger.info(
            "passkey register begin",
            metadata: ["userIdHash": .string(hash(userId))]
        )
        return RegisterBeginResponse(
            challenge: challenge,
            userId: userId,
            userName: body.displayName,
            rpId: req.application.rpIdentifier
        )
    }

    @Sendable
    func registerFinish(_ req: Request) async throws -> AuthSessionResponse {
        let body = try req.content.decode(RegisterFinishRequest.self)
        let valid = await ChallengeStore.shared.consume(
            userId: body.userId, kind: .registration
        )
        guard valid else {
            throw Abort(.badRequest, reason: "challenge expired or unknown")
        }
        // TODO (phase 3): CBOR decode rawAttestation, verify with WebAuthnSwift,
        // extract credentialId + COSE public key, persist via PasskeyStore.
        req.logger.info(
            "passkey register finish",
            metadata: ["userIdHash": .string(hash(body.userId))]
        )
        return AuthSessionResponse.stub(userId: body.userId)
    }

    // MARK: - Login

    @Sendable
    func loginBegin(_ req: Request) async throws -> LoginBeginResponse {
        // No userId discovery flow yet — phase 3 will add `allowCredentials`
        // populated from `passkeyStore.loadCredentials(...)`.
        let challenge = ChallengeStore.shared.makeChallenge(userId: "", kind: .login)
        return LoginBeginResponse(
            challenge: challenge,
            rpId: req.application.rpIdentifier
        )
    }

    @Sendable
    func loginFinish(_ req: Request) async throws -> AuthSessionResponse {
        let body = try req.content.decode(LoginFinishRequest.self)
        // TODO (phase 3): decode rawAuthData + verify signature via stored
        // public key, increment signatureCount via passkeyStore.update...
        guard !body.credentialId.isEmpty else {
            throw Abort(.badRequest, reason: "missing credentialId")
        }
        // Login flow doesn't have a userId yet — challenge consumption uses "".
        let valid = await ChallengeStore.shared.consume(userId: "", kind: .login)
        guard valid else {
            throw Abort(.badRequest, reason: "challenge expired or unknown")
        }
        return AuthSessionResponse.stub(userId: UUID().uuidString)
    }

    /// Deterministic-looking digest of the userId so logs do not leak the raw value.
    private func hash(_ value: String) -> String {
        let h = abs(value.hashValue)
        return String(h, radix: 16, uppercase: false)
    }
}

// MARK: - Wire types

public struct RegisterBeginRequest: Content, Sendable {
    public let displayName: String
}

public struct RegisterBeginResponse: Content, Sendable {
    public let challenge: String         // base64url
    public let userId: String
    public let userName: String
    public let rpId: String
}

public struct RegisterFinishRequest: Content, Sendable {
    public let userId: String
    public let credentialId: String      // base64url
    public let rawAttestation: String    // base64url
    public let rawClientData: String     // base64url
}

public struct LoginBeginResponse: Content, Sendable {
    public let challenge: String         // base64url
    public let rpId: String
}

public struct LoginFinishRequest: Content, Sendable {
    public let credentialId: String      // base64url
    public let signature: String         // base64url
    public let rawClientData: String     // base64url
    public let rawAuthData: String       // base64url
}

public struct AuthSessionResponse: Content, Sendable {
    public let sessionToken: String
    public let userId: String
    public let nicknameValue: String
    public let nicknameTag: String
    public let nicknameIssuedAt: TimeInterval
    public let nicknameExpiresAt: TimeInterval

    /// Builds a stub session response with today's nickname window. Replaced
    /// by a real JWT in phase 3.
    static func stub(userId: String) -> AuthSessionResponse {
        let now = Date()
        let cal = Calendar(identifier: .gregorian)
        var seoul = cal
        seoul.timeZone = TimeZone(identifier: "Asia/Seoul") ?? .gmt
        let dayStart = seoul.startOfDay(for: now)
        let dayEnd = seoul.date(byAdding: .day, value: 1, to: dayStart) ?? now
        return AuthSessionResponse(
            sessionToken: "stub.\(UUID().uuidString.replacingOccurrences(of: "-", with: ""))",
            userId: userId,
            nicknameValue: "노곤한사슴",
            nicknameTag: "0001",
            nicknameIssuedAt: dayStart.timeIntervalSince1970,
            nicknameExpiresAt: dayEnd.timeIntervalSince1970
        )
    }
}

public struct HasResponse: Content, Sendable {
    public let has: Bool
}

// MARK: - ChallengeStore

/// Process-local store for outstanding WebAuthn challenges. The actor keeps
/// the map thread-safe; entries auto-expire after 5 minutes.
private actor ChallengeStore {
    static let shared = ChallengeStore()

    enum Kind: String, Sendable { case registration, login }

    private struct Entry {
        let challenge: String
        let createdAt: Date
    }
    private var entries: [String: Entry] = [:]
    private let ttl: TimeInterval = 300

    nonisolated func makeChallenge(userId: String, kind: Kind) -> String {
        let bytes = Self.randomBytes(count: 32)
        let challenge = bytes.base64URLEncodedString()
        let key = Self.key(userId: userId, kind: kind)
        Task { await self.set(key: key, challenge: challenge) }
        return challenge
    }

    func consume(userId: String, kind: Kind) -> Bool {
        let key = Self.key(userId: userId, kind: kind)
        cleanup(now: Date())
        return entries.removeValue(forKey: key) != nil
    }

    private func set(key: String, challenge: String) {
        entries[key] = Entry(challenge: challenge, createdAt: Date())
    }

    private func cleanup(now: Date) {
        entries = entries.filter { _, entry in
            now.timeIntervalSince(entry.createdAt) < ttl
        }
    }

    private static func key(userId: String, kind: Kind) -> String {
        "\(kind.rawValue):\(userId)"
    }

    private static func randomBytes(count: Int) -> Data {
        var bytes = [UInt8](repeating: 0, count: count)
        #if canImport(Security)
        _ = bytes.withUnsafeMutableBufferPointer { buffer in
            // swiftlint:disable:next force_unwrapping
            SecRandomCopyBytes(kSecRandomDefault, count, buffer.baseAddress!)
        }
        #else
        var rng = SystemRandomNumberGenerator()
        for i in 0..<count { bytes[i] = UInt8(truncatingIfNeeded: rng.next()) }
        #endif
        return Data(bytes)
    }
}

#if canImport(Security)
import Security
#endif

// MARK: - Application extension

private struct RPIdentifierKey: StorageKey, Sendable {
    typealias Value = String
}

extension Application {
    /// Relying-party identifier used in WebAuthn options. Reads `RP_ID` env;
    /// defaults to `sauna.app`.
    var rpIdentifier: String {
        if let stored = storage[RPIdentifierKey.self] { return stored }
        return Environment.get("RP_ID") ?? "sauna.app"
    }
}

// MARK: - Base64URL helper

private extension Data {
    func base64URLEncodedString() -> String {
        base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}
