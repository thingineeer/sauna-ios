import ProjectDescription
import ProjectDescriptionHelpers

let project = Project.library(
    name: SaunaModule.observability.rawValue,
    dependencies: [
        .external(name: "Sentry"),
    ],
    testSources: "Tests/**"
)
