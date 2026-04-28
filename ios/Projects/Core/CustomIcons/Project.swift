import ProjectDescription
import ProjectDescriptionHelpers

let project = Project.library(
    name: SaunaModule.customIcons.rawValue,
    dependencies: [.sauna(.designSystem)],
    testSources: nil
)
