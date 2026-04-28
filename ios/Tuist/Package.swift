// swift-tools-version: 6.0
//
// Tuist 가 외부 SPM 패키지를 가져올 때 쓰는 manifest.
// `tuist install` 이 이 파일을 읽고 .build/checkouts 에 받음.
// 각 Project.swift 의 dependencies: [.external(name: "Sentry")] 으로 참조.

import PackageDescription

let package = Package(
    name: "SaunaExternalPackages",
    dependencies: [
        // 관측성 — 휘발성 정책 가드는 Observability 모듈 안에서.
        .package(url: "https://github.com/getsentry/sentry-cocoa", from: "8.36.0"),
    ]
)
