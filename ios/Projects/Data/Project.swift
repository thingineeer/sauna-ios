import ProjectDescription
import ProjectDescriptionHelpers

let project = Project(
    name: "Data",
    organizationName: "thingineeer",
    targets: [
        .target(
            name: "Data",
            destinations: SaunaConstants.destinations,
            product: .staticFramework,
            bundleId: "\(SaunaConstants.bundleIdPrefix).Data",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Sources/**"],
            dependencies: [
                .sauna(.domainInterface),
                .sauna(.domain),
                .sauna(.networkCore),
            ]
        ),
        .target(
            name: "DataTests",
            destinations: SaunaConstants.destinations,
            product: .unitTests,
            bundleId: "\(SaunaConstants.bundleIdPrefix).DataTests",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Tests/**"],
            dependencies: [
                .target(name: "Data"),
                .sauna(.networkCore),
            ]
        ),
    ],
    schemes: [
        .scheme(
            name: "Data",
            shared: true,
            buildAction: .buildAction(targets: [.target("Data")]),
            testAction: .targets([.testableTarget(target: .target("DataTests"))]),
            runAction: .runAction(executable: nil)
        ),
    ]
)
