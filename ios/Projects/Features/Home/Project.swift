import ProjectDescription
import ProjectDescriptionHelpers

let project = Project(
    name: "FeatureHome",
    organizationName: "thingineeer",
    targets: [
        .target(
            name: "FeatureHome",
            destinations: SaunaConstants.destinations,
            product: .staticFramework,
            bundleId: "\(SaunaConstants.bundleIdPrefix).FeatureHome",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Sources/**"],
            dependencies: [
                .sauna(.domainInterface),
                .sauna(.designSystem),
                .sauna(.customIcons),
                .sauna(.pixelMascot),
                .sauna(.sharedUI),
            ]
        ),
        .target(
            name: "FeatureHomeTests",
            destinations: SaunaConstants.destinations,
            product: .unitTests,
            bundleId: "\(SaunaConstants.bundleIdPrefix).FeatureHomeTests",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Tests/**"],
            dependencies: [.target(name: "FeatureHome")]
        ),
    ],
    schemes: [
        .scheme(
            name: "FeatureHome",
            shared: true,
            buildAction: .buildAction(targets: [.target("FeatureHome")]),
            testAction: .targets([.testableTarget(target: .target("FeatureHomeTests"))]),
            runAction: .runAction(executable: nil)
        ),
    ]
)
