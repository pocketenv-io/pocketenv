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
        lib = pkgs.lib;

        version = "0.6.3";

        targetMap = {
          "x86_64-linux"   = "x86_64-unknown-linux-gnu";
          "aarch64-linux"  = "aarch64-unknown-linux-gnu";
          "x86_64-darwin"  = "x86_64-apple-darwin";
          "aarch64-darwin" = "aarch64-apple-darwin";
        };

        hashMap = {
          "x86_64-linux"   = "sha256-GZP8rCArmqNelA0reMJORpfdu+7rgwwZ+w0hETA+M30=";
          "aarch64-linux"  = "sha256-fT8pzkI/2IzGOC+7L1WgJ+FhtK1jGkv+VAbpogysW2c=";
          "x86_64-darwin"  = "sha256-HkBlWs3jpVhaol6HbBJzvWeaAEq1QaoED1k6DtRs+AM=";
          "aarch64-darwin" = "sha256-j5j57O3lkcmQfLlAD1B0A4/VHf0/OCKOtnHxjSYQLvA=";
        };

        target = targetMap.${system};
        hash = hashMap.${system};

        pocketenv = pkgs.stdenv.mkDerivation rec {
          pname = "pocketenv";
          inherit version;

          src = pkgs.fetchurl {
            url = "https://github.com/pocketenv-io/pocketenv/releases/download/v${version}/pocketenv_v${version}_${target}.tar.gz";
            sha256 = hash;
          };

          dontStrip = true;
          dontPatchELF = true;
          dontAutoPatchelf = true;

          sourceRoot = ".";

          installPhase = ''
            runHook preInstall

            mkdir -p $out/bin
            mkdir -p $out/libexec/${pname}

            install -m755 pocketenv $out/libexec/${pname}/pocketenv

            ${lib.optionalString pkgs.stdenv.isLinux ''
              cat > $out/bin/pocketenv <<'EOF'
#!${pkgs.runtimeShell}
exec "__TARGET__" "$@"
EOF

              substituteInPlace $out/bin/pocketenv \
                --replace-fail "__TARGET__" "$out/libexec/${pname}/pocketenv"

              chmod +x $out/bin/pocketenv
            ''}

            ${lib.optionalString pkgs.stdenv.isDarwin ''
              ln -s $out/libexec/${pname}/pocketenv $out/bin/pocketenv
            ''}

            runHook postInstall
          '';

          meta = with pkgs.lib; {
            description = "pocketenv - the universal sandbox runtime for agents and humans";
            homepage = "https://github.com/pocketenv-io/pocketenv";
            license = licenses.mpl20;
            platforms = [
              "x86_64-linux"
              "aarch64-linux"
              "x86_64-darwin"
              "aarch64-darwin"
            ];
            mainProgram = "pocketenv";
          };
        };
      in {
        packages = {
          default = pocketenv;
          inherit pocketenv;
        };

        apps.default = flake-utils.lib.mkApp {
          drv = pocketenv;
        };

        devShells.default = pkgs.mkShell {
          buildInputs = [ pocketenv ];
        };
      }
    );
}
