import XCTest
import DomainInterface
@testable import Domain

final class AssignDailyNicknameUseCaseTests: XCTestCase {
    func testReturnsCachedWhenStillValid() async throws {
        let now = ymd(2026, 4, 28, hour: 12)
        let cached = Nickname(
            value: "노곤한사슴", tag: "4F29",
            issuedAt: ymd(2026, 4, 28, hour: 0),
            expiresAt: ymd(2026, 4, 29, hour: 0)
        )
        let storage = MutableStorage(cached: cached)
        let sut = DefaultAssignDailyNicknameUseCase(
            read:  { await storage.read() },
            write: { await storage.write($0) },
            clock: FixedClock(now),
            random: StubRandomGenerator(),
            calendar: NicknameKST.calendar
        )

        let got = try await sut()
        XCTAssertEqual(got, cached)
        let writes = await storage.writes
        XCTAssertEqual(writes, 0, "valid cache should not be rewritten")
    }

    func testMintsNewWhenCacheExpired() async throws {
        let now = ymd(2026, 4, 28, hour: 1)
        let stale = Nickname(
            value: "어제이름", tag: "0001",
            issuedAt: ymd(2026, 4, 27, hour: 0),
            expiresAt: ymd(2026, 4, 28, hour: 0)
        )
        let storage = MutableStorage(cached: stale)
        let random = StubRandomGenerator(
            doubles: [],
            // adjective[2]=깨어있는, animal[3]=너구리, hex 0xABCD = 43981
            ints: [2, 3, 43981]
        )
        let sut = DefaultAssignDailyNicknameUseCase(
            read:  { await storage.read() },
            write: { await storage.write($0) },
            clock: FixedClock(now),
            random: random,
            calendar: NicknameKST.calendar
        )

        let fresh = try await sut()
        XCTAssertEqual(fresh.value, "깨어있는너구리")
        XCTAssertEqual(fresh.tag, "ABCD")
        let writes = await storage.writes
        XCTAssertEqual(writes, 1)
        let written = await storage.lastWritten
        XCTAssertEqual(written, fresh)
    }

    func testMintedNicknameSpansFullKSTDay() {
        let now = ymd(2026, 4, 28, hour: 13)
        let random = StubRandomGenerator(ints: [0, 0, 0])
        let n = NicknameMinter.mint(at: now, random: random)
        // KST midnight ↔ next KST midnight
        XCTAssertEqual(n.issuedAt, ymd(2026, 4, 28, hour: 0))
        XCTAssertEqual(n.expiresAt, ymd(2026, 4, 29, hour: 0))
    }

    // MARK: - helpers

    private actor MutableStorage {
        var cached: Nickname?
        var writes = 0
        var lastWritten: Nickname?
        init(cached: Nickname?) { self.cached = cached }
        func read() async -> Nickname? { cached }
        func write(_ n: Nickname) async { writes += 1; lastWritten = n; cached = n }
    }

    private func ymd(_ y: Int, _ m: Int, _ d: Int, hour: Int) -> Date {
        var c = DateComponents()
        c.timeZone = TimeZone(identifier: "Asia/Seoul")
        c.year = y; c.month = m; c.day = d; c.hour = hour
        return NicknameKST.calendar.date(from: c)!
    }
}
