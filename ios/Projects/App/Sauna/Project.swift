import ProjectDescription
import ProjectDescriptionHelpers

let project = Project(
    name: "Sauna",
    organizationName: "thingineeer",
    settings: .settings(
        configurations: [
            .debug(name: "Debug", xcconfig: "Configs/Sauna.Debug.xcconfig"),
            .release(name: "Release", xcconfig: "Configs/Sauna.Release.xcconfig"),
        ]
    ),
    targets: [
        .target(
            name: "Sauna",
            destinations: SaunaConstants.destinations,
            product: .app,
            bundleId: SaunaConstants.appBundleId,
            deploymentTargets: SaunaConstants.deploymentTargets,
            infoPlist: .file(path: "Info.plist"),
            sources: ["Sources/**"],
            resources: ["Resources/**"],
            entitlements: "Sauna.entitlements",
            dependencies: [
                .sauna(.domain),
                .sauna(.domainInterface),
                .sauna(.domainTesting),
                .sauna(.data),
                .sauna(.networkCore),
                .sauna(.designSystem),
                .sauna(.customIcons),
                .sauna(.pixelMascot),
                .sauna(.sharedUI),
                .sauna(.webViewBridge),
                .sauna(.observability),
                .sauna(.featureOnboarding),
                .sauna(.featureHome),
                .sauna(.featureRoom),
                .sauna(.featureMe),
            ],
            settings: .settings(base: [
                "SWIFT_STRICT_CONCURRENCY": "complete",
                "TARGETED_DEVICE_FAMILY": "1",
                "MARKETING_VERSION": .string(SaunaConstants.marketingVersion),
                "CURRENT_PROJECT_VERSION": "1",
            ])
        ),
        .target(
            name: "SaunaTests",
            destinations: SaunaConstants.destinations,
            product: .unitTests,
            bundleId: "\(SaunaConstants.bundleIdPrefix).SaunaTests",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Tests/**"],
            dependencies: [.target(name: "Sauna")]
        ),
    ]
)
