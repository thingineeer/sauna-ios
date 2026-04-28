import ProjectDescription

/// TMA-style Project 생성 헬퍼.
///
/// 한 모듈 = 한 Project. 그 안에 Source / Interface / Tests / Testing / Example
/// 다섯 target 까지 자유롭게 조합. 보통 Core 류는 Source + Tests 만, Feature 는
/// Source + Interface + Tests + Example, Domain 은 Interface + Source + Testing + Tests.
///
/// Tuist 4 의 Project DSL 을 한 단계 추상화해서 모듈마다 같은 boilerplate 를
/// 반복하지 않게 만든다.
public extension Project {

    // MARK: - 단일 라이브러리 (Core 류)

    /// 라이브러리 1개 + 테스트 1개. DesignSystem / CustomIcons 같은 자족 모듈.
    static func library(
        name: String,
        bundleId: String? = nil,
        sources: SourceFilesList = ["Sources/**"],
        resources: ResourceFileElements? = nil,
        dependencies: [TargetDependency] = [],
        testSources: SourceFilesList? = "Tests/**",
        testDependencies: [TargetDependency] = [],
        product: Product = .staticFramework
    ) -> Project {
        var targets: [Target] = [
            .target(
                name: name,
                destinations: SaunaConstants.destinations,
                product: product,
                bundleId: bundleId ?? "\(SaunaConstants.bundleIdPrefix).\(name)",
                deploymentTargets: SaunaConstants.deploymentTargets,
                sources: sources,
                resources: resources,
                dependencies: dependencies
            ),
        ]
        if let testSources {
            targets.append(.target(
                name: "\(name)Tests",
                destinations: SaunaConstants.destinations,
                product: .unitTests,
                bundleId: "\(SaunaConstants.bundleIdPrefix).\(name)Tests",
                deploymentTargets: SaunaConstants.deploymentTargets,
                sources: testSources,
                dependencies: [.target(name: name)] + testDependencies
            ))
        }
        // 명시적 scheme — Tuist 4 의 자동 scheme 이 testable 비어있어 xcodebuild test
        // 가 'not configured' 로 떨어지는 문제 회피.
        var schemes: [Scheme] = []
        if testSources != nil {
            schemes.append(.scheme(
                name: name,
                shared: true,
                buildAction: .buildAction(targets: [.target(name)]),
                testAction: .targets([.testableTarget(target: .target("\(name)Tests"))]),
                runAction: .runAction(executable: nil)
            ))
        }

        return Project(
            name: name,
            organizationName: "thingineeer",
            targets: targets,
            schemes: schemes
        )
    }

    // MARK: - TMA 5-target Feature

    /// Feature 모듈: Interface + Source + Testing + Tests + Example.
    /// dependencies 는 다른 모듈의 Interface 만 의존하도록 (TMA 핵심 룰).
    static func feature(
        name: String,
        sourceDependencies: [TargetDependency] = [],
        interfaceDependencies: [TargetDependency] = [],
        testingDependencies: [TargetDependency] = [],
        testDependencies: [TargetDependency] = [],
        exampleDependencies: [TargetDependency] = [],
        hasTesting: Bool = false,
        hasExample: Bool = false
    ) -> Project {
        var targets: [Target] = []

        // Interface — 외부 의존 없음 (혹은 다른 Interface 만)
        targets.append(.target(
            name: "\(name)Interface",
            destinations: SaunaConstants.destinations,
            product: .staticFramework,
            bundleId: "\(SaunaConstants.bundleIdPrefix).\(name)Interface",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Interface/**"],
            dependencies: interfaceDependencies
        ))

        // Source — Interface 구현
        targets.append(.target(
            name: name,
            destinations: SaunaConstants.destinations,
            product: .staticFramework,
            bundleId: "\(SaunaConstants.bundleIdPrefix).\(name)",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Sources/**"],
            dependencies: [.target(name: "\(name)Interface")] + sourceDependencies
        ))

        // Testing — 다른 Tests 가 의존하는 Mock/Stub
        if hasTesting {
            targets.append(.target(
                name: "\(name)Testing",
                destinations: SaunaConstants.destinations,
                product: .staticFramework,
                bundleId: "\(SaunaConstants.bundleIdPrefix).\(name)Testing",
                deploymentTargets: SaunaConstants.deploymentTargets,
                sources: ["Testing/**"],
                dependencies: [.target(name: "\(name)Interface")] + testingDependencies
            ))
        }

        // Tests
        targets.append(.target(
            name: "\(name)Tests",
            destinations: SaunaConstants.destinations,
            product: .unitTests,
            bundleId: "\(SaunaConstants.bundleIdPrefix).\(name)Tests",
            deploymentTargets: SaunaConstants.deploymentTargets,
            sources: ["Tests/**"],
            dependencies: [.target(name: name)]
                + (hasTesting ? [.target(name: "\(name)Testing")] : [])
                + testDependencies
        ))

        // Example — 풍부한 SwiftUI 미리보기 / 디자인 검증용 isolated app
        if hasExample {
            targets.append(.target(
                name: "\(name)Example",
                destinations: SaunaConstants.destinations,
                product: .app,
                bundleId: "\(SaunaConstants.bundleIdPrefix).\(name)Example",
                deploymentTargets: SaunaConstants.deploymentTargets,
                infoPlist: .extendingDefault(with: [
                    "UILaunchScreen": ["UIColorName": ""],
                ]),
                sources: ["Example/**"],
                dependencies: [.target(name: name)] + exampleDependencies
            ))
        }

        return Project(
            name: name,
            organizationName: "thingineeer",
            targets: targets
        )
    }
}
