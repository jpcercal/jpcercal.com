# syntax=docker/dockerfile:1
# Self-sufficient CI image: Hugo extended + Node 24 + native image toolchain
# (oxipng/oxvg/resvg/mozjpeg/pagefind/lychee) + baked npm dependencies +
# Playwright Chromium. CI jobs run in this image with zero installs:
# no cargo/apt/npm compilation, only a `ln -s` of the baked node_modules.
#
# Multi-stage so the final image keeps runtime artifacts only:
#   tools-fetcher   - prebuilt release binaries (hugo, oxipng, resvg,
#                     pagefind, lychee). No compilers; stage discarded.
#   native-builder  - Rust-built oxvg (ships NO prebuilt binary;
#                     cargo/brew only) + resvg fallback on arm64 (ships no
#                     linux/arm64 release asset either).
#   mozjpeg-builder - mozjpeg built from source (no binary exists).
#   node-deps       - `npm ci` output (node_modules is arch-specific:
#                     @biomejs/sass-embedded ship platform binaries).
# CI builds linux/amd64 (runner arch); arm64 builds work via the fallbacks.
ARG HUGO_VERSION=0.166.0
ARG OXIPNG_VERSION=10.2.1
ARG RESVG_VERSION=0.48.1
ARG PAGEFIND_VERSION=1.5.2
ARG LYCHEE_VERSION=0.24.2
ARG MOZJPEG_VERSION=4.1.5

# ------------------------------------------------------------ tools-fetcher
FROM debian:bookworm-slim AS tools-fetcher
ARG HUGO_VERSION
ARG OXIPNG_VERSION
ARG RESVG_VERSION
ARG PAGEFIND_VERSION
ARG LYCHEE_VERSION
ARG TARGETARCH
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /out
RUN set -eux; \
    case "$TARGETARCH" in \
        amd64) BIN_ARCH=x86_64; HUGO_ARCH=amd64 ;; \
        arm64) BIN_ARCH=aarch64; HUGO_ARCH=arm64 ;; \
        *) echo "unsupported arch $TARGETARCH" >&2; exit 1 ;; \
    esac; \
    curl -fsSL --retry 3 -o hugo.tgz \
        "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-${HUGO_ARCH}.tar.gz"; \
    tar xzf hugo.tgz hugo; rm hugo.tgz; \
    curl -fsSL --retry 3 -o oxipng.tgz \
        "https://github.com/shssoichiro/oxipng/releases/download/v${OXIPNG_VERSION}/oxipng-${OXIPNG_VERSION}-${BIN_ARCH}-unknown-linux-gnu.tar.gz"; \
    tar xzf oxipng.tgz --strip-components=1 \
        "oxipng-${OXIPNG_VERSION}-${BIN_ARCH}-unknown-linux-gnu/oxipng"; rm oxipng.tgz; \
    if [ "$TARGETARCH" = "amd64" ]; then \
        curl -fsSL --retry 3 -o resvg.tgz \
            "https://github.com/RazrFalcon/resvg/releases/download/v${RESVG_VERSION}/resvg-linux-x86_64.tar.gz"; \
        tar xzf resvg.tgz resvg; rm resvg.tgz; \
    fi; \
    curl -fsSL --retry 3 -o pagefind.tgz \
        "https://github.com/Pagefind/pagefind/releases/download/v${PAGEFIND_VERSION}/pagefind_extended-v${PAGEFIND_VERSION}-${BIN_ARCH}-unknown-linux-musl.tar.gz"; \
    tar xzf pagefind.tgz pagefind_extended; rm pagefind.tgz; \
    mv pagefind_extended pagefind; \
    # NOTE: lychee's gnu build requires glibc 2.38+ (bookworm ships 2.36),
    # so use the static musl build.
    curl -fsSL --retry 3 -o lychee.tgz \
        "https://github.com/lycheeverse/lychee/releases/download/lychee-v${LYCHEE_VERSION}/lychee-${BIN_ARCH}-unknown-linux-musl.tar.gz"; \
    tar xzf lychee.tgz --strip-components=1 \
        "lychee-${BIN_ARCH}-unknown-linux-musl/lychee"; rm lychee.tgz; \
    ls -l /out

# ----------------------------------------------------------- native-builder
FROM rust:1-bookworm AS native-builder
ARG TARGETARCH
ENV CARGO_NET_RETRY=10
RUN set -eux; \
    cargo install oxvg; \
    mkdir -p /out; cp /usr/local/cargo/bin/oxvg /out/; \
    if [ "$TARGETARCH" = "arm64" ]; then \
        cargo install resvg; cp /usr/local/cargo/bin/resvg /out/; \
    fi

# ---------------------------------------------------------- mozjpeg-builder
FROM debian:bookworm-slim AS mozjpeg-builder
ARG MOZJPEG_VERSION
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        cmake \
        curl \
        g++ \
        libpng-dev \
        make \
        nasm \
        zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*
RUN set -eux; \
    curl -fsSL --retry 3 -o mozjpeg.tar.gz \
        "https://github.com/mozilla/mozjpeg/archive/v${MOZJPEG_VERSION}.tar.gz"; \
    tar xzf mozjpeg.tar.gz; rm mozjpeg.tar.gz; \
    cmake -B "mozjpeg-${MOZJPEG_VERSION}/build" \
        -DCMAKE_INSTALL_PREFIX=/out/usr/local "mozjpeg-${MOZJPEG_VERSION}"; \
    cmake --build "mozjpeg-${MOZJPEG_VERSION}/build" -j "$(nproc)"; \
    cmake --install "mozjpeg-${MOZJPEG_VERSION}/build"; \
    /out/usr/local/bin/jpegtran -version

# ---------------------------------------------------------------- node-deps
FROM node:24-bookworm-slim AS node-deps
WORKDIR /srv/site
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund && npm cache clean --force

# -------------------------------------------------------------------- final
FROM node:24-bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive \
    PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright \
    PATH="/opt/ci/node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
COPY --from=tools-fetcher /out/ /usr/local/bin/
COPY --from=native-builder /out/ /usr/local/bin/
COPY --from=mozjpeg-builder /out/usr/local/bin/jpegtran /usr/local/bin/jpegtran
COPY --from=mozjpeg-builder /out/usr/local/lib/ /usr/local/lib/
COPY --from=node-deps /srv/site/node_modules /opt/ci/node_modules
RUN ldconfig \
    && chmod +x /usr/local/bin/hugo /usr/local/bin/oxipng /usr/local/bin/oxvg \
        /usr/local/bin/resvg /usr/local/bin/pagefind /usr/local/bin/lychee \
        /usr/local/bin/jpegtran
# Runtime libs (xmllint, python3 for verify-pages.sh, git for Hugo) plus the
# Playwright Chromium browser and its system deps (installed by --with-deps).
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        libpng16-16 \
        libxml2-utils \
        python3 \
    && node /opt/ci/node_modules/@playwright/test/cli.js install --with-deps chromium \
    && rm -rf /var/lib/apt/lists/* \
    && chmod -R a+rX /opt/ci /opt/ms-playwright
RUN set -eux; \
    hugo version; node --version; npm --version; \
    oxipng --version; oxvg --version; resvg --version; pagefind --version; lychee --version; \
    jpegtran -version 2>&1 | grep -i mozjpeg; \
    xmllint --version; python3 --version; \
    python3 -c "import json; print('json ok')"; \
    test -x /opt/ci/node_modules/.bin/biome; \
    test -x /opt/ci/node_modules/.bin/html-validate; \
    test -x /opt/ci/node_modules/.bin/lhci; \
    node -e "console.log(require('/opt/ci/node_modules/@playwright/test').chromium.executablePath())"

# Create and define working directory
RUN mkdir -p /usr/share/blog/public
WORKDIR /usr/share/blog

# Expose default hugo port
EXPOSE 1313

# Define default command
CMD ["/bin/bash", "-l"]
