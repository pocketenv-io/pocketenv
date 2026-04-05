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

        version = "0.6.1";

        targetMap = {
          "x86_64-linux"   = "x86_64-unknown-linux-gnu";
          "aarch64-linux"  = "aarch64-unknown-linux-gnu";
          "x86_64-darwin"  = "x86_64-apple-darwin";
          "aarch64-darwin" = "aarch64-apple-darwin";
        };

        hashMap = {
          "x86_64-linux"   = "sha256-KAFG5YgbTLmJbdNwSA5kQTOYpSusArM3jQ3BY1WGx6M=";
          "aarch64-linux"  = "sha256-rmcC/jP9O9EMz+J1iOKANF4yY+eMJo/PfR5zJSRa+TE=";
          "x86_64-darwin"  = "sha256-1OoFVutCkM1OgRuhQpDB0cp6vmkpmeJd+N8Os3F6XnU=";
          "aarch64-darwin" = "sha256-Axpk7Mt2vsqokXoxp7ZIsXXooADeiTr0AbEFhA8jDwQ=";
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
