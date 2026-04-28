import Foundation
import DomainInterface

public protocol AssignDailyNicknameUseCase: Sendable {
    /// Returns a nickname valid through the current day. If the cached
    /// one has expired (or there isn't one), generates a fresh nickname.
    func callAsFunction() async throws -> Nickname
}

/// Generates a nickname locally from the adjective/animal banks until the
/// repository can fetch the server-anchored daily handle. The repository is
/// authoritative — this is purely a fallback for the offline first-launch path.
public struct DefaultAssignDailyNicknameUseCase: AssignDailyNicknameUseCase {
    public typealias Reading = @Sendable () async throws -> Nickname?
    public typealias Writing = @Sendable (Nickname) async throws -> Void

    private let read: Reading
    private let write: Writing
    private let clock: ClockProviding
    private let random: RandomGenerating
    private let calendar: Calendar

    public init(
        read: @escaping Reading,
        write: @escaping Writing,
        clock: ClockProviding,
        random: RandomGenerating,
        calendar: Calendar = NicknameKST.calendar
    ) {
        self.read = read
        self.write = write
        self.clock = clock
        self.random = random
        self.calendar = calendar
    }

    public func callAsFunction() async throws -> Nickname {
        let now = clock.now()
        if let cached = try await read(), cached.isValid(at: now) {
            return cached
        }
        let fresh = NicknameMinter.mint(at: now, calendar: calendar, random: random)
        try await write(fresh)
        return fresh
    }
}

/// Pure value-level helpers — separated so they can be unit-tested without a repo.
public enum NicknameKST {
    public static var calendar: Calendar {
        var c = Calendar(identifier: .gregorian)
        // "Asia/Seoul" is a fixed identifier; the Foundation tz database always
        // resolves it. Force-unwrap is safer than coercing to UTC silently.
        // swiftlint:disable:next force_unwrapping
        c.timeZone = TimeZone(identifier: "Asia/Seoul")!
        return c
    }

    /// Midnight (start of the day) and next midnight in KST for `instant`.
    /// `Calendar.date(byAdding:.day, value: 1)` only fails on absurd dates (e.g.
    /// `Date.distantFuture`); for any real `Date()` it always returns a value,
    /// so we deliberately force-unwrap.
    public static func dayBounds(of instant: Date, calendar: Calendar = calendar) -> (start: Date, end: Date) {
        let start = calendar.startOfDay(for: instant)
        // swiftlint:disable:next force_unwrapping
        let end = calendar.date(byAdding: .day, value: 1, to: start)!
        return (start, end)
    }
}

public enum NicknameMinter {
    /// Curated bank — same energy as the design copy ("노곤한사슴", "상쾌한수달").
    public static let adjectives: [String] = [
        "노곤한", "상쾌한", "깨어있는", "쉬는", "녹아내리는", "뽀송한", "포근한",
        "지친", "조용한", "꿀잠기원", "느긋한", "따뜻한", "은은한", "잠긴",
    ]
    public static let animals: [String] = [
        "사슴", "수달", "여우", "너구리", "고양이", "햄스터", "두루미",
        "판다", "라쿤", "토끼", "거북이", "올빼미", "까치", "오소리",
    ]

    public static func mint(
        at instant: Date,
        calendar: Calendar = NicknameKST.calendar,
        random: RandomGenerating
    ) -> Nickname {
        let (start, end) = NicknameKST.dayBounds(of: instant, calendar: calendar)
        let adj = adjectives[random.index(of: adjectives.count)]
        let ani = animals[random.index(of: animals.count)]
        let n = random.int(in: 0...0xFFFF)
        let tag = String(format: "%04X", n)
        return Nickname(value: adj + ani, tag: tag, issuedAt: start, expiresAt: end)
    }
}
