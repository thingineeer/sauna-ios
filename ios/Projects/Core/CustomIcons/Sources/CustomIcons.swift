import SwiftUI

/// Module marker. Individual icons live in their own files (`IcSaunaMark.swift`,
/// `IcDaily.swift`, …). All conform to `JjimIcon`.
public enum CustomIcons {
    public static let strokeWidth: CGFloat = 1.6
    public static let canvas: CGFloat = 24
}

/// Every icon renders into a 24-unit grid with `currentColor`-style tinting via
/// the foreground color. Size + color are the only knobs from the call site —
/// matches the design's `IcSomething size=22 color="currentColor"` API.
public protocol JjimIcon: View {
    var size: CGFloat { get }
}
