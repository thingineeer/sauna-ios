import Foundation

public struct Nickname: Equatable, Sendable {
    public let value: String     // e.g. "노곤한사슴"
    public let tag: String       // e.g. "4F29" (4-char hex)
    public let issuedAt: Date    // 자정 KST 발급
    public let expiresAt: Date   // 다음 자정 KST

    public init(value: String, tag: String, issuedAt: Date, expiresAt: Date) {
        self.value = value
        self.tag = tag
        self.issuedAt = issuedAt
        self.expiresAt = expiresAt
    }

    public var displayHandle: String { "\(value)#\(tag)" }

    public func isValid(at instant: Date) -> Bool {
        instant >= issuedAt && instant < expiresAt
    }
}
