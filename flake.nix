{
  description = "pocketenv - the universal sandbox runtime for agents and humans.";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/release-25.05";
    flake-utils.url = "github:numtide/flake-utils";
    pocketenv-cli = {
      url = "path:./apps/cli";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.flake-utils.follows = "flake-utils";
    };
  };

  outputs = { self, nixpkgs, flake-utils, pocketenv-cli }:
    flake-utils.lib.eachSystem [
      "x86_64-linux"
      "aarch64-linux"
      "x86_64-darwin"
      "aarch64-darwin"
    ] (system:
      let
        pkgs = import nixpkgs { inherit system; };
        cli = pocketenv-cli.packages.${system}.default;
      in {
        packages = {
          default = cli;
          inherit cli;
        };

        apps.default = flake-utils.lib.mkApp {
          drv = cli;
          exePath = "/bin/pocketenv";
        };

        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.nodejs_24
            pkgs.bun
            cli
          ];
        };
      }
    );
}
