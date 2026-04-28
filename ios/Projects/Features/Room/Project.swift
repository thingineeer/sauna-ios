import ProjectDescription
import ProjectDescriptionHelpers

let project = Project(
    name: "FeatureRoom",
    organizationName: "thingineeer",
    targets: [
        .target(
            name: "FeatureRoom",
            destinations: SaunaConstants.destinations,
            product: .staticFramework,
            bundleId: "\(SaunaConstants.bundleIdPrefix).FeatureRoom",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Sources/**"],
            dependencies: [
                .sauna(.domain),
                .sauna(.domainInterface),
                .sauna(.designSystem),
                .sauna(.customIcons),
                .sauna(.pixelMascot),
                .sauna(.sharedUI),
            ]
        ),
        .target(
            name: "FeatureRoomTests",
            destinations: SaunaConstants.destinations,
            product: .unitTests,
            bundleId: "\(SaunaConstants.bundleIdPrefix).FeatureRoomTests",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Tests/**"],
            dependencies: [
                .target(name: "FeatureRoom"),
                .sauna(.domain),
            ]
        ),
    ],
    schemes: [
        .scheme(
            name: "FeatureRoom",
            shared: true,
            buildAction: .buildAction(targets: [.target("FeatureRoom")]),
            testAction: .targets([.testableTarget(target: .target("FeatureRoomTests"))]),
            runAction: .runAction(executable: nil)
        ),
    ]
)
