{
  description = "A Nix Flake for @rocksky/cli";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/release-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        pocketenv-cli = pkgs.buildNpmPackage {
          pname = "pocketenv-cli";
          version = "0.6.8";

          src = ./.;

          npmDeps = pkgs.importNpmLock { npmRoot = ./.; };
          npmConfigHook = pkgs.importNpmLock.npmConfigHook;

          nodejs = pkgs.nodejs_24;

          meta.mainProgram = "pocketenv";
        };
      in {
        packages.default = pocketenv-cli;

        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.nodejs_24
            pocketenv-cli
          ];
        };
      }
    );
}
