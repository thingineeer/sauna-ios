import Foundation
import Logging
@preconcurrency import PostgresKit

/// `PasskeyStore` backed by Postgres.
///
/// Schema:
///
/// ```sql
/// CREATE TABLE IF NOT EXISTS passkey_credentials (
///     user_id          TEXT        NOT NULL,
///     credential_id    BYTEA       NOT NULL,
///     public_key_cose  BYTEA       NOT NULL,
///     signature_count  BIGINT      NOT NULL DEFAULT 0,
///     created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
///     last_used_at     TIMESTAMPTZ,
///     PRIMARY KEY (credential_id)
/// );
/// CREATE INDEX IF NOT EXISTS idx_passkey_user ON passkey_credentials(user_id);
/// ```
///
/// Sendability: `EventLoopGroupConnectionPool` is internally synchronized
/// but not formally `Sendable`; we mark the wrapper `@unchecked Sendable`.
public final class PostgresPasskeyStore: PasskeyStore, @unchecked Sendable {
    private let pool: EventLoopGroupConnectionPool<PostgresConnectionSource>
    private let logger: Logger

    public init(
        pool: EventLoopGroupConnectionPool<PostgresConnectionSource>,
        logger: Logger
    ) {
        self.pool = pool
        self.logger = logger
    }

    /// Idempotent — runs the schema DDL on every boot so the table is ready.
    public func ensureSchema() async throws {
        let ddl = """
            CREATE TABLE IF NOT EXISTS passkey_credentials (
                user_id          TEXT        NOT NULL,
                credential_id    BYTEA       NOT NULL,
                public_key_cose  BYTEA       NOT NULL,
                signature_count  BIGINT      NOT NULL DEFAULT 0,
                created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                last_used_at     TIMESTAMPTZ,
                PRIMARY KEY (credential_id)
            );
            CREATE INDEX IF NOT EXISTS idx_passkey_user ON passkey_credentials(user_id);
            """
        try await db().raw(SQLQueryString(ddl)).run().get()
    }

    public func saveCredential(_ credential: PasskeyCredential) async throws {
        let sql = """
            INSERT INTO passkey_credentials
              (user_id, credential_id, public_key_cose, signature_count, created_at, last_used_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (credential_id) DO NOTHING
            """
        do {
            try await db().raw(SQLQueryString(stringLiteral: sql))
                .run().get()
        } catch {
            // PostgresKit's parameter binding API is nuanced enough that we
            // perform an inline-bound insert via the typed builder for safety.
            try await fallbackInsert(credential)
        }
        _ = credential // suppress unused warning when fallback is used
    }

    public func loadCredentials(forUserId userId: String) async throws -> [PasskeyCredential] {
        let rows = try await db().raw("""
            SELECT user_id, credential_id, public_key_cose, signature_count,
                   created_at, last_used_at
              FROM passkey_credentials
             WHERE user_id = \(bind: userId)
            """)
            .all().get()
        return rows.compactMap { row in
            guard let uid = try? row.decode(column: "user_id", as: String.self),
                  let cred = try? row.decode(column: "credential_id", as: Data.self),
                  let pub = try? row.decode(column: "public_key_cose", as: Data.self),
                  let sigCount = try? row.decode(column: "signature_count", as: Int64.self),
                  let createdAt = try? row.decode(column: "created_at", as: Date.self) else {
                return nil
            }
            let lastUsedAt = try? row.decode(column: "last_used_at", as: Date.self)
            return PasskeyCredential(
                userId: uid,
                credentialId: cred,
                publicKeyCOSE: pub,
                signatureCount: UInt32(clamping: sigCount),
                createdAt: createdAt,
                lastUsedAt: lastUsedAt
            )
        }
    }

    public func updateSignatureCount(credentialId: Data, count: UInt32) async throws {
        try await db().raw("""
            UPDATE passkey_credentials
               SET signature_count = \(bind: Int64(count)),
                   last_used_at = NOW()
             WHERE credential_id = \(bind: credentialId)
            """)
            .run().get()
    }

    public func deleteCredential(credentialId: Data) async throws {
        try await db().raw("""
            DELETE FROM passkey_credentials
             WHERE credential_id = \(bind: credentialId)
            """)
            .run().get()
    }

    // MARK: - private

    private func db() -> any SQLDatabase {
        pool.pool(for: pool.eventLoopGroup.any())
            .database(logger: logger)
            .sql()
    }

    /// `raw(...)` with a `SQLQueryString` doesn't bind the way `raw("\(bind: …)")`
    /// inline interpolation does. This path is used when ON CONFLICT requires
    /// the structured insert to handle parameters explicitly.
    private func fallbackInsert(_ c: PasskeyCredential) async throws {
        try await db().raw("""
            INSERT INTO passkey_credentials
              (user_id, credential_id, public_key_cose, signature_count, created_at, last_used_at)
            VALUES (\(bind: c.userId), \(bind: c.credentialId), \(bind: c.publicKeyCOSE),
                    \(bind: Int64(c.signatureCount)), \(bind: c.createdAt), \(bind: c.lastUsedAt))
            ON CONFLICT (credential_id) DO NOTHING
            """)
            .run().get()
    }
}
