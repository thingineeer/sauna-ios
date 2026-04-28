import Vapor
import Logging
@preconcurrency import PostgresKit

/// Boots Vapor application:
/// - HTTP server defaults
/// - PubSubBus selection (Redis if `REDIS_URL` reachable, else in-memory fallback with warning)
/// - Postgres pool (if `DATABASE_URL` reachable, used by PasskeyStore)
/// - PasskeyStore selection (Postgres if pool, else in-memory fallback)
/// - Route registration
///
/// PII rule (tech-stack-final §5): we never log message content. Only counts/error reasons.
public func configure(_ app: Application) async throws {
    // HTTP defaults — env wins, then code default. Tests can pre-set the
    // server configuration before calling `configure(_:)` to override.
    if let portEnv = Environment.get("PORT"), let port = Int(portEnv) {
        app.http.server.configuration.port = port
    }
    if let hostEnv = Environment.get("HOST") {
        app.http.server.configuration.hostname = hostEnv
    }

    // -------- PubSubBus wiring --------
    let bus: any PubSubBus
    if let redisURL = Environment.get("REDIS_URL") {
        do {
            bus = try await RedisPubSubBus.connect(
                urlString: redisURL,
                eventLoopGroup: app.eventLoopGroup,
                logger: app.logger
            )
            app.logger.info("PubSubBus: redis", metadata: ["url": .string(redactedRedis(redisURL))])
        } catch {
            app.logger.warning(
                "PubSubBus: redis unreachable, falling back to in-memory",
                metadata: ["reason": .string("\(error)")]
            )
            bus = InMemoryPubSubBus()
        }
    } else {
        app.logger.warning("PubSubBus: REDIS_URL unset, using in-memory bus (dev only)")
        bus = InMemoryPubSubBus()
    }
    app.storage[PubSubBusKey.self] = bus

    // -------- Postgres pool + PasskeyStore wiring --------
    let passkeyStore: any PasskeyStore = await wirePostgres(app)
    app.storage[PasskeyStoreKey.self] = passkeyStore

    // -------- Routes --------
    try routes(app)
}

/// Sets up the Postgres pool (if DATABASE_URL is set) and returns a
/// `PostgresPasskeyStore`. Falls back to `InMemoryPasskeyStore` otherwise so
/// the server still boots in offline dev — log a loud warning.
private func wirePostgres(_ app: Application) async -> any PasskeyStore {
    guard let urlString = Environment.get("DATABASE_URL") else {
        app.logger.warning("PostgresKit: DATABASE_URL unset, using in-memory PasskeyStore (dev only)")
        return InMemoryPasskeyStore()
    }
    guard let url = URL(string: urlString),
          let host = url.host else {
        app.logger.error("PostgresKit: DATABASE_URL malformed; falling back to in-memory")
        return InMemoryPasskeyStore()
    }
    let dbName = url.path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
    let username = url.user ?? "sauna"
    let port = url.port ?? SQLPostgresConfiguration.ianaPortNumber
    let configuration = SQLPostgresConfiguration(
        hostname: host,
        port: port,
        username: username,
        password: url.password,
        database: dbName,
        tls: .disable
    )
    let pool = EventLoopGroupConnectionPool(
        source: PostgresConnectionSource(sqlConfiguration: configuration),
        maxConnectionsPerEventLoop: 2,
        on: app.eventLoopGroup
    )
    app.storage[PostgresPoolKey.self] = PostgresPoolWrapper(pool: pool)

    let store = PostgresPasskeyStore(pool: pool, logger: app.logger)
    do {
        try await store.ensureSchema()
        app.logger.info("PostgresKit: pool up, schema ready", metadata: [
            "host": .string(host),
            "db": .string(dbName),
        ])
    } catch {
        app.logger.error("PostgresKit: schema bootstrap failed; in-memory fallback", metadata: [
            "reason": .string("\(error)"),
        ])
        return InMemoryPasskeyStore()
    }
    return store
}

/// `EventLoopGroupConnectionPool` is internally synchronized but not formally
/// `Sendable`. Wrap it in a sealed struct so Swift 6 strict concurrency stops
/// complaining about its storage in `app.storage`.
public struct PostgresPoolWrapper: @unchecked Sendable {
    public let pool: EventLoopGroupConnectionPool<PostgresConnectionSource>
    public init(pool: EventLoopGroupConnectionPool<PostgresConnectionSource>) {
        self.pool = pool
    }
}

private func redactedRedis(_ urlString: String) -> String {
    guard let url = URL(string: urlString),
          let host = url.host else { return "redis://?" }
    let port = url.port.map { ":\($0)" } ?? ""
    return "redis://\(host)\(port)"
}

/// Vapor `Storage` key for the bound PubSubBus.
public struct PubSubBusKey: StorageKey, Sendable {
    public typealias Value = any PubSubBus
}

/// Vapor `Storage` key for the bound PasskeyStore.
public struct PasskeyStoreKey: StorageKey, Sendable {
    public typealias Value = any PasskeyStore
}

/// Vapor `Storage` key for the bound Postgres pool. Optional — only present
/// when DATABASE_URL was reachable at boot.
public struct PostgresPoolKey: StorageKey, Sendable {
    public typealias Value = PostgresPoolWrapper
}

public extension Application {
    var pubSubBus: any PubSubBus {
        guard let bus = storage[PubSubBusKey.self] else {
            fatalError("PubSubBus not configured. Did configure(_:) run?")
        }
        return bus
    }
    var passkeyStore: any PasskeyStore {
        guard let s = storage[PasskeyStoreKey.self] else {
            fatalError("PasskeyStore not configured. Did configure(_:) run?")
        }
        return s
    }
}

public extension Request {
    var pubSubBus: any PubSubBus { application.pubSubBus }
    var passkeyStore: any PasskeyStore { application.passkeyStore }
}
