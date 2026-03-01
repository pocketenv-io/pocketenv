FROM node:24-slim

ARG TARGETARCH

COPY --from=docker.io/cloudflare/sandbox:0.7.8 /container-server/sandbox /sandbox

RUN echo "deb [signed-by=/etc/apt/keyrings/doppler.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-client \
    git \
    curl \
    ca-certificates \
    gnupg \
    unzip \
    python3 \
    build-essential \
    tmux \
    gawk \
    sed \
    procps \
    wget

RUN curl -s https://ohmyposh.dev/install.sh | bash -s

RUN git clone --recursive --depth 1 --shallow-submodules https://github.com/akinomyoga/ble.sh.git && \
    mkdir -p /root/.local && \
    make -C ble.sh install PREFIX=/root/.local && \
    rm -rf ble.sh && \
    echo 'source -- ~/.local/share/blesh/ble.sh' >> ~/.bashrc

RUN curl -s https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/refs/heads/main/themes/tokyonight_storm.omp.json | tee /root/.tokyonight_storm.omp.json >/dev/null && \
    echo 'eval "$(oh-my-posh init bash --config ~/.tokyonight_storm.omp.json)"\n' >> /root/.bashrc


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

RUN curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | gpg --dearmor | tee /etc/apt/keyrings/doppler.gpg >/dev/null \
    && echo "deb [signed-by=/etc/apt/keyrings/doppler.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list \
    && apt-get update && apt-get install -y doppler && doppler --version

RUN curl -fsSL https://tailscale.com/install.sh | sh

RUN mkdir -p /root/.npm-global && npm config set prefix "/root/.npm-global"

ENV PATH="/root/.npm-global/bin:${PATH}"

RUN npm install -g \
    @charmland/crush \
    pm2

RUN curl -fsSL https://deno.land/install.sh | sh

RUN curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.deno/bin:/root/.local/bin:${PATH}"

RUN echo 'PATH="$HOME/.deno/bin:$HOME/.local/bin:$PATH"' >> ~/.bashrc

WORKDIR /workspace

ENV COMMAND_TIMEOUT_MS=300000

# Required during local development to access exposed ports
EXPOSE 8080
EXPOSE 18789
EXPOSE 3000/tcp

ENTRYPOINT ["/sandbox"]
