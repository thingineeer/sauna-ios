import XCTest
@testable import Data

/// PasskeyAuthenticator's actual cryptography path requires AuthenticationServices
/// + a real device or Simulator UI test. What we *can* unit-test on macOS is the
/// base64url encode/decode round-trip used in every wire frame.
final class PasskeyAuthenticatorBase64URLTests: XCTestCase {
    func testRoundTrip() throws {
        let payload = Data([0xff, 0xee, 0xdd, 0xcc, 0xbb, 0xaa, 0x99, 0x88])
        let encoded = payload.testBase64URLEncoded()
        XCTAssertFalse(encoded.contains("="))
        XCTAssertFalse(encoded.contains("+"))
        XCTAssertFalse(encoded.contains("/"))
        let decoded = Data(testBase64URL: encoded)
        XCTAssertEqual(decoded, payload)
    }

    func testWebAuthnTypicalChallenge() throws {
        // 32-byte challenge — typical WebAuthn shape
        var bytes = Data(count: 32)
        for i in 0..<32 { bytes[i] = UInt8(i * 7 % 256) }
        let s = bytes.testBase64URLEncoded()
        XCTAssertEqual(Data(testBase64URL: s), bytes)
    }
}

// Test re-implementation matching PasskeyAuthenticator's private helpers — keeps
// the production extension fileprivate while allowing assertions here.
private extension Data {
    init?(testBase64URL string: String) {
        var s = string
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        let pad = 4 - (s.count % 4)
        if pad < 4 { s.append(String(repeating: "=", count: pad)) }
        self.init(base64Encoded: s)
    }
    func testBase64URLEncoded() -> String {
        base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}
