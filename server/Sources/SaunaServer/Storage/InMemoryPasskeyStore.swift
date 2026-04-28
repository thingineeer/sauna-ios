import Foundation

/// In-memory `PasskeyStore` — used in tests and as a dev fallback when
/// `DATABASE_URL` is not set. Loses state on process exit.
public actor InMemoryPasskeyStore: PasskeyStore {
    private var byCredentialId: [Data: PasskeyCredential] = [:]
    private var byUserId: [String: Set<Data>] = [:]

    public init() {}

    public func saveCredential(_ credential: PasskeyCredential) async throws {
        if byCredentialId[credential.credentialId] != nil {
            throw PasskeyStoreError.duplicateCredential
        }
        byCredentialId[credential.credentialId] = credential
        byUserId[credential.userId, default: []].insert(credential.credentialId)
    }

    public func loadCredentials(forUserId userId: String) async throws -> [PasskeyCredential] {
        guard let credIds = byUserId[userId] else { return [] }
        return credIds.compactMap { byCredentialId[$0] }
    }

    public func updateSignatureCount(credentialId: Data, count: UInt32) async throws {
        guard var existing = byCredentialId[credentialId] else {
            throw PasskeyStoreError.credentialNotFound
        }
        existing.signatureCount = count
        existing.lastUsedAt = Date()
        byCredentialId[credentialId] = existing
    }

    public func deleteCredential(credentialId: Data) async throws {
        guard let removed = byCredentialId.removeValue(forKey: credentialId) else {
            throw PasskeyStoreError.credentialNotFound
        }
        byUserId[removed.userId]?.remove(credentialId)
    }
}
