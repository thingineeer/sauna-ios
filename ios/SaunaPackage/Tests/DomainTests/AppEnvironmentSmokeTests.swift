// AppEnvironment lives in SaunaApp; we can't import it from here without
// inventing a circular test target. Keep this file as a placeholder until we
// add SaunaAppTests. The smoke check below verifies the underlying URL
// parsing assumption that AppEnvironment makes.
import XCTest

final class URLDefaultStringsParseTests: XCTestCase {
    func testHTTPDefaultURL() {
        let url = URL(string: "http://localhost:8080")
        XCTAssertNotNil(url)
        XCTAssertEqual(url?.host, "localhost")
        XCTAssertEqual(url?.port, 8080)
    }

    func testWebSocketDefaultURL() {
        let url = URL(string: "ws://localhost:8080")
        XCTAssertNotNil(url)
        XCTAssertEqual(url?.scheme, "ws")
    }
}
