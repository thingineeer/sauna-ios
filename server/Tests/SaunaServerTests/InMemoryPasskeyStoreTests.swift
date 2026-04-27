import XCTest
@testable import SaunaServer

final class InMemoryPasskeyStoreTests: XCTestCase {
    func testSaveAndLoad() async throws {
        let store = InMemoryPasskeyStore()
        let cred = PasskeyCredential(
            userId: "u-1",
            credentialId: Data([0xde, 0xad]),
            publicKeyCOSE: Data([0xbe, 0xef]),
            signatureCount: 0,
            createdAt: Date(),
            lastUsedAt: nil
        )
        try await store.saveCredential(cred)
        let loaded = try await store.loadCredentials(forUserId: "u-1")
        XCTAssertEqual(loaded.count, 1)
        XCTAssertEqual(loaded.first?.credentialId, Data([0xde, 0xad]))
    }

    func testDuplicateRejected() async throws {
        let store = InMemoryPasskeyStore()
        let cred = PasskeyCredential(
            userId: "u-1",
            credentialId: Data([0xde, 0xad]),
            publicKeyCOSE: Data([0xbe, 0xef])
        )
        try await store.saveCredential(cred)
        do {
            try await store.saveCredential(cred)
            XCTFail("expected duplicateCredential")
        } catch let error as PasskeyStoreError {
            XCTAssertEqual(error, .duplicateCredential)
        }
    }

    func testUpdateAndDelete() async throws {
        let store = InMemoryPasskeyStore()
        let cred = PasskeyCredential(
            userId: "u-1",
            credentialId: Data([0xde, 0xad]),
            publicKeyCOSE: Data([0xbe, 0xef])
        )
        try await store.saveCredential(cred)
        try await store.updateSignatureCount(credentialId: Data([0xde, 0xad]), count: 5)
        let loaded = try await store.loadCredentials(forUserId: "u-1")
        XCTAssertEqual(loaded.first?.signatureCount, 5)
        XCTAssertNotNil(loaded.first?.lastUsedAt)

        try await store.deleteCredential(credentialId: Data([0xde, 0xad]))
        let after = try await store.loadCredentials(forUserId: "u-1")
        XCTAssertEqual(after.count, 0)
    }

    func testUpdateUnknownThrows() async throws {
        let store = InMemoryPasskeyStore()
        do {
            try await store.updateSignatureCount(credentialId: Data([0x01]), count: 1)
            XCTFail("expected credentialNotFound")
        } catch let error as PasskeyStoreError {
            XCTAssertEqual(error, .credentialNotFound)
        }
    }
}
