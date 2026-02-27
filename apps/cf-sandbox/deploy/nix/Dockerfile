FROM ubuntu:latest

RUN apt-get update -y

RUN apt-get install curl git -y

RUN curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install linux \
    --extra-conf "sandbox = false" \
    --init none \
    --no-confirm
ENV PATH="${PATH}:/nix/var/nix/profiles/default/bin"

RUN curl -fsSL https://get.jetify.com/devbox | bash -s -- -f

RUN echo 'extra-trusted-substituters = https://cache.flox.dev' >> /etc/nix/nix.custom.conf \
    && echo 'extra-trusted-public-keys = flox-cache-public-1:7F4OyH7ZCnFhcze3fJdfyXYLQw/aV7GEed86nQ7IsOs=' >> /etc/nix/nix.custom.conf

RUN nix profile add \
    --experimental-features "nix-command flakes" \
    --accept-flake-config \
    'github:flox/flox/latest'

RUN nix profile add nixpkgs#devenv
