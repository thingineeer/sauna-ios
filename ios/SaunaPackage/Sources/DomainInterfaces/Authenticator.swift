import Foundation
import Domain

/// Apple Passkey backed (WebAuthn) — implementation lives in `Data` and uses
/// `ASAuthorizationPlatformPublicKeyCredentialProvider`.
public protocol Authenticator: Sendable {
    /// Whether this device already has a passkey registered for our RP.
    func hasRegisteredCredential() async -> Bool

    /// Register a new passkey. Returns the user the OS gave us back.
    /// `displayName` is shown in the system sheet (P2 in design).
    func register(displayName: String) async throws -> User

    /// Re-authenticate with an existing passkey. Returns the same user.
    func authenticate() async throws -> User

    /// Drop the local credential reference. Used by "데이터 삭제" in settings.
    func clear() async throws
}

public enum AuthenticatorError: Error, Equatable {
    case userCanceled
    case noCredential
    case keychainFailure
    case serverRejected
}
