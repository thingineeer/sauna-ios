import Foundation

/// Mirror of iOS Domain `Room`.
///
/// Three rooms are global, fixed, and named at compile time:
/// - `daily` 일상 황토방
/// - `stock` 주식 황토방
/// - `job`   취준 황토방
///
/// Season rooms (`SHOULD` in PRD §6) are out of scope for v1.
public enum RoomKind: String, Codable, Sendable, CaseIterable, Hashable {
    case daily
    case stock
    case job

    /// Human-readable Korean label (display only — server does not localize, this is for diagnostics).
    public var label: String {
        switch self {
        case .daily: return "일상 황토방"
        case .stock: return "주식 황토방"
        case .job:   return "취준 황토방"
        }
    }

    /// Validates a path component as a room kind.
    public static func parse(_ raw: String) -> RoomKind? {
        RoomKind(rawValue: raw)
    }
}
