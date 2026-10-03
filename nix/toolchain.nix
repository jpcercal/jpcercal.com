{ pkgs, nodejs }:
let
  inherit (pkgs) lib;
  node-deps = import ./node-deps.nix { inherit pkgs nodejs; };
  browsers = pkgs.playwright-driver.selectBrowsers {
    withFirefox = false;
    withWebkit = false;
  };
  chromeDir =
    {
      x86_64-linux = "chrome-linux64/chrome";
      aarch64-linux = "chrome-linux-arm64/chrome";
      aarch64-darwin = "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
    }
    .${pkgs.stdenv.hostPlatform.system};
  chromium = "${pkgs.playwright-driver.components.chromium}/${chromeDir}";
  fonts = pkgs.makeFontsConf {
    fontDirectories = [
      pkgs.dejavu_fonts
      pkgs.liberation_ttf
      pkgs.noto-fonts-color-emoji
    ];
  };
  # resvg/fontdb does not use FONTCONFIG_FILE. Supply pinned fonts explicitly
  # rather than inheriting an arbitrary host's installed fonts.
  resvg = pkgs.writeShellScriptBin "resvg" ''
    exec ${pkgs.resvg}/bin/resvg \
      --skip-system-fonts \
      --use-fonts-dir ${pkgs.liberation_ttf}/share/fonts \
      --use-fonts-dir ${pkgs.dejavu_fonts}/share/fonts \
      --sans-serif-family "Liberation Sans" \
      --serif-family "Liberation Serif" \
      --monospace-family "Liberation Mono" "$@"
  '';
  environment = {
    BLOG_NODE_MODULES = "${node-deps}/node_modules";
    JPEGTRAN = "${pkgs.mozjpeg}/bin/jpegtran";
    PLAYWRIGHT_BROWSERS_PATH = "${browsers}";
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
    WRANGLER_SEND_METRICS = "false";
    # Nix browser packages supply libraries via RPATH, not /sbin/ldconfig.
    PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "1";
    CHROME_PATH = chromium;
    FONTCONFIG_FILE = fonts;
    SSL_CERT_FILE = "${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt";
    NODE_EXTRA_CA_CERTS = "${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt";
    # Hugo checks every symlink in allowed directories. Allow only our npm
    # closure, not the entire store (which contains unrelated /etc symlinks).
    HUGO_SECURITY_NODE_PERMISSIONS_ALLOWREAD = ". ${node-deps}";
  };
  tools = [
    nodejs
    node-deps
    pkgs.hugo
    pkgs.oxipng
    pkgs.oxvg
    resvg
    pkgs.pagefind
    pkgs.lychee
    pkgs.mozjpeg
    pkgs.libxml2
    pkgs.python3
    pkgs.git
    pkgs.curl
    pkgs.bashInteractive
    pkgs.coreutils
    pkgs.findutils
    pkgs.gnugrep
    pkgs.gnused
    pkgs.gawk
    pkgs.gnutar
    pkgs.gzip
    pkgs.cacert
    pkgs.which
  ];
  toolchain = pkgs.buildEnv {
    name = "blog-toolchain";
    paths = tools;
    pathsToLink = [
      "/bin"
      "/node_modules"
    ];
  };
  exports = lib.concatStringsSep "\n" (
    lib.mapAttrsToList (name: value: "export ${name}=${lib.escapeShellArg value}") environment
  );
  shell = pkgs.mkShell (
    environment
    // {
      packages = [
        toolchain
        pkgs.nixfmt
        pkgs.actionlint
        pkgs.shellcheck
      ];
      shellHook = ''
        export PATH="${toolchain}/bin:$PATH"
        if ! bash bin/nix-node-modules.sh; then
          return 1
        fi
        if [[ -L .direnv/flake-profile ]]; then
          export HUGO_SECURITY_NODE_PERMISSIONS_ALLOWREAD="$HUGO_SECURITY_NODE_PERMISSIONS_ALLOWREAD $(readlink -f .direnv/flake-profile)"
        fi
      '';
    }
  );
  runtime-root = pkgs.runCommand "blog-runtime-root" { } ''
    mkdir -p "$out/opt/ci" "$out/etc/profile.d" "$out/etc/ssl/certs" "$out/usr/local/bin" "$out/usr/share/blog/public"
    ln -s ${toolchain}/bin "$out/opt/ci/bin"
    ln -s ${node-deps}/node_modules "$out/opt/ci/node_modules"
    ln -s ${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt "$out/etc/ssl/certs/ca-certificates.crt"
    cat > "$out/etc/profile.d/blog.sh" <<'ENV'
    ${exports}
    export PATH=/opt/ci/bin:$PATH
    ENV
    # Non-login GitHub Actions shells receive the same configuration.
    cat > "$out/usr/local/bin/blog-env" <<'SH'
    #!${pkgs.bash}/bin/bash
    ${exports}
    export PATH=/opt/ci/bin:$PATH
    exec "$@"
    SH
    chmod +x "$out/usr/local/bin/blog-env"
  '';
  runtime-closure = pkgs.closureInfo { rootPaths = [ runtime-root ]; };
  versions =
    pkgs.runCommand "blog-toolchain-check"
      (
        environment
        // {
          nativeBuildInputs = [ toolchain ];
        }
      )
      ''
        export HOME="$TMPDIR/home"
        mkdir -p "$HOME"
        node --version | grep -Fx v26.8.2
        hugo version | grep 'v0.166.0.*extended'
        oxipng --version | grep -F 10.2.1
        oxvg --version | grep -F 0.0.7
        resvg --version | grep -F 0.48.1
        pagefind --version | grep -F 1.5.2
        lychee --version | grep -F 0.24.2
        "$JPEGTRAN" -version 2>&1 | grep -i 'mozjpeg.*4.1.5'
        curl --version | grep -F HTTP2
        xmllint --version
        python3 -c 'import json'
        biome --version
        html-validate --version
        sass --version
        tailwindcss --help
        wrangler --version | grep -F 4.147.0
        NODE_PATH="$BLOG_NODE_MODULES" node ${./check-browser.cjs}
        touch "$out"
      '';
in
assert nodejs.version == "26.8.2";
assert pkgs.playwright-driver.version == "1.63.0";
assert pkgs.pagefind.enableExtended;
{
  inherit
    node-deps
    toolchain
    shell
    runtime-root
    runtime-closure
    ;
  checks = {
    toolchain = versions;
    node-modules-safety =
      pkgs.runCommand "blog-node-modules-safety"
        {
          nativeBuildInputs = [
            pkgs.bash
            pkgs.coreutils
          ];
          BLOG_NODE_MODULES = "${node-deps}/node_modules";
        }
        ''
          bash ${./check-node-modules.sh} ${../bin/nix-node-modules.sh}
          touch "$out"
        '';
  };
}
