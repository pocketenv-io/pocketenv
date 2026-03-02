FROM ubuntu:latest

ARG TARGETARCH

COPY --from=docker.io/cloudflare/sandbox:0.7.8 /container-server/sandbox /sandbox

RUN apt-get update -y

RUN apt-get install curl git unzip tmux wget -y

RUN curl -s https://ohmyposh.dev/install.sh | bash -s

RUN curl -s https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/refs/heads/main/themes/tokyonight_storm.omp.json | tee /root/.tokyonight_storm.omp.json >/dev/null && \
    echo 'eval "$(oh-my-posh init bash --config ~/.tokyonight_storm.omp.json)"' >> /root/.bashrc

RUN git clone --recursive --depth 1 --shallow-submodules https://github.com/akinomyoga/ble.sh.git && \
    mkdir -p /root/.local && \
    make -C ble.sh install PREFIX=/root/.local && \
    rm -rf ble.sh && \
    echo 'export LANG=en_US.UTF-8' >> ~/.bashrc && \
    echo 'source -- ~/.local/share/blesh/ble.sh' >> ~/.bashrc

RUN case "${TARGETARCH}" in \
    amd64) EZA_ARCH="x86_64-unknown-linux-musl" ;; \
    arm64) EZA_ARCH="aarch64-unknown-linux-musl" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    wget -qO /tmp/eza.tar.gz "https://github.com/eza-community/eza/releases/latest/download/eza_${EZA_ARCH}.tar.gz" && \
    tar -xzf /tmp/eza.tar.gz -C /root/.local/bin && \
    chmod +x /root/.local/bin/eza && \
    rm /tmp/eza.tar.gz && \
    echo 'alias ls="eza -l"' >> ~/.bashrc

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

ENV PATH="/root/.local/bin:${PATH}"

RUN echo 'stty sane' >> ~/.bashrc && \
    echo '. "$HOME/.bashrc"' >> ~/.profile

WORKDIR /workspace

EXPOSE 8080
EXPOSE 3000/tcp

ENV COMMAND_TIMEOUT_MS=300000

ENTRYPOINT ["/sandbox"]
