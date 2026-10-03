# syntax=docker/dockerfile:1@sha256:4edf897a3ffa55b89f906fc8cc78afdb3f1834cc9c7083565e611a8a7d5fe99e
# Optional packaging adapter: flake.nix/flake.lock own every project dependency.
# BuildKit caches the build layer; the final image contains only the runtime
# closure, not Nix, compilers, npm caches, or browser-install machinery.
FROM nixos/nix:2.35.2@sha256:7a007c766426c1877758ddc5cb87a965ac131fc78c582ce0083d922d51ae945c AS nix-builder
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
FROM debian:trixie-slim@sha256:a99cfc517144bc59b1978475ec53b46ecabec7e43635402ee5b77cc54cd1b20a
COPY --from=nix-builder /export/ /
ENV PATH="/opt/ci/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \
    BASH_ENV="/etc/profile.d/blog.sh" \
    SSL_CERT_FILE="/etc/ssl/certs/ca-certificates.crt" \
    NODE_EXTRA_CA_CERTS="/etc/ssl/certs/ca-certificates.crt"
WORKDIR /usr/share/blog
EXPOSE 1313
ENTRYPOINT ["/usr/local/bin/blog-env"]
CMD ["bash", "-l"]
