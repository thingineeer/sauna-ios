// swift-tools-version:6.0
import PackageDescription

let package = Package(
    name: "SaunaServer",
    platforms: [
        .macOS(.v14),
    ],
    products: [
        .executable(name: "SaunaServer", targets: ["SaunaServer"]),
    ],
    dependencies: [
        // HTTP server
        .package(url: "https://github.com/vapor/vapor.git", from: "4.92.0"),
        // Postgres (Passkey credentials only — never messages)
        .package(url: "https://github.com/vapor/postgres-kit.git", from: "2.13.0"),
        // Redis pub/sub + presence
        .package(url: "https://github.com/swift-server/RediStack.git", from: "1.6.2"),
        // APNs (push) — used in later phase, declared now so executable links cleanly
        .package(url: "https://github.com/swift-server-community/APNSwift.git", from: "5.0.0"),
    ],
    targets: [
        .executableTarget(
            name: "SaunaServer",
            dependencies: [
                .product(name: "Vapor", package: "vapor"),
                .product(name: "PostgresKit", package: "postgres-kit"),
                .product(name: "RediStack", package: "RediStack"),
                .product(name: "APNS", package: "APNSwift"),
            ],
            swiftSettings: swiftSettings
        ),
        .testTarget(
            name: "SaunaServerTests",
            dependencies: [
                .target(name: "SaunaServer"),
                .product(name: "XCTVapor", package: "vapor"),
            ],
            swiftSettings: swiftSettings
        ),
    ]
)

var swiftSettings: [SwiftSetting] {
    [
        // Swift 6 strict concurrency — required by tech-stack-final §2.1
        .enableExperimentalFeature("StrictConcurrency"),
    ]
}
