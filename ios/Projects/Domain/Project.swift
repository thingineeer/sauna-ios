import ProjectDescription
import ProjectDescriptionHelpers

// Domain 프로젝트 — TMA 의 4 target (Interface / Source / Testing / Tests).
// 모든 Feature 가 의존하는 root protocol layer.

let project = Project(
    name: "Domain",
    organizationName: "thingineeer",
    targets: [
        .target(
            name: "DomainInterface",
            destinations: SaunaConstants.destinations,
            product: .staticFramework,
            bundleId: "\(SaunaConstants.bundleIdPrefix).DomainInterface",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Interface/**"],
            dependencies: []
        ),
        .target(
            name: "Domain",
            destinations: SaunaConstants.destinations,
            product: .staticFramework,
            bundleId: "\(SaunaConstants.bundleIdPrefix).Domain",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Sources/**"],
            dependencies: [.target(name: "DomainInterface")]
        ),
        .target(
            name: "DomainTesting",
            destinations: SaunaConstants.destinations,
            product: .staticFramework,
            bundleId: "\(SaunaConstants.bundleIdPrefix).DomainTesting",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Testing/**"],
            // Stub 구현이 NicknameMinter 같은 Domain 헬퍼를 사용해 Domain 까지 의존.
            // TMA 핵심은 'Feature 가 다른 Feature impl 을 의존하지 말 것' —
            // Domain 안에서의 의존은 OK.
            dependencies: [
                .target(name: "DomainInterface"),
                .target(name: "Domain"),
            ]
        ),
        .target(
            name: "DomainTests",
            destinations: SaunaConstants.destinations,
            product: .unitTests,
            bundleId: "\(SaunaConstants.bundleIdPrefix).DomainTests",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Tests/**"],
            dependencies: [
                .target(name: "Domain"),
                .target(name: "DomainInterface"),
                .target(name: "DomainTesting"),
            ]
        ),
    ],
    schemes: [
        .scheme(
            name: "Domain",
            shared: true,
            buildAction: .buildAction(targets: [.target("Domain")]),
            testAction: .targets([.testableTarget(target: .target("DomainTests"))]),
            runAction: .runAction(executable: nil)
        ),
    ]
)
