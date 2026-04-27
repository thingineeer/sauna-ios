import XCTest
@testable import Domain

final class SendMessageUseCaseTests: XCTestCase {
    func testEmptyTextRejectedBeforeRepoCalled() async {
        let repo = SpyRepo()
        let sut = makeSUT(repo: repo)
        await assertThrows(SendMessageError.empty) {
            try await sut("   ", to: .daily)
        }
        XCTAssertEqual(repo.sent, [])
    }

    func testTrimsWhitespaceBeforeForwarding() async throws {
        let repo = SpyRepo()
        let sut = makeSUT(repo: repo)
        try await sut("  안녕  ", to: .daily)
        XCTAssertEqual(repo.sent, [SpyRepo.Sent(text: "안녕", room: .daily)])
    }

    func testTooLongRejected() async {
        let repo = SpyRepo()
        let sut = makeSUT(repo: repo)
        let body = String(repeating: "가", count: 241)
        await assertThrows(SendMessageError.tooLong(limit: 240)) {
            try await sut(body, to: .daily)
        }
        XCTAssertEqual(repo.sent, [])
    }

    func testRateLimitedBubblesUp() async throws {
        let repo = SpyRepo()
        let limiter = StubLimiter(retryAfter: 0.4)
        let sut = makeSUT(repo: repo, limiter: limiter)
        await assertThrows(SendMessageError.rateLimited(retryAfter: 0.4)) {
            try await sut("hi", to: .stock)
        }
        XCTAssertEqual(repo.sent, [], "rate-limited send must not hit the repo")
    }

    func testRepoFailureWrapped() async {
        let repo = SpyRepo()
        repo.shouldFail = true
        let sut = makeSUT(repo: repo)
        do {
            try await sut("hi", to: .job)
            XCTFail("expected throw")
        } catch let error as SendMessageError {
            switch error {
            case .downstream: break
            default: XCTFail("expected .downstream, got \(error)")
            }
        } catch {
            XCTFail("expected SendMessageError, got \(error)")
        }
    }

    // MARK: - Helpers

    private func makeSUT(
        repo: SpyRepo,
        limiter: SendRateLimiting = StubLimiter(retryAfter: nil)
    ) -> DefaultSendMessageUseCase<SpyRepo> {
        DefaultSendMessageUseCase(repo: repo, clock: FixedClock(.distantPast), limiter: limiter)
    }

    final class SpyRepo: SendDelegating, @unchecked Sendable {
        struct Sent: Equatable { let text: String; let room: Room.Kind }
        var sent: [Sent] = []
        var shouldFail = false
        func send(_ text: String, to room: Room.Kind) async throws {
            if shouldFail { throw NSError(domain: "spy", code: 1) }
            sent.append(.init(text: text, room: room))
        }
    }

    struct StubLimiter: SendRateLimiting {
        let retryAfter: TimeInterval?
        func checkAndRecord(at now: Date) -> TimeInterval? { retryAfter }
    }

    private func assertThrows<E: Error & Equatable>(
        _ expected: E,
        file: StaticString = #filePath, line: UInt = #line,
        _ block: () async throws -> Void
    ) async {
        do {
            try await block()
            XCTFail("expected throw of \(expected)", file: file, line: line)
        } catch let e as E {
            XCTAssertEqual(e, expected, file: file, line: line)
        } catch {
            XCTFail("expected \(E.self), got \(error)", file: file, line: line)
        }
    }
}
