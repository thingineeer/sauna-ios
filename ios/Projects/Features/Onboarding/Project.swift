import ProjectDescription
import ProjectDescriptionHelpers

let project = Project(
    name: "FeatureOnboarding",
    organizationName: "thingineeer",
    targets: [
        .target(
            name: "FeatureOnboarding",
            destinations: SaunaConstants.destinations,
            product: .staticFramework,
            bundleId: "\(SaunaConstants.bundleIdPrefix).FeatureOnboarding",
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
            name: "FeatureOnboardingTests",
            destinations: SaunaConstants.destinations,
            product: .unitTests,
            bundleId: "\(SaunaConstants.bundleIdPrefix).FeatureOnboardingTests",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Tests/**"],
            dependencies: [.target(name: "FeatureOnboarding")]
        ),
    ],
    schemes: [
        .scheme(
            name: "FeatureOnboarding",
            shared: true,
            buildAction: .buildAction(targets: [.target("FeatureOnboarding")]),
            testAction: .targets([.testableTarget(target: .target("FeatureOnboardingTests"))]),
            runAction: .runAction(executable: nil)
        ),
    ]
)
