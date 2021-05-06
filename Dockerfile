FROM node:16-alpine

# Install dependencies
RUN apk add --update --no-cache \
    asciidoc \
    autoconf \
    automake \
    bash \
    ca-certificates \
    curl \
    file \
    g++ \
    gcc \
    git \
    gnupg \
    inkscape \
    libjpeg-turbo-dev \
    libpng-dev \
    libtool \
    make \
    nasm \
    openjdk8 \
    py3-pygments

# Install npm dependencies
RUN npm install -g \
    grunt-cli \
    http-server \
    npm \
    sass

# Download and install hugo
ENV HUGO_VERSION 0.27.1
RUN curl -sSL -o /tmp/hugo.tar.gz https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_Linux-64bit.tar.gz && \
    tar xvfz /tmp/hugo.tar.gz && \
    chmod +x hugo && \
    mv hugo /usr/local/bin/hugo

# Create and define working directory
RUN mkdir -p /usr/share/blog/public
WORKDIR /usr/share/blog

# Expose default hugo port
EXPOSE 1313

# Define default command
CMD ["/bin/bash", "-l"]
