import ProjectDescription
import ProjectDescriptionHelpers

let project = Project(
    name: "FeatureMe",
    organizationName: "thingineeer",
    targets: [
        .target(
            name: "FeatureMe",
            destinations: SaunaConstants.destinations,
            product: .staticFramework,
            bundleId: "\(SaunaConstants.bundleIdPrefix).FeatureMe",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Sources/**"],
            dependencies: [
                .sauna(.domainInterface),
                .sauna(.designSystem),
                .sauna(.customIcons),
                .sauna(.pixelMascot),
                .sauna(.sharedUI),
                .sauna(.webViewBridge),
            ]
        ),
        .target(
            name: "FeatureMeTests",
            destinations: SaunaConstants.destinations,
            product: .unitTests,
            bundleId: "\(SaunaConstants.bundleIdPrefix).FeatureMeTests",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Tests/**"],
            dependencies: [.target(name: "FeatureMe")]
        ),
    ],
    schemes: [
        .scheme(
            name: "FeatureMe",
            shared: true,
            buildAction: .buildAction(targets: [.target("FeatureMe")]),
            testAction: .targets([.testableTarget(target: .target("FeatureMeTests"))]),
            runAction: .runAction(executable: nil)
        ),
    ]
)
