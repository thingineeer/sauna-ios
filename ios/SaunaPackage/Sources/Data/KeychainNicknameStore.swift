import Foundation
import Domain
import DomainInterfaces

/// Persists today's nickname so the app survives a relaunch without forcing a
/// reroll. The Keychain is the right home (small encrypted blob, survives app
/// reinstall on the same device).
public final class KeychainNicknameStore: NicknameRepository, @unchecked Sendable {
    public typealias KeychainAccessor = @Sendable (KeychainOp) async throws -> Data?

    public enum KeychainOp: Sendable {
        case read(service: String, account: String)
        case write(service: String, account: String, data: Data)
        case delete(service: String, account: String)
    }

    private let service: String
    private let account: String
    private let accessor: KeychainAccessor
    private let clock: ClockProviding
    private let random: RandomGenerating

    public init(
        service: String = "Sauna",
        account: String = "today.nickname",
        accessor: @escaping KeychainAccessor = LiveKeychain.access,
        clock: ClockProviding = SystemClock(),
        random: RandomGenerating = SystemRandomGenerator()
    ) {
        self.service = service
        self.account = account
        self.accessor = accessor
        self.clock = clock
        self.random = random
    }

    public func currentNickname() async throws -> Nickname {
        if let cached = try await readCached(), cached.isValid(at: clock.now()) {
            return cached
        }
        let fresh = NicknameMinter.mint(at: clock.now(), random: random)
        try await writeCached(fresh)
        return fresh
    }

    public func reroll() async throws -> Nickname {
        let fresh = NicknameMinter.mint(at: clock.now(), random: random)
        try await writeCached(fresh)
        return fresh
    }

    // MARK: - private

    private func readCached() async throws -> Nickname? {
        guard let data = try await accessor(.read(service: service, account: account)) else { return nil }
        return try? JSONDecoder().decode(StoredNickname.self, from: data).asDomain()
    }

    private func writeCached(_ n: Nickname) async throws {
        let data = try JSONEncoder().encode(StoredNickname(n))
        _ = try await accessor(.write(service: service, account: account, data: data))
    }
}

private struct StoredNickname: Codable {
    let value: String
    let tag: String
    let issuedAt: Date
    let expiresAt: Date

    init(_ n: Nickname) {
        self.value = n.value
        self.tag = n.tag
        self.issuedAt = n.issuedAt
        self.expiresAt = n.expiresAt
    }

    func asDomain() -> Nickname {
        Nickname(value: value, tag: tag, issuedAt: issuedAt, expiresAt: expiresAt)
    }
}

#if canImport(Security) && !os(Linux)
import Security

/// Real Keychain accessor. Used in production via the default initializer.
public enum LiveKeychain {
    public static func access(_ op: KeychainNicknameStore.KeychainOp) throws -> Data? {
        switch op {
        case .read(let service, let account):
            let query: [String: Any] = [
                kSecClass as String:       kSecClassGenericPassword,
                kSecAttrService as String: service,
                kSecAttrAccount as String: account,
                kSecReturnData as String:  true,
                kSecMatchLimit as String:  kSecMatchLimitOne,
            ]
            var item: CFTypeRef?
            let status = SecItemCopyMatching(query as CFDictionary, &item)
            if status == errSecItemNotFound { return nil }
            guard status == errSecSuccess else { throw KeychainError(status) }
            return item as? Data

        case .write(let service, let account, let data):
            // Delete existing first so write is idempotent.
            let baseQuery: [String: Any] = [
                kSecClass as String:       kSecClassGenericPassword,
                kSecAttrService as String: service,
                kSecAttrAccount as String: account,
            ]
            SecItemDelete(baseQuery as CFDictionary)
            var addQuery = baseQuery
            addQuery[kSecValueData as String] = data
            addQuery[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly
            let status = SecItemAdd(addQuery as CFDictionary, nil)
            guard status == errSecSuccess else { throw KeychainError(status) }
            return nil

        case .delete(let service, let account):
            let query: [String: Any] = [
                kSecClass as String:       kSecClassGenericPassword,
                kSecAttrService as String: service,
                kSecAttrAccount as String: account,
            ]
            let status = SecItemDelete(query as CFDictionary)
            if status == errSecSuccess || status == errSecItemNotFound { return nil }
            throw KeychainError(status)
        }
    }
}

public struct KeychainError: Error, CustomStringConvertible {
    public let status: OSStatus
    public init(_ status: OSStatus) { self.status = status }
    public var description: String { "KeychainError(\(status))" }
}
#endif
