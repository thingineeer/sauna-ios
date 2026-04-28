import Foundation
import Domain
import DomainInterfaces
import NetworkCore

#if canImport(AuthenticationServices)
import AuthenticationServices
#endif

/// Apple Passkey-backed authenticator. Talks to the Vapor server's
/// `/auth/passkey/{register,login}/{begin,finish}` endpoints and uses
/// `ASAuthorizationPlatformPublicKeyCredentialProvider` for the on-device
/// credential ceremony.
///
/// The flow:
///   1. App calls `register(displayName:)` or `authenticate()`.
///   2. We hit the server's `/begin` to get a challenge.
///   3. ASAuthorization presents the Face ID sheet, signs the challenge.
///   4. We send the signed assertion to `/finish` and receive a session token
///      back. Token is handed to the `tokenSink` so AppContainer can hold it.
public final class PasskeyAuthenticator: Authenticator, @unchecked Sendable {
    public let relyingPartyId: String
    private let http: NetworkClient
    private let tokenSink: @Sendable (String) async -> Void

    public init(
        relyingPartyId: String,
        http: NetworkClient,
        tokenSink: @escaping @Sendable (String) async -> Void
    ) {
        self.relyingPartyId = relyingPartyId
        self.http = http
        self.tokenSink = tokenSink
    }

    public func hasRegisteredCredential() async -> Bool {
        // The OS doesn't expose a direct "has passkey for RP" query; we ping
        // the server for an existing credential descriptor instead.
        let endpoint = passkeyEndpoint(path: "/auth/passkey/has", method: .GET)
        do {
            let response: HasResponse = try await http.request(endpoint, as: HasResponse.self)
            return response.has
        } catch {
            return false
        }
    }

    public func register(displayName: String) async throws -> User {
        #if canImport(AuthenticationServices)
        let begin = try await beginRegistration(displayName: displayName)
        let assertion = try await performRegistration(challenge: begin.challenge,
                                                        userId: begin.userId,
                                                        userName: begin.userName,
                                                        userDisplayName: displayName)
        let token = try await finishRegistration(assertion: assertion, userId: begin.userId)
        await tokenSink(token.sessionToken)
        return token.user
        #else
        throw AuthenticatorError.keychainFailure
        #endif
    }

    public func authenticate() async throws -> User {
        #if canImport(AuthenticationServices)
        let begin = try await beginLogin()
        let assertion = try await performLogin(challenge: begin.challenge)
        let token = try await finishLogin(assertion: assertion)
        await tokenSink(token.sessionToken)
        return token.user
        #else
        throw AuthenticatorError.noCredential
        #endif
    }

    public func clear() async throws {
        // The OS doesn't expose passkey deletion programmatically; we drop
        // our local session and let the user remove the passkey from
        // Settings → Passwords if they really want.
        await tokenSink("")
    }

    // MARK: - HTTP

    private struct BeginRegistrationResponse: Decodable, Sendable {
        let challenge: String           // base64url
        let userId: String
        let userName: String
    }

    private struct BeginLoginResponse: Decodable, Sendable {
        let challenge: String           // base64url
    }

    private struct FinishResponse: Decodable, Sendable {
        let sessionToken: String
        let userId: String
        let nicknameValue: String
        let nicknameTag: String
        let nicknameIssuedAt: TimeInterval
        let nicknameExpiresAt: TimeInterval
        var user: User {
            let nick = Nickname(
                value: nicknameValue,
                tag: nicknameTag,
                issuedAt: Date(timeIntervalSince1970: nicknameIssuedAt),
                expiresAt: Date(timeIntervalSince1970: nicknameExpiresAt)
            )
            return User(id: userId, nickname: nick, hasPasskey: true)
        }
    }

    private struct HasResponse: Decodable, Sendable { let has: Bool }

    private func beginRegistration(displayName: String) async throws -> BeginRegistrationResponse {
        let body = try JSONEncoder().encode(["displayName": displayName])
        let endpoint = passkeyEndpoint(
            path: "/auth/passkey/register/begin", method: .POST, body: body
        )
        return try await http.request(endpoint, as: BeginRegistrationResponse.self)
    }

    private func beginLogin() async throws -> BeginLoginResponse {
        let endpoint = passkeyEndpoint(
            path: "/auth/passkey/login/begin", method: .POST, body: Data("{}".utf8)
        )
        return try await http.request(endpoint, as: BeginLoginResponse.self)
    }

    private func passkeyEndpoint(path: String, method: Endpoint.Method,
                                   body: Data? = nil) -> Endpoint {
        // baseURL injected by the AppContainer through the NetworkClient.
        // PasskeyAuthenticator stays neutral on host; the wired URL request
        // composes the actual host:port at request build time.
        // swiftlint:disable:next force_unwrapping
        let base = URL(string: "https://\(relyingPartyId)")!
        return Endpoint(
            baseURL: base, path: path, method: method,
            headers: ["Content-Type": "application/json"], body: body
        )
    }

    // MARK: - On-device ceremony (AuthenticationServices)

    #if canImport(AuthenticationServices)
    @MainActor
    private func performRegistration(
        challenge: String,
        userId: String,
        userName: String,
        userDisplayName: String
    ) async throws -> ASAuthorizationPlatformPublicKeyCredentialRegistration {
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(
            relyingPartyIdentifier: relyingPartyId
        )
        guard let challengeData = Data(base64URL: challenge),
              let userIdData    = Data(base64URL: userId) else {
            throw AuthenticatorError.serverRejected
        }
        let request = provider.createCredentialRegistrationRequest(
            challenge: challengeData,
            name: userName,
            userID: userIdData
        )
        let result = try await ASAuthorizationFlow.run(request: request)
        guard let reg = result as? ASAuthorizationPlatformPublicKeyCredentialRegistration else {
            throw AuthenticatorError.serverRejected
        }
        return reg
    }

    @MainActor
    private func performLogin(
        challenge: String
    ) async throws -> ASAuthorizationPlatformPublicKeyCredentialAssertion {
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(
            relyingPartyIdentifier: relyingPartyId
        )
        guard let challengeData = Data(base64URL: challenge) else {
            throw AuthenticatorError.serverRejected
        }
        let request = provider.createCredentialAssertionRequest(challenge: challengeData)
        let result = try await ASAuthorizationFlow.run(request: request)
        guard let assertion = result as? ASAuthorizationPlatformPublicKeyCredentialAssertion else {
            throw AuthenticatorError.serverRejected
        }
        return assertion
    }

    private func finishRegistration(
        assertion: ASAuthorizationPlatformPublicKeyCredentialRegistration,
        userId: String
    ) async throws -> FinishResponse {
        let payload: [String: String] = [
            "userId":           userId,
            "credentialId":     assertion.credentialID.base64URLEncoded(),
            "rawAttestation":   assertion.rawAttestationObject?.base64URLEncoded() ?? "",
            "rawClientData":    assertion.rawClientDataJSON.base64URLEncoded(),
        ]
        let body = try JSONEncoder().encode(payload)
        let endpoint = passkeyEndpoint(
            path: "/auth/passkey/register/finish", method: .POST, body: body
        )
        return try await http.request(endpoint, as: FinishResponse.self)
    }

    private func finishLogin(
        assertion: ASAuthorizationPlatformPublicKeyCredentialAssertion
    ) async throws -> FinishResponse {
        let payload: [String: String] = [
            "credentialId":  assertion.credentialID.base64URLEncoded(),
            "signature":     assertion.signature.base64URLEncoded(),
            "rawClientData": assertion.rawClientDataJSON.base64URLEncoded(),
            "rawAuthData":   assertion.rawAuthenticatorData.base64URLEncoded(),
        ]
        let body = try JSONEncoder().encode(payload)
        let endpoint = passkeyEndpoint(
            path: "/auth/passkey/login/finish", method: .POST, body: body
        )
        return try await http.request(endpoint, as: FinishResponse.self)
    }
    #endif
}

// MARK: - base64url helpers

private extension Data {
    init?(base64URL string: String) {
        var s = string
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        let pad = 4 - (s.count % 4)
        if pad < 4 { s.append(String(repeating: "=", count: pad)) }
        self.init(base64Encoded: s)
    }
    func base64URLEncoded() -> String {
        base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}

// MARK: - ASAuthorizationFlow helper

#if canImport(AuthenticationServices)
@MainActor
private enum ASAuthorizationFlow {
    /// Runs an `ASAuthorizationRequest` and returns the credential.
    /// Wraps the delegate-based API in `async/await`.
    static func run(request: ASAuthorizationRequest) async throws -> ASAuthorizationCredential {
        try await withCheckedThrowingContinuation { continuation in
            let coordinator = Coordinator(continuation: continuation)
            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = coordinator
            controller.presentationContextProvider = coordinator
            coordinator.retain(controller)
            controller.performRequests()
        }
    }

    private final class Coordinator: NSObject,
                                       ASAuthorizationControllerDelegate,
                                       ASAuthorizationControllerPresentationContextProviding {
        private let continuation: CheckedContinuation<ASAuthorizationCredential, Error>
        private var retained: ASAuthorizationController?

        init(continuation: CheckedContinuation<ASAuthorizationCredential, Error>) {
            self.continuation = continuation
        }

        func retain(_ controller: ASAuthorizationController) { self.retained = controller }

        func authorizationController(
            controller: ASAuthorizationController,
            didCompleteWithAuthorization authorization: ASAuthorization
        ) {
            continuation.resume(returning: authorization.credential)
            retained = nil
        }

        func authorizationController(
            controller: ASAuthorizationController,
            didCompleteWithError error: Error
        ) {
            if (error as? ASAuthorizationError)?.code == .canceled {
                continuation.resume(throwing: AuthenticatorError.userCanceled)
            } else {
                continuation.resume(throwing: AuthenticatorError.serverRejected)
            }
            retained = nil
        }

        func presentationAnchor(
            for controller: ASAuthorizationController
        ) -> ASPresentationAnchor {
            #if canImport(UIKit)
            return UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .flatMap { $0.windows }
                .first(where: { $0.isKeyWindow }) ?? ASPresentationAnchor()
            #else
            return ASPresentationAnchor()
            #endif
        }
    }
}
#endif
