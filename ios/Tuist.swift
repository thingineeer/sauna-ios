// Tuist 4.43+
//
// Sauna 의 Tuist 전역 설정. project-level 옵션은 각 Project.swift 에서.

import ProjectDescription

let tuist = Tuist(
    project: .tuist(
        compatibleXcodeVersions: .all,
        swiftVersion: "6.0"
    )
)
