import Foundation

public struct Endpoint: Sendable {
    public enum Method: String, Sendable {
        case GET, POST, PUT, DELETE, PATCH
    }

    public let baseURL: URL
    public let path: String       // e.g. "/auth/passkey/register/begin"
    public let method: Method
    public let headers: [String: String]
    public let queryItems: [URLQueryItem]
    public let body: Data?

    public init(
        baseURL: URL,
        path: String,
        method: Method = .GET,
        headers: [String: String] = [:],
        queryItems: [URLQueryItem] = [],
        body: Data? = nil
    ) {
        self.baseURL = baseURL
        self.path = path
        self.method = method
        self.headers = headers
        self.queryItems = queryItems
        self.body = body
    }

    public func makeRequest() throws -> URLRequest {
        guard var components = URLComponents(url: baseURL.appendingPathComponent(path),
                                                resolvingAgainstBaseURL: false) else {
            throw NetworkError.invalidURL
        }
        if !queryItems.isEmpty { components.queryItems = queryItems }
        guard let url = components.url else { throw NetworkError.invalidURL }
        var req = URLRequest(url: url)
        req.httpMethod = method.rawValue
        for (k, v) in headers { req.setValue(v, forHTTPHeaderField: k) }
        req.httpBody = body
        return req
    }
}

public enum NetworkError: Error, Equatable {
    case invalidURL
    case transport(String)
    case statusCode(Int)
    case decoding(String)
}
