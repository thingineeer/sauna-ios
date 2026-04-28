import Vapor

/// Registers all HTTP and WebSocket routes.
public func routes(_ app: Application) throws {
    // /health
    let health = HealthController()
    try app.register(collection: health)

    // /ws/rooms/:roomId
    let room = RoomController()
    try app.register(collection: room)

    // /auth/passkey/*
    let passkey = PasskeyController()
    try app.register(collection: passkey)
}
