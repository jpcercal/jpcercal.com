{ pkgs, nodejs }:

(pkgs.buildNpmPackage.override { inherit nodejs; }) {
  pname = "blog-node-deps";
  version = "0.1.0";
  src = pkgs.lib.fileset.toSource {
    root = ../.;
    fileset = pkgs.lib.fileset.unions [
      ../package.json
      ../package-lock.json
    ];
  };
  npmDepsHash = "sha256-636hCgcIEadF/hjlUlF2AQUn9d9a9bgGQ+MQYxIWQkQ=";
  npmFlags = [
    "--ignore-scripts"
    "--no-audit"
    "--no-fund"
  ];
  dontNpmBuild = true;
  nativeBuildInputs = pkgs.lib.optionals pkgs.stdenv.hostPlatform.isLinux [ pkgs.autoPatchelfHook ];
  buildInputs = pkgs.lib.optionals pkgs.stdenv.hostPlatform.isLinux [
    pkgs.stdenv.cc.cc.lib
    pkgs.zlib
    pkgs.openssl
    pkgs.libcap
  ];
  env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";

  installPhase = ''
    runHook preInstall
    mkdir -p "$out"
    cp -r node_modules "$out/node_modules"
    chmod -R u+w "$out/node_modules"
    # Nixpkgs packages the top-level Playwright browser revisions, not the
    # platform-specific overrides. Match its browser link farm on macOS too.
    node - "$out/node_modules/playwright-core/browsers.json" <<'JS'
    const fs = require('node:fs');
    const path = process.argv[2];
    const data = JSON.parse(fs.readFileSync(path));
    for (const browser of data.browsers) delete browser.revisionOverrides;
    fs.writeFileSync(path, JSON.stringify(data));
    JS
    patchShebangs "$out/node_modules"
    ln -s node_modules/.bin "$out/bin"
    runHook postInstall
  '';
}
