import Foundation

public struct Room: Equatable, Identifiable, Sendable {
    public enum Kind: String, CaseIterable, Codable, Sendable {
        case daily, stock, job
    }
    public enum Crowd: String, Equatable, Sendable {
        case lonely, medium, packed
    }
    public let id: Kind
    public let label: String
    public let subtitle: String
    public let occupancy: Int
    public let crowd: Crowd

    public init(id: Kind, label: String, subtitle: String, occupancy: Int, crowd: Crowd) {
        self.id = id
        self.label = label
        self.subtitle = subtitle
        self.occupancy = occupancy
        self.crowd = crowd
    }

    /// Density bucket derived from headcount. Single source of truth for crowd
    /// classification — all density-driven UI variants (mascot pose, message
    /// spawn rate, color hot dot) read from the result of this function.
    public static func crowd(forHeadcount n: Int) -> Crowd {
        switch n {
        case ..<30:    return .lonely
        case 30..<200: return .medium
        default:       return .packed
        }
    }
}
