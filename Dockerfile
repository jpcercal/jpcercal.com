# Reproducible build image: Node 24 slim + Hugo extended + Rust + mozjpeg.
# Native-first toolchain (C/Rust > Go > Node): oxipng/oxvg/resvg/pagefind/
# lychee via cargo, mozjpeg (JPEG) built from source (no apt package),
# Hugo extended binary from GitHub releases. No Ruby/Java/Python/Inkscape,
# no Grunt — the build is `npm ci && npm run build && bin/build-images.sh`.
FROM node:24-slim

ENV HUGO_VERSION=0.166.0 \
    DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    cmake \
    curl \
    file \
    g++ \
    gcc \
    git \
    libpng-dev \
    libxml2-utils \
    make \
    nasm \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/* \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
        | sh -s -- -y --profile minimal

ENV PATH="/root/.cargo/bin:${PATH}"

RUN cargo install oxipng oxvg resvg pagefind lychee \
    && curl -fLO https://github.com/mozilla/mozjpeg/archive/v4.1.5.tar.gz \
    && tar xf v4.1.5.tar.gz \
    && cmake -B mozjpeg-4.1.5/build -DCMAKE_INSTALL_PREFIX=/usr/local mozjpeg-4.1.5 \
    && cmake --build mozjpeg-4.1.5/build -j \
    && cmake --install mozjpeg-4.1.5/build \
    && rm -rf v4.1.5.tar.gz mozjpeg-4.1.5 \
    && /usr/local/bin/jpegtran -version

# Download and install hugo (extended, matching the image architecture)
RUN HUGO_ARCH="$(uname -m)"; \
    case "$HUGO_ARCH" in x86_64) HUGO_ARCH=amd64 ;; aarch64|arm64) HUGO_ARCH=arm64 ;; esac; \
    curl -sSL -o /tmp/hugo.tar.gz \
      https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-${HUGO_ARCH}.tar.gz && \
    tar xfz /tmp/hugo.tar.gz -C /tmp && \
    chmod +x /tmp/hugo && \
    mv /tmp/hugo /usr/local/bin/hugo && \
    rm /tmp/hugo.tar.gz && \
    hugo version

# Create and define working directory
RUN mkdir -p /usr/share/blog/public
WORKDIR /usr/share/blog

# Expose default hugo port
EXPOSE 1313

# Install npm dependencies and build with:
#   npm ci --no-audit --no-fund && BASE_URL=https://jpcercal.com/ npm run build \
#     && bin/build-images.sh && pagefind --site public

# Define default command
CMD ["/bin/bash", "-l"]
