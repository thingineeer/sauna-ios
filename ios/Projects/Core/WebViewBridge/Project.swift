import ProjectDescription
import ProjectDescriptionHelpers

let project = Project.library(
    name: SaunaModule.webViewBridge.rawValue,
    dependencies: [.sauna(.designSystem)],
    testSources: nil
)
