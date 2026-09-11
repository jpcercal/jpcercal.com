FROM node:24-bookworm

# Install system dependencies for the build:
# - git for fetching vendor sources (bin/fetch-vendor.sh)
# - nasm/cmake for building mozjpeg (native image pipeline)
# Full slim-down to native-only image happens in the deploy commit.
ENV HUGO_VERSION=0.166.0

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    cmake \
    curl \
    file \
    g++ \
    gcc \
    git \
    libjpeg-dev \
    libpng-dev \
    make \
    nasm \
    && rm -rf /var/lib/apt/lists/*

# Install global npm tools
RUN npm install -g grunt-cli

# Download and install hugo (extended)
RUN curl -sSL -o /tmp/hugo.tar.gz \
      https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz && \
    tar xvfz /tmp/hugo.tar.gz -C /tmp && \
    chmod +x /tmp/hugo && \
    mv /tmp/hugo /usr/local/bin/hugo && \
    rm /tmp/hugo.tar.gz

# Create and define working directory
RUN mkdir -p /usr/share/blog/public
WORKDIR /usr/share/blog

# Expose default hugo port
EXPOSE 1313

# Install npm dependencies, fetch vendor sources and build with:
#   npm ci && bin/fetch-vendor.sh && BASE_URL=https://jpcercal.com/ grunt production && bin/build-images.sh

# Define default command
CMD ["/bin/bash", "-l"]
