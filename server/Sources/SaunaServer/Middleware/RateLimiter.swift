import Foundation
import Vapor

/// Per-user fixed-window rate limiter — stub.
///
/// Spec (tech-stack-final §2.3, §8 open issue):
/// > 발화 1초 2개 / 같은 텍스트 5초 1개
///
/// This is the "1초 2개" half. Same-text de-dupe (5-second window) is
/// deferred to a later commit when we have a hash-based deduper that
/// stays PII-clean (compare hashes of normalized text, never log content).
///
/// Storage: in-memory actor for now. In production we'll move counters to
/// Redis (`INCR room:rate:<userId>` with TTL = window size) so that they
/// survive horizontal scale-out across Fargate tasks.
public actor RateLimiter {
    public struct Verdict: Sendable, Equatable {
        public let allowed: Bool
        /// Number of requests counted in the current window (after this call).
        public let usage: Int
        /// Window capacity.
        public let capacity: Int
    }

    private struct Window {
        var startMillis: Int64
        var count: Int
    }

    private var windows: [String: Window] = [:]

    /// Maximum allowed events per `windowMillis`.
    public let capacity: Int
    /// Window length in milliseconds.
    public let windowMillis: Int64
    /// Clock injection for deterministic tests.
    private let now: @Sendable () -> Int64

    public init(
        capacity: Int = 2,
        windowMillis: Int64 = 1_000,
        now: @Sendable @escaping () -> Int64 = {
            Int64(Date().timeIntervalSince1970 * 1_000)
        }
    ) {
        self.capacity = capacity
        self.windowMillis = windowMillis
        self.now = now
    }

    /// Records an event for `userId`; returns whether it is allowed.
    public func check(userId: String) -> Verdict {
        let t = now()
        if var w = windows[userId], t - w.startMillis < windowMillis {
            w.count += 1
            windows[userId] = w
            return Verdict(allowed: w.count <= capacity, usage: w.count, capacity: capacity)
        }
        windows[userId] = Window(startMillis: t, count: 1)
        return Verdict(allowed: 1 <= capacity, usage: 1, capacity: capacity)
    }

    /// For tests: drop all state.
    public func reset() {
        windows.removeAll(keepingCapacity: false)
    }
}
