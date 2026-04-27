import Foundation

/// Inject this anywhere randomness affects user-visible behavior so tests can
/// pin the outcome. Use a real `SystemRandomGenerator` in production.
public protocol RandomGenerating: Sendable {
    func double(in range: ClosedRange<Double>) -> Double
    func int(in range: ClosedRange<Int>) -> Int
    /// Returns the chosen index. Caller picks the array element themselves so
    /// callers don't need to box generic element types into the protocol.
    func index(of count: Int) -> Int
}

public struct SystemRandomGenerator: RandomGenerating {
    public init() {}
    public func double(in range: ClosedRange<Double>) -> Double { .random(in: range) }
    public func int(in range: ClosedRange<Int>) -> Int { .random(in: range) }
    public func index(of count: Int) -> Int { Int.random(in: 0..<count) }
}

/// Deterministic generator for tests — cycles through a precomputed sequence.
public final class StubRandomGenerator: RandomGenerating, @unchecked Sendable {
    private var doubles: [Double]
    private var ints: [Int]
    public init(doubles: [Double] = [], ints: [Int] = []) {
        self.doubles = doubles
        self.ints = ints
    }
    public func double(in range: ClosedRange<Double>) -> Double {
        guard !doubles.isEmpty else { return range.lowerBound }
        let v = doubles.removeFirst()
        return min(max(v, range.lowerBound), range.upperBound)
    }
    public func int(in range: ClosedRange<Int>) -> Int {
        guard !ints.isEmpty else { return range.lowerBound }
        let v = ints.removeFirst()
        return min(max(v, range.lowerBound), range.upperBound)
    }
    public func index(of count: Int) -> Int {
        // swiftlint:disable:next empty_count
        guard count > 0 else { return 0 }
        guard !ints.isEmpty else { return 0 }
        let v = ints.removeFirst()
        return min(max(v, 0), count - 1)
    }
}
