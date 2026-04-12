FROM node:lts-trixie-slim

SHELL ["/bin/bash", "-c"]

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
    wget \
    locales-all \
    s3fs \
    fontconfig \
    sudo \
    squashfs-tools \
    squashfuse \
    fuse \
    fuse-overlayfs \
    && useradd -m -s /bin/bash coder \
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

RUN curl -s https://ohmyposh.dev/install.sh | bash -s && \
    curl -s https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/refs/heads/main/themes/tokyonight_storm.omp.json | tee /root/.tokyonight_storm.omp.json >/dev/null && \
    echo 'eval "$(oh-my-posh init bash --config ~/.tokyonight_storm.omp.json)"' >> /root/.bashrc


RUN git clone --recursive --depth 1 --shallow-submodules https://github.com/akinomyoga/ble.sh.git && \
    mkdir -p /root/.local && \
    make -C ble.sh install PREFIX=/root/.local && \
    rm -rf ble.sh && \
    echo 'export LANG=en_US.UTF-8' >> ~/.bashrc && \
    echo 'source -- ~/.local/share/blesh/ble.sh' >> ~/.bashrc

RUN curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh && \
    echo 'export PATH=$PATH:/root/.atuin/bin' >> ~/.bashrc && \
    echo 'eval "$(atuin init bash)"' >> ~/.bashrc || true

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

ENV PATH "/root/.npm-global/bin:${PATH}"

RUN npm install -g \
    @anthropic-ai/claude-code \
    pm2

RUN curl -fsSL https://deno.land/install.sh | sh

RUN curl -fsSL https://bun.sh/install | bash

ENV PATH "/root/.deno/bin:/root/.local/bin:${PATH}"

RUN echo 'PATH="$HOME/.deno/bin:$HOME/.local/bin:$PATH"' >> ~/.bashrc && \
    echo 'stty sane' >> ~/.bashrc && \
    echo '. "$HOME/.bashrc"' >> ~/.profile


COPY banner.sh /root/.local/bin

RUN chmod a+x /root/.local/bin/banner.sh

RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    code-server --install-extension bastndev.lynx-theme --force && \
    curl -fsSL https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/CascadiaMono.zip -o /tmp/CascadiaMono.zip && \
    mkdir -p /usr/share/fonts && \
    unzip -o /tmp/CascadiaMono.zip -d /usr/share/fonts/CascadiaMono && \
    fc-cache -fv && \
    touch /root/.vscode-setup-done

RUN wget -qO /tmp/zoxide.tar.gz https://github.com/ajeetdsouza/zoxide/releases/download/v0.9.9/zoxide-0.9.9-x86_64-unknown-linux-musl.tar.gz && \
    tar -xzf /tmp/zoxide.tar.gz -C ~/.local/bin zoxide && \
    chmod +x ~/.local/bin/zoxide && \
    rm /tmp/zoxide.tar.gz && \
    echo 'eval "$(zoxide init bash)"' >> ~/.bashrc

USER coder
RUN mkdir -p /home/coder && curl -fsSL https://zerobrew.rs/install | bash
USER root

RUN mv /home/coder/.local/bin/* ~/.local/bin

WORKDIR /workspace

ENV COMMAND_TIMEOUT_MS 300000

# Required during local development to access exposed ports
EXPOSE 8080
EXPOSE 18789
EXPOSE 3000/tcp

ENTRYPOINT ["/sandbox"]
