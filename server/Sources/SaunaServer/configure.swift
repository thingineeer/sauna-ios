import Vapor
import Logging

/// Boots Vapor application:
/// - HTTP server defaults
/// - PubSubBus selection (Redis if `REDIS_URL` reachable, else in-memory fallback with warning)
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
            app.logger.info("PubSubBus: redis", metadata: ["url": .string(redacted(redisURL))])
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

    // -------- Routes --------
    try routes(app)
}

// Strip credentials from a redis URL before logging.
private func redacted(_ urlString: String) -> String {
    guard let url = URL(string: urlString),
          let host = url.host else { return "redis://?" }
    let port = url.port.map { ":\($0)" } ?? ""
    return "redis://\(host)\(port)"
}

/// Vapor `Storage` key for the bound PubSubBus.
public struct PubSubBusKey: StorageKey, Sendable {
    public typealias Value = any PubSubBus
}

public extension Application {
    var pubSubBus: any PubSubBus {
        guard let bus = storage[PubSubBusKey.self] else {
            fatalError("PubSubBus not configured. Did configure(_:) run?")
        }
        return bus
    }
}

public extension Request {
    var pubSubBus: any PubSubBus { application.pubSubBus }
}
