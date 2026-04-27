import Vapor

/// `GET /health` — liveness/readiness probe.
///
/// Returns a small JSON object suitable for the Dockerfile healthcheck and
/// for ECS target group health checks (tech-stack-final §3.2).
public struct HealthController: RouteCollection, Sendable {
    /// Server semantic version. Bumped manually per release.
    public static let version = "0.1.0"

    public init() {}

    public func boot(routes: RoutesBuilder) throws {
        routes.get("health", use: index)
    }

    @Sendable
    func index(_ req: Request) async throws -> HealthResponse {
        HealthResponse(ok: true, version: Self.version)
    }
}

public struct HealthResponse: Content, Equatable, Sendable {
    public let ok: Bool
    public let version: String

    public init(ok: Bool, version: String) {
        self.ok = ok
        self.version = version
    }
}
