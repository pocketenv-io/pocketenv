FROM codercom/code-server:latest

ARG TARGETARCH

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    curl \
    s3fs \
    unzip \
    git \
    fontconfig \
    python3 \
    make \
    g++ \
    pkg-config \
    libstdc++-12-dev \
    libicu-dev \
    zlib1g \
    libffi-dev \
    libssl-dev \
    openssl \
    ca-certificates \
    tzdata \
    build-essential \
    libkrb5-dev \
    uidmap \
    fuse-overlayfs \
    dbus-user-session \
    sudo \
    tmux \
    gawk \
    sed \
    procps \
    wget \
    locales-all \
    gnupg \
    squashfs-tools \
    squashfuse \
    fuse \
    fuse-overlayfs \
    && rm -rf /var/lib/apt/lists/* \
    && echo "coder ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/coder

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="amd64"; fi && \
    if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    VERSION=v1.2.1 && \
    curl -L "https://github.com/tigrisdata/tigrisfs/releases/download/${VERSION}/tigrisfs_${VERSION#v}_linux_${ARCH}.tar.gz" -o /tmp/tigrisfs.tar.gz && \
    tar -xzf /tmp/tigrisfs.tar.gz -C /usr/local/bin/ && \
    rm /tmp/tigrisfs.tar.gz && \
    chmod +x /usr/local/bin/tigrisfs

RUN curl -fsSL https://get.docker.com | sh && \
    apt-get install -y --no-install-recommends docker-ce-rootless-extras && \
    rm -rf /var/lib/apt/lists/*

RUN usermod -aG docker coder

COPY --from=docker.io/cloudflare/sandbox:0.7.8 /container-server/sandbox /sandbox

RUN mkdir -p /home/coder && \
    printf '#!/bin/sh\n\
set -eu\n\
sudo dockerd --iptables=false --ip6tables=false &\n\
until docker version >/dev/null 2>&1; do sleep 0.2; done\n\
echo "Docker is ready"\n\
wait\n' > /home/coder/boot-docker-for-dind.sh && chmod +x /home/coder/boot-docker-for-dind.sh

COPY banner.sh /usr/bin

RUN chmod a+x /usr/bin/banner.sh

COPY --from=docker.io/library/node:24 /usr/local/bin/node /usr/local/bin/node

COPY --from=docker.io/library/node:24 /usr/local/include /usr/local/include

COPY --from=docker.io/library/node:24 /usr/local/lib/node_modules /usr/local/lib/node_modules

RUN printf '#!/bin/sh\nexec node /usr/local/lib/node_modules/npm/bin/npm-cli.js "$@"\n' > /usr/local/bin/npm && \
    printf '#!/bin/sh\nexec node /usr/local/lib/node_modules/npm/bin/npx-cli.js "$@"\n' > /usr/local/bin/npx && \
    chmod +x /usr/local/bin/npm /usr/local/bin/npx

RUN curl -fsSL https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/CascadiaMono.zip -o /tmp/CascadiaMono.zip && \
    mkdir -p /usr/share/fonts && \
    unzip -o /tmp/CascadiaMono.zip -d /usr/share/fonts/CascadiaMono && \
    fc-cache -fv

USER coder

RUN curl https://mise.run | sh && \
    curl https://pkgx.sh | sh

RUN curl -s https://ohmyposh.dev/install.sh | bash -s && \
    curl -s https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/refs/heads/main/themes/tokyonight_storm.omp.json | tee ~/.tokyonight_storm.omp.json >/dev/null && \
    echo 'eval "$(oh-my-posh init bash --config ~/.tokyonight_storm.omp.json)"' >> ~/.bashrc

RUN case "${TARGETARCH}" in \
    amd64) EZA_ARCH="x86_64-unknown-linux-musl" ;; \
    arm64) EZA_ARCH="aarch64-unknown-linux-musl" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    wget -qO /tmp/eza.tar.gz "https://github.com/eza-community/eza/releases/latest/download/eza_${EZA_ARCH}.tar.gz" && \
    tar -xzf /tmp/eza.tar.gz -C ~/.local/bin && \
    chmod +x ~/.local/bin/eza && \
    rm /tmp/eza.tar.gz && \
    echo 'alias ls="eza -l"' >> ~/.bashrc

RUN curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | gpg --dearmor | sudo tee /etc/apt/keyrings/doppler.gpg >/dev/null \
    && echo "deb [signed-by=/etc/apt/keyrings/doppler.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list \
    && sudo apt-get update && sudo apt-get install -y doppler && doppler --version

RUN curl -fsSL https://tailscale.com/install.sh | sh

RUN git clone --recursive --depth 1 --shallow-submodules https://github.com/akinomyoga/ble.sh.git && \
    mkdir -p ~/.local && \
    make -C ble.sh install PREFIX=/home/coder/.local && \
    rm -rf ble.sh && \
    echo 'export LANG=en_US.UTF-8' >> ~/.bashrc && \
    echo 'source -- ~/.local/share/blesh/ble.sh' >> ~/.bashrc

RUN curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh && \
    echo 'export PATH=$PATH:$HOME/.deno/bin:$HOME/.atuin/bin:$HOME/.local/bin:$HOME/.npm-global/bin' >> ~/.bashrc && \
    echo 'eval "$(atuin init bash)"' >> ~/.bashrc || true

RUN mkdir -p ~/.npm-global && npm config set prefix "~/.npm-global"

ENV PATH "/root/.deno/bin:/home/coder/.local/bin:/home/coder/.npm-global/bin:${PATH}"

RUN npm install -g @anthropic-ai/claude-code pm2

RUN curl -fsSL https://deno.land/install.sh | sh

RUN curl -fsSL https://bun.sh/install | bash

RUN code-server --install-extension bastndev.lynx-theme --force && \
    touch ~/.vscode-setup-done

RUN wget -qO /tmp/zoxide.tar.gz https://github.com/ajeetdsouza/zoxide/releases/download/v0.9.9/zoxide-0.9.9-x86_64-unknown-linux-musl.tar.gz && \
    tar -xzf /tmp/zoxide.tar.gz -C ~/.local/bin zoxide && \
    chmod +x ~/.local/bin/zoxide && \
    rm /tmp/zoxide.tar.gz && \
    echo 'eval "$(zoxide init bash)"' >> ~/.bashrc

WORKDIR /workspace

ENV COMMAND_TIMEOUT_MS 300000

EXPOSE 8080
EXPOSE 3000/tcp

ENTRYPOINT ["/sandbox"]

CMD ["/home/coder/boot-docker-for-dind.sh"]
