# syntax=docker/dockerfile:1@sha256:4edf897a3ffa55b89f906fc8cc78afdb3f1834cc9c7083565e611a8a7d5fe99e
# Optional packaging adapter: flake.nix/flake.lock own every project dependency.
# BuildKit caches the build layer; the final image contains only the runtime
# closure, not Nix, compilers, npm caches, or browser-install machinery.
FROM nixos/nix:2.35.3@sha256:ff480dbb23511aa1c10710aa068ceea5b93fed9bfce5f5379f3a6b07282cbc7b AS nix-builder
WORKDIR /srv/toolchain
COPY flake.nix flake.lock package.json package-lock.json ./
COPY nix/ ./nix/
COPY bin/nix-node-modules.sh ./bin/nix-node-modules.sh
RUN --mount=type=cache,target=/root/.cache/nix,sharing=locked \
    nix --extra-experimental-features 'nix-command flakes' flake check --no-update-lock-file -L \
    && nix --extra-experimental-features 'nix-command flakes' build --no-update-lock-file .#runtime-root -o /tmp/runtime \
    && nix --extra-experimental-features 'nix-command flakes' build --no-update-lock-file .#runtime-closure -o /tmp/closure \
    && mkdir -p /export/nix/store \
    && while IFS= read -r path; do cp -a "$path" /export/nix/store/; done < /tmp/closure/store-paths \
    && cp -a /tmp/runtime/. /export/

# Debian supplies compatibility for GitHub Actions' own Node executables.
# Project tools and their libraries all come from the pinned Nix closure.
FROM debian:trixie-slim@sha256:f6b08b09a05725f9431502d3b5714f5c4576e82c1a84fa1debe0c24a7e0c3ec4
COPY --from=nix-builder /export/ /
ENV PATH="/opt/ci/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \
    BASH_ENV="/etc/profile.d/blog.sh" \
    SSL_CERT_FILE="/etc/ssl/certs/ca-certificates.crt" \
    NODE_EXTRA_CA_CERTS="/etc/ssl/certs/ca-certificates.crt"
WORKDIR /usr/share/blog
EXPOSE 1313
ENTRYPOINT ["/usr/local/bin/blog-env"]
CMD ["bash", "-l"]
