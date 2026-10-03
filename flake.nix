{
  description = "Pinned development and CI toolchain for jpcercal.com";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/c9fe7d12cd78d1adcd12dd15e24432dde5b155a0";
    # Keep the project's exact Node version without rebuilding it from source.
    nodepkgs.url = "github:NixOS/nixpkgs/c7def046b9a883d46974757852106483d741586f";
  };

  outputs =
    {
      self,
      nixpkgs,
      nodepkgs,
    }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      eachSystem = nixpkgs.lib.genAttrs systems;
      project =
        system:
        import ./nix/toolchain.nix {
          pkgs = import nixpkgs { inherit system; };
          nodejs = (import nodepkgs { inherit system; }).nodejs_26;
        };
    in
    {
      packages = eachSystem (
        system:
        let
          p = project system;
        in
        {
          default = p.toolchain;
          inherit (p) node-deps toolchain;
        }
        // nixpkgs.lib.optionalAttrs (nixpkgs.lib.hasSuffix "-linux" system) {
          inherit (p) runtime-root runtime-closure;
        }
      );
      devShells = eachSystem (system: {
        default = (project system).shell;
      });
      checks = eachSystem (system: (project system).checks);
      formatter = eachSystem (system: (import nixpkgs { inherit system; }).nixfmt);
    };
}
