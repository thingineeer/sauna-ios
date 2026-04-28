import Foundation

/// Inject this everywhere `Date()` would be — keeps tests deterministic.
public protocol ClockProviding: Sendable {
    func now() -> Date
}

public struct SystemClock: ClockProviding {
    public init() {}
    public func now() -> Date { Date() }
}

/// Test clock — caller controls "now".
public final class FixedClock: ClockProviding, @unchecked Sendable {
    private var _now: Date
    public init(_ now: Date) { self._now = now }
    public func now() -> Date { _now }
    public func advance(by seconds: TimeInterval) { _now = _now.addingTimeInterval(seconds) }
    public func set(_ d: Date) { _now = d }
}
