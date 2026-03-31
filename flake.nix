{
  description = "pocketenv - the universal sandbox runtime for agents and humans.";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachSystem [
      "x86_64-linux"
      "aarch64-linux"
      "x86_64-darwin"
      "aarch64-darwin"
    ] (system:
      let
        pkgs = import nixpkgs { inherit system; };

        version = "0.6.0";

        # Map Nix system strings to pocketenv release target triples
        targetMap = {
          "x86_64-linux"   = "x86_64-unknown-linux-gnu";
          "aarch64-linux"  = "aarch64-unknown-linux-gnu";
          "x86_64-darwin"  = "x86_64-apple-darwin";
          "aarch64-darwin" = "aarch64-apple-darwin";
        };

        # Fill these in by running:
        #   nix-prefetch-url --type sha256 <url>
        # or:
        #   curl -sL <url> | sha256sum
        #   then convert with: nix hash to-sri --type sha256 <hex>
        #
        # Example for aarch64-linux:
        #   nix-prefetch-url --type sha256 \
        #     https://github.com/pocketenv-io/pocketenv/releases/download/v0.6.0/pocketenv_v0.6.0_aarch64-unknown-linux-gnu.tar.gz
        hashMap = {
          "x86_64-linux"   = "sha256-XzSuI2HmmMcFPaG3ixApiY//9TlQuLrzu3jfecnRLhI=";
          "aarch64-linux"  = "sha256-Pzh28zZTocug7/7VuUoPWqDwk+63Y6/iQovZgK2Ur0k=";
          "x86_64-darwin"  = "sha256-lP1D/zS2BqIr/bUj5doFCx1UDAFvsRwkKMYlDPAYSC8=";
          "aarch64-darwin" = "sha256-WkvSYttx5Z7MsFfCJ7mgAjmAcUW9AkKXaYCPPYOUlAA=";
        };

        target = targetMap.${system};
        hash   = hashMap.${system};

        pocketenv = pkgs.stdenv.mkDerivation rec {
          pname   = "pocketenv";
          inherit version;

          src = pkgs.fetchurl {
            url    = "https://github.com/pocketenv-io/pocketenv/releases/download/v${version}/pocketenv_v${version}_${target}.tar.gz";
            sha256 = hash;
          };

          # On Linux, patch the ELF interpreter to work under NixOS
          nativeBuildInputs = pkgs.lib.optionals pkgs.stdenv.isLinux [
            pkgs.autoPatchelfHook
          ];

          # Common C runtime — needed if the Deno binary links glibc
          buildInputs = pkgs.lib.optionals pkgs.stdenv.isLinux [
            pkgs.stdenv.cc.cc.lib
          ];

          # The tarball unpacks directly; tell Nix not to look for a sub-directory
          # Adjust sourceRoot if the tarball contains a subdirectory, e.g.:
          #   sourceRoot = "pocketenv-${version}";
          # Leave commented unless extraction fails.
          sourceRoot = ".";

          installPhase = ''
            runHook preInstall
            install -m755 -D pocketenv $out/bin/pocketenv
            runHook postInstall
          '';

          meta = with pkgs.lib; {
            description  = "pocketenv environment manager";
            homepage     = "https://github.com/pocketenv-io/pocketenv";
            license      = licenses.mit;  # adjust if different
            platforms    = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
            mainProgram  = "pocketenv";
          };
        };

      in {
        packages = {
          default    = pocketenv;
          pocketenv  = pocketenv;
        };

        apps.default = flake-utils.lib.mkApp {
          drv = pocketenv;
        };

        # Development shell with pocketenv available
        devShells.default = pkgs.mkShell {
          buildInputs = [ pocketenv ];
        };
      }
    );
}
