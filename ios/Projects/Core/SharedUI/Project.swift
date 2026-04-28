import ProjectDescription
import ProjectDescriptionHelpers

let project = Project.library(
    name: SaunaModule.sharedUI.rawValue,
    dependencies: [
        .sauna(.designSystem),
        .sauna(.customIcons),
        .sauna(.pixelMascot),
    ],
    testSources: nil
)
