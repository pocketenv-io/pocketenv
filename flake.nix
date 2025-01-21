{
  description = "Manage your development environment with ease ✨";

  inputs = {
    utils.url = "github:numtide/flake-utils";
    deno2nix = {
      url = "github:tsirysndr/deno2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, utils, deno2nix }:
    utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ deno2nix.overlays.default ];
        };
      in
      rec {

        apps.default = utils.lib.mkApp {
          drv = packages.default;
        };

        packages.default = pkgs.deno2nix.mkExecutable {
          pname = "pocketenv";
          version = "0.1.5";

          src = ./.;
          lockfile = "./deno.lock";
          config = "./deno.json";
          entrypoint = "./main.ts";
          allow = {
            all = true;
          };
        };

        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            deno
          ];
        };
      });
}
