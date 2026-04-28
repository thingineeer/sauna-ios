import Foundation

/// Minimal WebSocket abstraction. The room repository drives this — it sends
/// "send" frames and receives "message" frames, both as plain UTF-8 JSON.
public protocol WebSocketClient: Sendable {
    func connect(_ url: URL, headers: [String: String]) async throws
    func send(_ text: String) async throws
    /// Live stream of inbound text frames. Stream finishes when the socket closes.
    func messages() async -> AsyncStream<String>
    func close() async
}

/// `URLSession.webSocketTask`-backed implementation. Reconnect logic is
/// intentionally not in here — that belongs to the repository.
public actor URLSessionWebSocketClient: WebSocketClient {
    private let session: URLSession
    private var task: URLSessionWebSocketTask?
    private var continuation: AsyncStream<String>.Continuation?

    public init(session: URLSession = .shared) {
        self.session = session
    }

    public func connect(_ url: URL, headers: [String: String]) async throws {
        var req = URLRequest(url: url)
        for (k, v) in headers { req.setValue(v, forHTTPHeaderField: k) }
        let task = session.webSocketTask(with: req)
        self.task = task
        task.resume()
        Task { [weak self] in await self?.receiveLoop(task) }
    }

    public func send(_ text: String) async throws {
        guard let t = task else { throw NetworkError.transport("not connected") }
        try await t.send(.string(text))
    }

    public func messages() async -> AsyncStream<String> {
        AsyncStream { cont in
            self.continuation = cont
        }
    }

    public func close() async {
        let t = task
        continuation?.finish()
        continuation = nil
        task = nil
        t?.cancel(with: .normalClosure, reason: nil)
    }

    private func receiveLoop(_ task: URLSessionWebSocketTask) async {
        while true {
            do {
                let msg = try await task.receive()
                switch msg {
                case .string(let s):
                    continuation?.yield(s)
                case .data(let d):
                    if let s = String(data: d, encoding: .utf8) { continuation?.yield(s) }
                @unknown default: break
                }
            } catch {
                continuation?.finish()
                continuation = nil
                return
            }
        }
    }
}
