import SwiftUI

/// 24-color SNES-style palette + sentinel for transparency.
/// Mirrors `PIXEL_PALETTE` in `lib/pixel-mascot.jsx`.
public enum PixelPalette {
    /// Returns the color for a single sprite character. `nil` = transparent.
    public static func color(for ch: Character) -> Color? {
        switch ch {
        case ".": return nil
        case "k": return Color(red: 0.102, green: 0.078, blue: 0.063)         // #1a1410 outline
        case "B": return Color(red: 0.165, green: 0.133, blue: 0.094)         // #2a2218 body shadow
        case "b": return Color(red: 0.353, green: 0.310, blue: 0.267)         // #5a4f44 body mid
        case "g": return Color(red: 0.659, green: 0.627, blue: 0.604)         // #a8a09a body light gray
        case "G": return Color(red: 0.847, green: 0.824, blue: 0.800)         // #d8d2cc highlight
        case "W": return Color(red: 0.996, green: 0.976, blue: 0.941)         // #fef9f0 white highlight
        case "t": return Color(red: 0.957, green: 0.894, blue: 0.769)         // #f4e4c4 towel base
        case "T": return Color(red: 0.996, green: 0.961, blue: 0.859)         // #fef5db towel highlight
        case "o": return Color(red: 0.910, green: 0.439, blue: 0.188)         // #e87030 towel orange
        case "O": return Color(red: 1.000, green: 0.659, blue: 0.376)         // #ffa860 towel orange hi
        case "c": return Color(red: 0.353, green: 0.722, blue: 0.784)         // #5ab8c8 towel cyan
        case "C": return Color(red: 0.533, green: 0.867, blue: 0.910)         // #88dde8 towel cyan hi
        case "p": return Color(red: 0.957, green: 0.659, blue: 0.565)         // #f4a890 blush pink
        case "P": return Color(red: 1.000, green: 0.533, blue: 0.439)         // #ff8870 blush deep
        case "s": return Color(red: 0.910, green: 0.722, blue: 0.376)         // #e8b860 sikhye amber
        case "S": return Color(red: 1.000, green: 0.847, blue: 0.565)         // #ffd890 sikhye hi
        case "i": return Color(red: 0.996, green: 0.976, blue: 0.941)         // #fef9f0 ice
        case "l": return Color(red: 0.659, green: 0.596, blue: 0.439)         // #a89870 glass dark
        case "L": return Color(red: 0.847, green: 0.784, blue: 0.627)         // #d8c8a0 glass light
        case "e": return Color(red: 0.784, green: 0.588, blue: 0.416)         // #c8966a egg shell
        case "E": return Color(red: 0.910, green: 0.722, blue: 0.565)         // #e8b890 egg hi
        case "d": return Color(red: 0.439, green: 0.251, blue: 0.125)         // #704020 egg dark
        case "m": return Color(red: 1.000, green: 0.980, blue: 0.922).opacity(0.85) // steam light
        case "M": return Color(red: 1.000, green: 0.980, blue: 0.922).opacity(0.55) // steam mid
        case "w": return Color(red: 0.227, green: 0.541, blue: 0.541)         // #3a8a8a water
        case "V": return Color(red: 0.416, green: 0.722, blue: 0.722)         // #6ab8b8 water hi
        case "v": return Color(red: 0.118, green: 0.353, blue: 0.353)         // #1e5a5a water dark
        case "r": return Color(red: 0.541, green: 0.227, blue: 0.125)         // #8a3a20 egg deep
        case "y": return Color(red: 1.000, green: 0.941, blue: 0.502)         // #fff080 sparkle
        case "z": return Color(red: 0.659, green: 0.565, blue: 0.847)         // #a890d8 zZz purple
        default:  return nil
        }
    }
}
