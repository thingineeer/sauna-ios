import Foundation
import Logging
@preconcurrency import PostgresKit

/// `PasskeyStore` backed by Postgres.
///
/// Schema (planned, applied via separate migration in phase 3):
///
/// ```sql
/// CREATE TABLE IF NOT EXISTS passkey_credentials (
///     user_id          TEXT       NOT NULL,
///     credential_id    BYTEA      NOT NULL,
///     public_key_cose  BYTEA      NOT NULL,
///     signature_count  BIGINT     NOT NULL DEFAULT 0,
///     created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
///     last_used_at     TIMESTAMPTZ,
///     PRIMARY KEY (credential_id)
/// );
/// CREATE INDEX IF NOT EXISTS idx_passkey_user ON passkey_credentials(user_id);
/// ```
///
/// All four operations are deferred to phase 3. The struct exists today
/// only so callers can wire DI against the real type.
///
/// Sendability: `EventLoopGroupConnectionPool` is internally synchronized
/// but not formally `Sendable`; we mark the wrapper `@unchecked Sendable`.
public final class PostgresPasskeyStore: PasskeyStore, @unchecked Sendable {
    private let pools: EventLoopGroupConnectionPool<PostgresConnectionSource>
    private let logger: Logger

    public init(
        pools: EventLoopGroupConnectionPool<PostgresConnectionSource>,
        logger: Logger
    ) {
        self.pools = pools
        self.logger = logger
    }

    public func saveCredential(_ credential: PasskeyCredential) async throws {
        // TODO: integrate WebAuthnSwift — INSERT into passkey_credentials.
        logger.warning("PostgresPasskeyStore.saveCredential is a stub")
        throw PasskeyStoreError.backendUnavailable
    }

    public func loadCredentials(forUserId userId: String) async throws -> [PasskeyCredential] {
        // TODO: integrate WebAuthnSwift — SELECT * FROM passkey_credentials WHERE user_id = $1.
        logger.warning("PostgresPasskeyStore.loadCredentials is a stub")
        return []
    }

    public func updateSignatureCount(credentialId: Data, count: UInt32) async throws {
        // TODO: integrate WebAuthnSwift — UPDATE passkey_credentials SET signature_count = $1, last_used_at = NOW() WHERE credential_id = $2.
        logger.warning("PostgresPasskeyStore.updateSignatureCount is a stub")
        throw PasskeyStoreError.backendUnavailable
    }

    public func deleteCredential(credentialId: Data) async throws {
        // TODO: integrate WebAuthnSwift — DELETE FROM passkey_credentials WHERE credential_id = $1.
        logger.warning("PostgresPasskeyStore.deleteCredential is a stub")
        throw PasskeyStoreError.backendUnavailable
    }
}
