import ProjectDescription
import ProjectDescriptionHelpers

let project = Project.library(
    name: SaunaModule.designSystem.rawValue,
    testSources: nil   // 테스트는 SaunaPackage 에서 통합 — 추후 분리
)
