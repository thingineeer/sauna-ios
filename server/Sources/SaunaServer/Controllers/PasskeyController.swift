import Foundation
import Vapor

/// `POST /auth/passkey/{register,login}/{begin,finish}` — stub controller.
///
/// Spec (tech-stack-final §1.5, §2.1):
/// > Passkey (WebAuthn) — RP는 자체 / Vapor 패키지 검토.
///
/// Phase 3 wires this end-to-end with a WebAuthnSwift dependency.
/// Until then we return shaped placeholder responses so the iOS client can
/// scaffold its `Authenticator` plumbing against a real HTTP surface.
///
/// Wire shapes are intentionally minimal and match a typical WebAuthn flow:
/// - `register/begin` → server returns a `PublicKeyCredentialCreationOptions`-shaped blob
/// - `register/finish` → client posts the attested credential, server returns a session token
/// - `login/begin` → returns `PublicKeyCredentialRequestOptions`-shaped blob
/// - `login/finish` → returns a session token
public struct PasskeyController: RouteCollection, Sendable {
    public init() {}

    public func boot(routes: RoutesBuilder) throws {
        let group = routes.grouped("auth", "passkey")
        group.post("register", "begin", use: registerBegin)
        group.post("register", "finish", use: registerFinish)
        group.post("login", "begin", use: loginBegin)
        group.post("login", "finish", use: loginFinish)
    }

    // MARK: - Register

    @Sendable
    func registerBegin(_ req: Request) async throws -> RegisterBeginResponse {
        // TODO: integrate WebAuthnSwift — generate a fresh challenge, persist
        // it server-side keyed by anonymous userId, and return real
        // `PublicKeyCredentialCreationOptions`.
        let body = try req.content.decode(RegisterBeginRequest.self)
        req.logger.info(
            "passkey register begin (stub)",
            metadata: ["userIdHash": .string(hash(body.userId))]
        )
        return RegisterBeginResponse(
            challenge: stubChallenge(),
            rpId: body.rpId ?? "sauna.app",
            userId: body.userId
        )
    }

    @Sendable
    func registerFinish(_ req: Request) async throws -> AuthSessionResponse {
        // TODO: integrate WebAuthnSwift — verify attestation, persist
        // credential into PostgresPasskeyStore, mint session JWT.
        let body = try req.content.decode(RegisterFinishRequest.self)
        req.logger.info(
            "passkey register finish (stub)",
            metadata: ["userIdHash": .string(hash(body.userId))]
        )
        return AuthSessionResponse(token: stubToken(userId: body.userId))
    }

    // MARK: - Login

    @Sendable
    func loginBegin(_ req: Request) async throws -> LoginBeginResponse {
        // TODO: integrate WebAuthnSwift — generate assertion challenge,
        // include allowCredentials by user lookup.
        let body = try? req.content.decode(LoginBeginRequest.self)
        req.logger.info(
            "passkey login begin (stub)",
            metadata: ["userIdHash": .string(hash(body?.userId ?? ""))]
        )
        return LoginBeginResponse(
            challenge: stubChallenge(),
            rpId: body?.rpId ?? "sauna.app"
        )
    }

    @Sendable
    func loginFinish(_ req: Request) async throws -> AuthSessionResponse {
        // TODO: integrate WebAuthnSwift — verify assertion, mint session JWT.
        let body = try req.content.decode(LoginFinishRequest.self)
        req.logger.info(
            "passkey login finish (stub)",
            metadata: ["userIdHash": .string(hash(body.userId))]
        )
        return AuthSessionResponse(token: stubToken(userId: body.userId))
    }

    // MARK: - Stub helpers

    private func stubChallenge() -> String {
        // Base64URL-shaped challenge. NOT cryptographically meaningful.
        let raw = UUID().uuidString.replacingOccurrences(of: "-", with: "")
        return Data(raw.utf8).base64URLEncodedString()
    }

    private func stubToken(userId: String) -> String {
        "stub.\(hash(userId))"
    }

    /// Deterministic-looking digest of the userId so logs do not leak the raw value.
    private func hash(_ value: String) -> String {
        let h = abs(value.hashValue)
        return String(h, radix: 16, uppercase: false)
    }
}

// MARK: - Wire types

public struct RegisterBeginRequest: Content, Sendable {
    public let userId: String
    public let rpId: String?
}

public struct RegisterBeginResponse: Content, Sendable {
    public let challenge: String
    public let rpId: String
    public let userId: String
}

public struct RegisterFinishRequest: Content, Sendable {
    public let userId: String
    public let attestationObject: String
    public let clientDataJSON: String
}

public struct LoginBeginRequest: Content, Sendable {
    public let userId: String
    public let rpId: String?
}

public struct LoginBeginResponse: Content, Sendable {
    public let challenge: String
    public let rpId: String
}

public struct LoginFinishRequest: Content, Sendable {
    public let userId: String
    public let authenticatorData: String
    public let clientDataJSON: String
    public let signature: String
}

public struct AuthSessionResponse: Content, Sendable {
    public let token: String
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
