import Foundation

public enum MascotPose: String, Sendable, CaseIterable {
    case idle, doze, peek, drink, eat, sweat, soak
}

public enum MascotTone: String, Sendable {
    case warm, cool
}

/// 16×16 sprite library — mirrors `SPRITES_16` in `lib/pixel-mascot.jsx`.
public enum Sprites16 {

    /// Lookup helper. Falls back to `idle_warm` on unknown combos.
    public static func grid(pose: MascotPose, tone: MascotTone) -> [String] {
        let key = "\(pose.rawValue)_\(tone.rawValue)"
        // `idle_warm` is provided in the bank below — force-unwrap is safe and
        // a missing entry would be a programmer error worth a crash in debug.
        // swiftlint:disable:next force_unwrapping
        return store[key] ?? store["idle_warm"]!
    }

    private static let store: [String: [String]] = [
        "idle_warm": idleWarm,
        "doze_warm": dozeWarm,
        "peek_warm": peekWarm,
        "soak_cool": soakCool,
        "drink_warm": drinkWarm,
        "eat_warm": eatWarm,
        "sweat_warm": sweatWarm,
    ]

    static let idleWarm: [String] = [
        "................",
        "......kkkk......",
        "....kktTtkk.....",
        "...ktTtTtok.....",
        "...kToTtTtk.....",
        "...kktTtTkk.....",
        "..kbgggggbk.....",
        ".kbggGGGggbk....",
        "kbggGGGGGggbk...",
        "kbgGGppGppGgbk..",
        "kbgGkk..kkGgbk..",
        "kbggGGwwGGgbk...",
        "kbgggGGGGgggbk..",
        ".kbbgggggbbk....",
        "..kkbbbbbkk.....",
        "....kkkk........",
    ]

    static let dozeWarm: [String] = [
        "..............z.",
        "......kkkk....z.",
        "....kktTtkk..z..",
        "...ktTtTtok.z...",
        "...kToTtTtk.....",
        "...kktTtTkk.....",
        "..kbgggggbk.....",
        ".kbggGGGggbk....",
        "kbggGGGGGggbk...",
        "kbgGGkkGkkGgbk..",
        "kbgGGppGppGgbk..",
        "kbggGGwwGGgbk...",
        "kbgggGGGGgggbk..",
        ".kbbgggggbbk....",
        "..kkbbbbbkk.....",
        "....kkkk........",
    ]

    static let peekWarm: [String] = [
        "................",
        "......kkkk......",
        "....kktTtkk.....",
        "...ktTtTtok.....",
        "...kToTtTtk.....",
        "...kktTtTkk.....",
        "..kbgggggbk.....",
        ".kbggGGGggbk....",
        "kbggGGGGGggbk...",
        "kbgGkWkGkWkgbk..",
        "kbgGppppppGgbk..",
        "kbggGGwwGGgbk...",
        "kbgggGGGGgggbk..",
        ".kbbgggggbbk....",
        "..kkbbbbbkk.....",
        "....kkkk........",
    ]

    static let soakCool: [String] = [
        "................",
        "......kkkk......",
        "....kktTtkk.....",
        "...ktTtTtck.....",
        "...kTcTtTtk.....",
        "...kktTtTkk.....",
        "..kbgggggbk.....",
        ".kbggGGGggbk....",
        "wbggGGGGGggbw...",
        "wbgGGppGppGgbw..",
        "VvVwwVwVwwVwwV..",
        "vwwVwwwVwwwVwv..",
        "wVwvwVvwwvVwww..",
        "vVwvwwVwwvVwwV..",
        "wwVvwwVwwwvVww..",
        "VwwwVvwwVwwvww..",
    ]

    static let drinkWarm: [String] = [
        "................",
        "......kkkk......",
        "....kktTtkk.....",
        "...ktTtTtok.....",
        "...kToTtTtk.....",
        "...kktTtTkk.....",
        "..kbgggggbk.lLl.",
        ".kbggGGGggbklSil",
        "kbggGGGGGggbkSsl",
        "kbgGGppGppGglssl",
        "kbgGkk..kkGglssl",
        "kbggGGwwGGgblssl",
        "kbgggGGGGgggblll",
        ".kbbgggggbbk....",
        "..kkbbbbbkk.....",
        "....kkkk........",
    ]

    static let eatWarm: [String] = [
        "................",
        "......kkkk......",
        "....kktTtkk.....",
        "...ktTtTtok.....",
        "...kToTtTtk.....",
        "...kktTtTkk.....",
        "..kbgggggbk.kk..",
        ".kbggGGGggbkeEk.",
        "kbggGGGGGggbkek.",
        "kbgGGppGppGgkdk.",
        "kbgG..oo..GgGk..",
        "kbggGGooGGgbk...",
        "kbgggGGGGgggbk..",
        ".kbbgggggbbk....",
        "..kkbbbbbkk.....",
        "....kkkk........",
    ]

    static let sweatWarm: [String] = [
        "...........V....",
        "......kkkk.V....",
        "....kktTtkkV....",
        "...ktTtTtok.....",
        "...kToTtTtk.....",
        "...kktTtTkk.....",
        "..kbgggggbk.....",
        ".kbggGGGggbk....",
        "kbggGGGGGggbk...",
        "kbgGGkkGkkGgbk..",
        "kbgGGppGppGgbk..",
        "kbggGGwwGGgbk...",
        "kbgggGGGGgggbk..",
        ".kbbgggggbbk....",
        "..kkbbbbbkk.....",
        "....kkkk........",
    ]
}

/// 32×32 sprite — only `idle_warm` is provided in the design (per the JSX).
public enum Sprites32 {
    public static func grid(pose: MascotPose, tone: MascotTone) -> [String]? {
        let key = "\(pose.rawValue)_\(tone.rawValue)"
        return store[key]
    }

    private static let store: [String: [String]] = [
        "idle_warm": idleWarm,
    ]

    static let idleWarm: [String] = [
        "................................",
        "................................",
        "............kkkkkkkk............",
        "..........kkttTTttkkk...........",
        ".........kttTTTTTTttok..........",
        "........ktTTToooTTTTtok.........",
        "........kTTooOOoooTTTtk.........",
        "........kTToOOOoooTTTTk.........",
        "........kkTTToooTTTTkk..........",
        ".........kkTTTTTTkkk............",
        "......kkkbgggggggbkkk...........",
        "....kkbggggGGGGGGggggbkk........",
        "..kkbgggGGGGGGGGGGGGggbkk.......",
        ".kbggggGGGGGGGGGGGGGGgggbk......",
        "kbggggGGGGGGGGGGGGGGGGggbbk.....",
        "kbgggGGGGppppGGppppGGGGgggbk....",
        "kbggGGGGGppppGGppppGGGGGGgbk....",
        "kbggGGGGGGkkkGGkkkGGGGGGGgbk....",
        "kbggGGGGGGkkWGGkkWGGGGGGGgbk....",
        "kbggGGGGGGGGGGGGGGGGGGGGGgbk....",
        "kbggGGGGGGGGwwwwGGGGGGGGGgbk....",
        "kbggGGGGGGGGGwwGGGGGGGGGggbk....",
        ".kbggGGGGGGGGGGGGGGGGGGGgbk.....",
        ".kbgggGGGGGGGGGGGGGGGGgggbk.....",
        "..kbgggggGGGGGGGGGGGgggggbk.....",
        "...kkbggggggggggggggggbbkk......",
        ".....kkbbbbggggggggbbbkk........",
        "........kkkkbbbbbkkkk...........",
        "............kkkkk...............",
        "................................",
        "................................",
        "................................",
    ]
}
