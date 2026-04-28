import Foundation

/// Persistence boundary for Passkey credentials.
///
/// Allowed data (tech-stack-final §2.1):
/// - User anonymous id (UUID)
/// - Credential id (bytes)
/// - Public key (COSE-encoded bytes)
/// - Signature counter
/// - Created/last-used timestamps
///
/// FORBIDDEN data: any chat content; any plaintext private key.
public protocol PasskeyStore: Sendable {
    func saveCredential(_ credential: PasskeyCredential) async throws
    func loadCredentials(forUserId userId: String) async throws -> [PasskeyCredential]
    func updateSignatureCount(credentialId: Data, count: UInt32) async throws
    func deleteCredential(credentialId: Data) async throws
}

/// Wire shape of a stored Passkey credential.
public struct PasskeyCredential: Sendable, Hashable {
    public let userId: String
    public let credentialId: Data
    public let publicKeyCOSE: Data
    public var signatureCount: UInt32
    public let createdAt: Date
    public var lastUsedAt: Date?

    public init(
        userId: String,
        credentialId: Data,
        publicKeyCOSE: Data,
        signatureCount: UInt32 = 0,
        createdAt: Date = Date(),
        lastUsedAt: Date? = nil
    ) {
        self.userId = userId
        self.credentialId = credentialId
        self.publicKeyCOSE = publicKeyCOSE
        self.signatureCount = signatureCount
        self.createdAt = createdAt
        self.lastUsedAt = lastUsedAt
    }
}

public enum PasskeyStoreError: Error, Sendable, Equatable {
    case credentialNotFound
    case duplicateCredential
    case backendUnavailable
}
