import XCTest
@testable import NetworkCore

final class EndpointTests: XCTestCase {
    func testGETBuildsCorrectURLAndHeaders() throws {
        let e = Endpoint(
            // swiftlint:disable:next force_unwrapping
            baseURL: URL(string: "https://api.sauna.app")!,
            path: "/health",
            method: .GET,
            headers: ["X-Client": "iOS/0.1.0"],
            queryItems: [URLQueryItem(name: "verbose", value: "1")]
        )
        let req = try e.makeRequest()
        XCTAssertEqual(req.url?.scheme, "https")
        XCTAssertEqual(req.url?.host, "api.sauna.app")
        XCTAssertEqual(req.url?.path, "/health")
        XCTAssertEqual(req.url?.query, "verbose=1")
        XCTAssertEqual(req.httpMethod, "GET")
        XCTAssertEqual(req.value(forHTTPHeaderField: "X-Client"), "iOS/0.1.0")
    }

    func testPOSTCarriesBody() throws {
        let body = #"{"hello":"world"}"#.data(using: .utf8)
        let e = Endpoint(
            // swiftlint:disable:next force_unwrapping
            baseURL: URL(string: "https://api.sauna.app")!,
            path: "/auth/passkey/register/begin",
            method: .POST,
            headers: ["Content-Type": "application/json"],
            body: body
        )
        let req = try e.makeRequest()
        XCTAssertEqual(req.httpMethod, "POST")
        XCTAssertEqual(req.httpBody, body)
        XCTAssertEqual(req.value(forHTTPHeaderField: "Content-Type"), "application/json")
    }
}

final class URLSessionNetworkClientTests: XCTestCase {

    override func setUp() {
        super.setUp()
        URLProtocol.registerClass(MockURLProtocol.self)
        MockURLProtocol.reset()
    }

    override func tearDown() {
        URLProtocol.unregisterClass(MockURLProtocol.self)
        super.tearDown()
    }

    private func makeClient() -> URLSessionNetworkClient {
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [MockURLProtocol.self]
        return URLSessionNetworkClient(session: URLSession(configuration: config))
    }

    private struct Echo: Decodable, Equatable {
        let ok: Bool
        let version: String
    }

    func testDecodesSuccessJSON() async throws {
        MockURLProtocol.stub = MockURLProtocol.Stub(
            statusCode: 200,
            // swiftlint:disable:next force_unwrapping
            data: #"{"ok":true,"version":"0.1.0"}"#.data(using: .utf8)!
        )
        let client = makeClient()
        let endpoint = Endpoint(
            // swiftlint:disable:next force_unwrapping
            baseURL: URL(string: "https://api.test")!, path: "/health"
        )
        let response: Echo = try await client.request(endpoint, as: Echo.self)
        XCTAssertEqual(response, Echo(ok: true, version: "0.1.0"))
    }

    func testThrowsOnNon2xx() async {
        MockURLProtocol.stub = MockURLProtocol.Stub(statusCode: 500, data: Data())
        let client = makeClient()
        let endpoint = Endpoint(
            // swiftlint:disable:next force_unwrapping
            baseURL: URL(string: "https://api.test")!, path: "/health"
        )
        do {
            try await client.send(endpoint)
            XCTFail("expected throw")
        } catch let e as NetworkError {
            XCTAssertEqual(e, .statusCode(500))
        } catch {
            XCTFail("wrong error type: \(error)")
        }
    }

    func testThrowsOnDecodeFailure() async {
        MockURLProtocol.stub = MockURLProtocol.Stub(
            statusCode: 200,
            // swiftlint:disable:next force_unwrapping
            data: "not-json".data(using: .utf8)!
        )
        let client = makeClient()
        let endpoint = Endpoint(
            // swiftlint:disable:next force_unwrapping
            baseURL: URL(string: "https://api.test")!, path: "/health"
        )
        do {
            _ = try await client.request(endpoint, as: Echo.self)
            XCTFail("expected throw")
        } catch let e as NetworkError {
            switch e {
            case .decoding: break
            default: XCTFail("expected .decoding got \(e)")
            }
        } catch {
            XCTFail("wrong error type: \(error)")
        }
    }
}

// MARK: - MockURLProtocol --------------------------------------------------

final class MockURLProtocol: URLProtocol, @unchecked Sendable {
    struct Stub {
        let statusCode: Int
        let data: Data
    }

    nonisolated(unsafe) static var stub: Stub?

    static func reset() { stub = nil }

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        guard let stub = MockURLProtocol.stub,
              // swiftlint:disable:next force_unwrapping
              let response = HTTPURLResponse(url: request.url!, statusCode: stub.statusCode,
                                              httpVersion: nil, headerFields: nil)
        else {
            client?.urlProtocol(self,
                didFailWithError: NSError(domain: "MockURLProtocol", code: -1))
            return
        }
        client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: stub.data)
        client?.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}
}
