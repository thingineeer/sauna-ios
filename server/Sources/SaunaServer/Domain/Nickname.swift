import Foundation

/// Server-issued nickname for a user, valid until next KST midnight.
///
/// Source of truth is the daily nickname re-issuance job (tech-stack-final §1.5):
/// `nickname = deterministic(seed: userId + dateKST)`.
/// This struct is the wire shape only — the issuer lives elsewhere.
public struct Nickname: Codable, Sendable, Hashable {
    public let value: String
    /// Epoch millis at which this nickname expires (next KST midnight).
    public let expiresAtMillis: Int64

    public init(value: String, expiresAtMillis: Int64) {
        self.value = value
        self.expiresAtMillis = expiresAtMillis
    }
}
