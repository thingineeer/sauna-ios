import Foundation

public enum TimeOfDay: String, CaseIterable, Sendable {
    case morning, evening, night

    /// Default copy + headcounts per time of day. Mirrors the JSX `data` block
    /// in `JjimHome`. The real implementation will replace this with live
    /// occupancy from the server, keeping the copy as a fallback when offline.
    public var snapshot: HomeSnapshot {
        switch self {
        case .morning:
            return .init(
                clock: "09:41",
                nickname: "상쾌한수달",
                daily: .init(head: 48, trend: 5,  density: "한산 · 숨고를만한 리듬"),
                stock: .init(head: 322, trend: 28, density: "장 시작 · 벌써 꽉 참"),
                job:   .init(head: 12, trend: -2, density: "적막 · 혼자 땀 흘리기 좋음")
            )
        case .evening:
            return .init(
                clock: "18:47",
                nickname: "노곤한사슴",
                daily: .init(head: 142, trend: 16,  density: "붐빔 · 퇴근 피크"),
                stock: .init(head: 88,  trend: -12, density: "장 마감 후 정리"),
                job:   .init(head: 67,  trend: 4,   density: "편안 · 자소서 얘기 많음")
            )
        case .night:
            return .init(
                clock: "03:28",
                nickname: "깨어있는여우",
                daily: .init(head: 8,  trend: -3, density: "적막 · 불면의 밤"),
                stock: .init(head: 3,  trend: 0,  density: "한두명 · 뉴욕장 구경"),
                job:   .init(head: 24, trend: 2,  density: "새벽조 · 발표 대기")
            )
        }
    }

    public static func from(hour: Int) -> TimeOfDay {
        switch hour {
        case 5..<11:  return .morning
        case 11..<22: return .evening
        default:      return .night
        }
    }
}

public struct HomeSnapshot: Equatable, Sendable {
    public struct RoomData: Equatable, Sendable {
        public let head: Int
        public let trend: Int
        public let density: String
        public init(head: Int, trend: Int, density: String) {
            self.head = head; self.trend = trend; self.density = density
        }
    }
    public let clock: String
    public let nickname: String
    public let daily: RoomData
    public let stock: RoomData
    public let job:   RoomData

    public init(clock: String, nickname: String,
                 daily: RoomData, stock: RoomData, job: RoomData) {
        self.clock = clock
        self.nickname = nickname
        self.daily = daily
        self.stock = stock
        self.job = job
    }
}
