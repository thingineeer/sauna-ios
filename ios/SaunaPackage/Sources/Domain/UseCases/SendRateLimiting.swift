import Foundation

/// Enforces "1초당 N개" client-side. Returns retry-after if the call should be
/// rejected; nil means the call is permitted and recorded.
public protocol SendRateLimiting: Sendable {
    func checkAndRecord(at now: Date) -> TimeInterval?
}

/// Sliding window: at most `maxBurst` calls in any rolling `window` seconds.
public final class SlidingWindowRateLimiter: SendRateLimiting, @unchecked Sendable {
    private let maxBurst: Int
    private let window: TimeInterval
    private var timestamps: [Date] = []
    private let lock = NSLock()

    public init(maxBurst: Int = 2, window: TimeInterval = 1.0) {
        precondition(maxBurst >= 1, "maxBurst must be >= 1")
        precondition(window > 0,    "window must be positive")
        self.maxBurst = maxBurst
        self.window = window
    }

    public func checkAndRecord(at now: Date) -> TimeInterval? {
        lock.lock(); defer { lock.unlock() }
        let cutoff = now.addingTimeInterval(-window)
        timestamps.removeAll { $0 < cutoff }
        if timestamps.count >= maxBurst {
            // Soonest-expiring entry tells us when a new send becomes legal.
            let oldest = timestamps[0]
            let retry = window - now.timeIntervalSince(oldest)
            return max(retry, 0.001)
        }
        timestamps.append(now)
        return nil
    }
}
