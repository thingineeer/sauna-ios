import ProjectDescription

/// Sauna 전역 상수 — 한 군데에서 손보면 모든 모듈이 따라간다.
public enum SaunaConstants {
    public static let bundleIdPrefix = "th1ngjin"
    public static let appBundleId    = "th1ngjin.Sauna"
    public static let deploymentTargets: DeploymentTargets = .iOS("17.0")
    public static let destinations: Destinations = [.iPhone]
    public static let swiftVersion = "6.0"
    public static let marketingVersion = "0.1.0"
}

/// 모듈 이름 정의 — Project.swift 들이 import 후 참조해 type-safe 하게 의존.
public enum SaunaModule: String {
    // App
    case app = "Sauna"

    // Core layer (UI 토큰 / 그래픽 / 네트워크 / 관측성 / 웹뷰)
    case designSystem  = "DesignSystem"
    case customIcons   = "CustomIcons"
    case pixelMascot   = "PixelMascot"
    case sharedUI      = "SharedUI"
    case networkCore   = "NetworkCore"
    case observability = "Observability"
    case webViewBridge = "WebViewBridge"

    // Domain — TMA 5-target split
    case domainInterface = "DomainInterface"
    case domain          = "Domain"
    case domainTesting   = "DomainTesting"

    // Data
    case data = "Data"

    // Features (각각 5 target. 여기서는 Source 이름만)
    case featureOnboarding = "FeatureOnboarding"
    case featureHome       = "FeatureHome"
    case featureRoom       = "FeatureRoom"
    case featureMe         = "FeatureMe"

    public var path: Path {
        switch self {
        case .app:
            return .relativeToRoot("Projects/App/Sauna")
        case .designSystem, .customIcons, .pixelMascot, .sharedUI,
             .networkCore, .observability, .webViewBridge:
            return .relativeToRoot("Projects/Core/\(rawValue)")
        case .domainInterface:
            return .relativeToRoot("Projects/Domain")
        case .domain:
            return .relativeToRoot("Projects/Domain")
        case .domainTesting:
            return .relativeToRoot("Projects/Domain")
        case .data:
            return .relativeToRoot("Projects/Data")
        case .featureOnboarding:
            return .relativeToRoot("Projects/Features/Onboarding")
        case .featureHome:
            return .relativeToRoot("Projects/Features/Home")
        case .featureRoom:
            return .relativeToRoot("Projects/Features/Room")
        case .featureMe:
            return .relativeToRoot("Projects/Features/Me")
        }
    }
}

public extension TargetDependency {
    /// 다른 Sauna 모듈을 의존성으로 표시. 이 helper 가 module name → target name
    /// 매핑을 한 곳에서 한다.
    static func sauna(_ module: SaunaModule) -> TargetDependency {
        .project(target: module.rawValue, path: module.path)
    }
}
