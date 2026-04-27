import Foundation

public protocol NetworkClient: Sendable {
    /// Decodes the response into `T`. Throws `NetworkError`.
    func request<T: Decodable & Sendable>(_ endpoint: Endpoint, as: T.Type) async throws -> T

    /// For endpoints with no decode target (status check / 204 No Content).
    func send(_ endpoint: Endpoint) async throws
}

public struct URLSessionNetworkClient: NetworkClient {
    private let session: URLSession
    private let decoder: JSONDecoder
    private let acceptableStatus: Range<Int>

    public init(
        session: URLSession = .shared,
        decoder: JSONDecoder = JSONDecoder(),
        acceptableStatus: Range<Int> = 200..<300
    ) {
        self.session = session
        self.decoder = decoder
        self.acceptableStatus = acceptableStatus
    }

    public func request<T: Decodable & Sendable>(_ endpoint: Endpoint, as: T.Type) async throws -> T {
        let (data, response) = try await perform(endpoint)
        try assertOK(response)
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw NetworkError.decoding(String(describing: error))
        }
    }

    public func send(_ endpoint: Endpoint) async throws {
        let (_, response) = try await perform(endpoint)
        try assertOK(response)
    }

    private func perform(_ endpoint: Endpoint) async throws -> (Data, URLResponse) {
        do {
            let req = try endpoint.makeRequest()
            return try await session.data(for: req)
        } catch let urlErr as URLError {
            throw NetworkError.transport(urlErr.localizedDescription)
        } catch let netErr as NetworkError {
            throw netErr
        } catch {
            throw NetworkError.transport(String(describing: error))
        }
    }

    private func assertOK(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse else {
            throw NetworkError.transport("Non-HTTP response")
        }
        guard acceptableStatus.contains(http.statusCode) else {
            throw NetworkError.statusCode(http.statusCode)
        }
    }
}
