// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "SaunaPackage",
    defaultLocalization: "ko",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "SaunaApp",          targets: ["SaunaApp"]),
        .library(name: "Domain",            targets: ["Domain"]),
        .library(name: "DomainInterfaces",  targets: ["DomainInterfaces"]),
        .library(name: "Data",              targets: ["Data"]),
        .library(name: "NetworkCore",       targets: ["NetworkCore"]),
        .library(name: "DesignSystem",      targets: ["DesignSystem"]),
        .library(name: "CustomIcons",       targets: ["CustomIcons"]),
        .library(name: "PixelMascot",       targets: ["PixelMascot"]),
        .library(name: "SharedUI",          targets: ["SharedUI"]),
        .library(name: "WebViewBridge",     targets: ["WebViewBridge"]),
        .library(name: "Observability",     targets: ["Observability"]),
        .library(name: "FeatureOnboarding", targets: ["FeatureOnboarding"]),
        .library(name: "FeatureHome",       targets: ["FeatureHome"]),
        .library(name: "FeatureRoom",       targets: ["FeatureRoom"]),
        .library(name: "FeatureMe",         targets: ["FeatureMe"]),
    ],
    dependencies: [
        // Sentry-Cocoa: 에러 / 크래시 / breadcrumb 보고. iOS 17+ 지원.
        .package(url: "https://github.com/getsentry/sentry-cocoa", from: "8.36.0"),
    ],
    targets: [
        // ── Pure ────────────────────────────────────────────────────────
        .target(name: "Domain"),
        .target(name: "DomainInterfaces", dependencies: ["Domain"]),

        // ── Infra ──────────────────────────────────────────────────────
        .target(name: "NetworkCore"),
        .target(name: "Data", dependencies: [
            "Domain", "DomainInterfaces", "NetworkCore",
        ]),

        // ── UI primitives ──────────────────────────────────────────────
        .target(name: "DesignSystem"),
        .target(name: "CustomIcons", dependencies: ["DesignSystem"]),
        .target(name: "PixelMascot"),
        .target(name: "SharedUI", dependencies: [
            "DesignSystem", "CustomIcons", "PixelMascot",
        ]),
        .target(name: "WebViewBridge", dependencies: ["DesignSystem"]),

        // ── Observability ──────────────────────────────────────────────
        .target(name: "Observability", dependencies: [
            .product(name: "Sentry", package: "sentry-cocoa"),
        ]),

        // ── Features ───────────────────────────────────────────────────
        .target(name: "FeatureOnboarding", dependencies: [
            "Domain", "DomainInterfaces",
            "DesignSystem", "CustomIcons", "PixelMascot", "SharedUI",
        ]),
        .target(name: "FeatureHome", dependencies: [
            "Domain", "DomainInterfaces",
            "DesignSystem", "CustomIcons", "PixelMascot", "SharedUI",
        ]),
        .target(name: "FeatureRoom", dependencies: [
            "Domain", "DomainInterfaces",
            "DesignSystem", "CustomIcons", "PixelMascot", "SharedUI",
        ]),
        .target(name: "FeatureMe", dependencies: [
            "Domain", "DomainInterfaces",
            "DesignSystem", "CustomIcons", "PixelMascot", "SharedUI",
            "WebViewBridge",
        ]),

        // ── Composition root ───────────────────────────────────────────
        .target(name: "SaunaApp", dependencies: [
            "Domain", "DomainInterfaces", "Data", "NetworkCore",
            "DesignSystem", "CustomIcons", "PixelMascot", "SharedUI",
            "WebViewBridge", "Observability",
            "FeatureOnboarding", "FeatureHome", "FeatureRoom", "FeatureMe",
        ]),

        // ── Tests ──────────────────────────────────────────────────────
        .testTarget(name: "DomainTests",            dependencies: ["Domain", "DomainInterfaces"]),
        .testTarget(name: "DataTests",              dependencies: ["Data", "DomainInterfaces", "NetworkCore"]),
        .testTarget(name: "DesignSystemTests",      dependencies: ["DesignSystem"]),
        .testTarget(name: "PixelMascotTests",       dependencies: ["PixelMascot"]),
        .testTarget(name: "SharedUITests",          dependencies: ["SharedUI"]),
        .testTarget(name: "FeatureOnboardingTests", dependencies: ["FeatureOnboarding"]),
        .testTarget(name: "FeatureHomeTests",       dependencies: ["FeatureHome"]),
        .testTarget(name: "FeatureRoomTests",       dependencies: ["FeatureRoom"]),
        .testTarget(name: "FeatureMeTests",         dependencies: ["FeatureMe"]),
        .testTarget(name: "ObservabilityTests",     dependencies: ["Observability"]),
    ]
)
