import Foundation

/// Pre-canned mock messages used by the Room demo simulator.
/// Mirrors `ROOM_BANK` in `lib/jjim-screens-main.jsx`. Real data arrives from
/// the WebSocket repo; this bank powers offline previews + UI tests.
public struct RoomMessageBankEntry: Sendable, Equatable {
    public let nickname: String
    public let text: String
}

public enum RoomMessageBank {
    public static let entries: [RoomMessageBankEntry] = [
        .init(nickname: "녹아내리는수달", text: "하 여기 앉으니까 어깨가 녹는다"),
        .init(nickname: "뽀송한너구리", text: "하루가 땀으로 빠져나가는 느낌"),
        .init(nickname: "쉬는고양이", text: "눈 감고 있으면 시간 멈춰"),
        .init(nickname: "포근한햄스터", text: "몸이 따뜻해지니까 마음도 말랑해"),
        .init(nickname: "지친여우", text: "오늘 진짜 힘들었다…"),
        .init(nickname: "조용한두루미", text: "말 없이 같이 땀 흘리는 것도 좋네"),
        .init(nickname: "꿀잠기원", text: "여기 나오면 잘 잘 수 있어"),
        .init(nickname: "노곤한사슴", text: "아 이 온기에 중독됐다"),
    ]
}
