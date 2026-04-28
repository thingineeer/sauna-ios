import Foundation
#if canImport(Sentry)
import Sentry
#endif

/// Observability surface — abstract over the underlying SDK so production /
/// preview / tests can swap impls. Concretely backed by Sentry on iOS, no-op
/// in tests.
///
/// **Privacy:** Sauna's product DNA is "메시지 영속 0". The default config
/// strips `request.body`, `response.body`, and any breadcrumb whose category
/// is `chat.message`. Crashes report stack traces only, no message content.
public protocol ObservabilitySink: Sendable {
    func start(dsn: String, environment: String, release: String)
    func capture(message: String, level: ObservabilityLevel)
    func capture(error: Error, additionalContext: [String: String])
    func breadcrumb(category: String, message: String, level: ObservabilityLevel)
    func setUser(anonymousId: String)
    func clearUser()
}

public enum ObservabilityLevel: String, Sendable {
    case debug, info, warning, error, fatal
}

public enum Observability {
    nonisolated(unsafe) public private(set) static var shared: ObservabilitySink = NoopSink()

    public static func install(_ sink: ObservabilitySink) {
        shared = sink
    }

    /// Boot Sentry if available, else fall through to no-op. Safe to call
    /// when DSN is `nil` (preview / unit test).
    public static func bootstrap(
        dsn: String?,
        environment: String,
        release: String
    ) {
        guard let dsn, !dsn.isEmpty else {
            install(NoopSink())
            return
        }
        #if canImport(Sentry)
        let sink = SentrySink()
        sink.start(dsn: dsn, environment: environment, release: release)
        install(sink)
        #else
        install(NoopSink())
        #endif
    }
}

// ─── No-op sink ───────────────────────────────────────────────────────

public final class NoopSink: ObservabilitySink, @unchecked Sendable {
    public init() {}
    public func start(dsn: String, environment: String, release: String) {}
    public func capture(message: String, level: ObservabilityLevel) {}
    public func capture(error: Error, additionalContext: [String: String]) {}
    public func breadcrumb(category: String, message: String, level: ObservabilityLevel) {}
    public func setUser(anonymousId: String) {}
    public func clearUser() {}
}

// ─── Sentry sink ──────────────────────────────────────────────────────

#if canImport(Sentry)
public final class SentrySink: ObservabilitySink, @unchecked Sendable {
    public init() {}

    public func start(dsn: String, environment: String, release: String) {
        SentrySDK.start { options in
            options.dsn = dsn
            options.environment = environment
            options.releaseName = release
            options.attachStacktrace = true
            options.enableAutoPerformanceTracing = false  // 채팅 동시성 노이즈 차단
            options.enableMetricKit = true
            options.enableSwizzling = false               // 우리 modules 가 명시적으로 보고
            options.maxBreadcrumbs = 50
            options.beforeBreadcrumb = { breadcrumb in
                // 채팅 발화 카테고리는 절대 보고에 포함 안 됨.
                if breadcrumb.category == "chat.message" { return nil }
                return breadcrumb
            }
            options.beforeSend = { event in
                // SentryRequest 는 body 자체를 저장하지 않음. cookies/headers
                // 만 제거하면 메시지 텍스트가 새지 않음.
                event.request?.cookies = nil
                event.request?.headers = nil
                return event
            }
        }
    }

    public func capture(message: String, level: ObservabilityLevel) {
        SentrySDK.capture(message: message)
    }

    public func capture(error: Error, additionalContext: [String: String]) {
        SentrySDK.capture(error: error) { scope in
            for (k, v) in additionalContext { scope.setTag(value: v, key: k) }
        }
    }

    public func breadcrumb(category: String, message: String, level: ObservabilityLevel) {
        let crumb = Breadcrumb()
        crumb.category = category
        crumb.message = message
        crumb.level = level.toSentry
        SentrySDK.addBreadcrumb(crumb)
    }

    public func setUser(anonymousId: String) {
        let user = User()
        user.userId = anonymousId
        SentrySDK.setUser(user)
    }

    public func clearUser() {
        SentrySDK.setUser(nil)
    }
}

private extension ObservabilityLevel {
    var toSentry: SentryLevel {
        switch self {
        case .debug:   return .debug
        case .info:    return .info
        case .warning: return .warning
        case .error:   return .error
        case .fatal:   return .fatal
        }
    }
}
#endif
