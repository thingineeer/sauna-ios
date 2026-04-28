import Foundation

/// Resolves runtime configuration. Reads from `Info.plist` first, falls back
/// to env vars, then to safe local defaults. Lets QA/dev/prod switch endpoints
/// without recompiling.
public struct AppEnvironment: Sendable {
    public let httpBaseURL: URL
    public let wsBaseURL: URL
    public let sentryDSN: String?
    public let useStubRoom: Bool

    public init(
        httpBaseURL: URL,
        wsBaseURL: URL,
        sentryDSN: String? = nil,
        useStubRoom: Bool = false
    ) {
        self.httpBaseURL = httpBaseURL
        self.wsBaseURL = wsBaseURL
        self.sentryDSN = sentryDSN
        self.useStubRoom = useStubRoom
    }

    /// Production / TestFlight default. Looks for keys in Info.plist:
    /// - `SAUNA_HTTP_BASE_URL` (e.g., "https://api.sauna.app")
    /// - `SAUNA_WS_BASE_URL`   (e.g., "wss://api.sauna.app")
    /// - `SAUNA_SENTRY_DSN`
    /// - `SAUNA_USE_STUB_ROOM` (Bool — flip to "1" in DEBUG to bypass server)
    public static func fromBundle(_ bundle: Bundle = .main) -> AppEnvironment {
        let http = bundle.urlString(forKey: "SAUNA_HTTP_BASE_URL") ?? "http://localhost:8080"
        let ws = bundle.urlString(forKey: "SAUNA_WS_BASE_URL") ?? "ws://localhost:8080"
        let dsn = bundle.stringEnv(forKey: "SAUNA_SENTRY_DSN")
        let stubR = bundle.boolEnv(forKey: "SAUNA_USE_STUB_ROOM") ?? false
        return AppEnvironment(
            // swiftlint:disable:next force_unwrapping
            httpBaseURL: URL(string: http)!,
            // swiftlint:disable:next force_unwrapping
            wsBaseURL:   URL(string: ws)!,
            sentryDSN:   dsn,
            useStubRoom: stubR
        )
    }

    /// Used by SwiftUI previews and unit tests — points at a non-routable host
    /// so any accidental network call fails fast.
    public static let preview = AppEnvironment(
        // swiftlint:disable:next force_unwrapping
        httpBaseURL: URL(string: "https://preview.invalid")!,
        // swiftlint:disable:next force_unwrapping
        wsBaseURL:   URL(string: "wss://preview.invalid")!,
        sentryDSN:   nil,
        useStubRoom: true
    )
}

private extension Bundle {
    func stringEnv(forKey key: String) -> String? {
        if let v = object(forInfoDictionaryKey: key) as? String, !v.isEmpty { return v }
        if let v = ProcessInfo.processInfo.environment[key], !v.isEmpty { return v }
        return nil
    }
    func urlString(forKey key: String) -> String? { stringEnv(forKey: key) }
    func boolEnv(forKey key: String) -> Bool? {
        guard let s = stringEnv(forKey: key) else { return nil }
        switch s.lowercased() {
        case "1", "true", "yes": return true
        case "0", "false", "no": return false
        default: return nil
        }
    }
}
