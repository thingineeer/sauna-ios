# syntax=docker/dockerfile:1.6
# Multi-stage Swift build for SaunaServer.
# Built artifact runs on slim image, exposing :8080.
# Healthcheck pings GET /health every 30s.

# ---- Build stage ----
FROM swift:6.0-jammy AS build

WORKDIR /build

# Install build deps (for swift-nio-ssl and Postgres TLS).
RUN apt-get update -qq \
    && apt-get install -y -q --no-install-recommends \
        libssl-dev \
        libsqlite3-dev \
        zlib1g-dev \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Resolve dependencies first to maximize layer cache hits.
COPY ./Package.swift ./Package.resolved* ./
RUN swift package resolve

# Copy the rest and build in release mode.
COPY ./Sources ./Sources
COPY ./Tests ./Tests
RUN swift build --configuration release \
    --product SaunaServer \
    --static-swift-stdlib

# Stage built artifacts into a clean folder for COPY.
WORKDIR /staging
RUN cp "$(swift build --package-path /build --configuration release --show-bin-path)/SaunaServer" ./
# Pull in any resource bundles that Vapor consumers might emit
RUN find -L "$(swift build --package-path /build --configuration release --show-bin-path)/" \
    -regex '.*\.resources$' -exec cp -Rv {} ./ \; || true

# ---- Runtime stage ----
FROM swift:6.0-jammy-slim AS runtime

# Non-root user.
RUN groupadd --system --gid 1000 sauna \
    && useradd --system --uid 1000 --gid sauna --create-home --home-dir /home/sauna sauna \
    && apt-get update -qq \
    && apt-get install -y -q --no-install-recommends \
        ca-certificates \
        tzdata \
        libssl3 \
        curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build --chown=sauna:sauna /staging /app

USER sauna:sauna

EXPOSE 8080

ENV LOG_LEVEL=info \
    HOST=0.0.0.0 \
    PORT=8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD curl --fail --silent --show-error http://127.0.0.1:8080/health || exit 1

ENTRYPOINT ["./SaunaServer"]
CMD ["serve", "--env", "production"]
