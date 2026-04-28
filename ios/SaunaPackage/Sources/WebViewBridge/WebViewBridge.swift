import SwiftUI
#if canImport(WebKit)
import WebKit
#endif

/// SwiftUI wrapper around a hardened `WKWebView`.
/// Use only for non-realtime content (Terms, Help, Season Room admin pages).
public struct SaunaWebView: View {
    public struct Policy: Sendable {
        /// Origins permitted in the address bar / inside the page.
        public let allowedOrigins: Set<String>
        /// JS bridge keys this page may call. Empty = no bridge.
        public let jsBridge: Set<String>
        /// Block forms, downloads, popups, and any window opening.
        public let lockedDown: Bool
        public init(
            allowedOrigins: Set<String>,
            jsBridge: Set<String> = [],
            lockedDown: Bool = true
        ) {
            self.allowedOrigins = allowedOrigins
            self.jsBridge = jsBridge
            self.lockedDown = lockedDown
        }
        public static let aboutPage = Policy(
            allowedOrigins: ["https://sauna.app"], lockedDown: true
        )
    }

    public let url: URL
    public let policy: Policy
    public init(url: URL, policy: Policy = .aboutPage) {
        self.url = url
        self.policy = policy
    }

    public var body: some View {
        #if canImport(WebKit) && canImport(UIKit)
        WebViewRepresentable(url: url, policy: policy)
        #else
        Text("WebView is iOS-only in this module").foregroundStyle(.secondary)
        #endif
    }
}

#if canImport(WebKit) && canImport(UIKit)
import UIKit

private struct WebViewRepresentable: UIViewRepresentable {
    let url: URL
    let policy: SaunaWebView.Policy

    func makeUIView(context: Context) -> WKWebView {
        let cfg = WKWebViewConfiguration()
        cfg.preferences.javaScriptCanOpenWindowsAutomatically = false
        cfg.allowsInlineMediaPlayback = false
        cfg.suppressesIncrementalRendering = false
        let v = WKWebView(frame: .zero, configuration: cfg)
        v.isOpaque = false
        v.backgroundColor = .black
        v.scrollView.backgroundColor = .black
        v.navigationDelegate = context.coordinator
        v.uiDelegate = context.coordinator
        v.load(URLRequest(url: url))
        return v
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(policy: policy) }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let policy: SaunaWebView.Policy
        init(policy: SaunaWebView.Policy) { self.policy = policy }

        func webView(_ webView: WKWebView,
                      decidePolicyFor navigationAction: WKNavigationAction,
                      decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.cancel); return
            }
            let origin = "\(url.scheme ?? "")://\(url.host ?? "")"
            if policy.allowedOrigins.contains(origin) {
                decisionHandler(.allow)
            } else {
                decisionHandler(.cancel)
            }
        }

        func webView(_ webView: WKWebView,
                      createWebViewWith configuration: WKWebViewConfiguration,
                      for navigationAction: WKNavigationAction,
                      windowFeatures: WKWindowFeatures) -> WKWebView? {
            // Block popups / target=_blank entirely.
            nil
        }
    }
}
#endif
