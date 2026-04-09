FROM node:lts-trixie-slim

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
    && useradd -m -s /bin/bash modal \
    && echo "modal ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/modal

ARG TARGETARCH

USER root
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="amd64"; fi && \
    if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    VERSION=$(curl -s https://api.github.com/repos/tigrisdata/tigrisfs/releases/latest | grep -o '"tag_name": "[^"]*' | cut -d'"' -f4) && \
    curl -L "https://github.com/tigrisdata/tigrisfs/releases/download/${VERSION}/tigrisfs_${VERSION#v}_linux_${ARCH}.tar.gz" -o /tmp/tigrisfs.tar.gz && \
    tar -xzf /tmp/tigrisfs.tar.gz -C /usr/local/bin/ && \
    rm /tmp/tigrisfs.tar.gz && \
    chmod +x /usr/local/bin/tigrisfs
USER modal

RUN sudo apt-get update && sudo apt-get install -y wget

RUN curl -fsSL https://tailscale.com/install.sh | sh

ENV PICOCLAW_VERSION=v0.2.2

RUN case "${TARGETARCH}" in \
    amd64) PICOCLAW_ARCH="x86_64" ;; \
    arm64) PICOCLAW_ARCH="arm64" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    sudo wget -qO /tmp/picoclaw.tar.gz "https://github.com/sipeed/picoclaw/releases/download/${PICOCLAW_VERSION}/picoclaw_Linux_${PICOCLAW_ARCH}.tar.gz" && \
    sudo mkdir -p /home/modal/.local/bin && \
    sudo tar -xzf /tmp/picoclaw.tar.gz -C /home/modal/.local/bin && \
    sudo chmod +x /home/modal/.local/bin/picoclaw

RUN mkdir -p /home/modal/.npm-global && npm config set prefix "/home/modal/.npm-global"

ENV PATH="/home/modal/.local/bin:/home/modal/.npm-global/bin:${PATH}"

RUN npm install -g pm2

USER root
RUN mkdir -p /home/modal/.local/share/fonts && chown -R modal:modal /home/modal/.local
USER modal

RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    code-server --install-extension bastndev.lynx-theme --force && \
    curl -fsSL https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/CascadiaMono.zip -o /tmp/CascadiaMono.zip && \
    unzip -o /tmp/CascadiaMono.zip -d /home/modal/.local/share/fonts/CascadiaMono && \
    fc-cache -fv && \
    touch /home/modal/.vscode-setup-done

RUN curl -fsSL https://github.com/ajeetdsouza/zoxide/releases/download/v0.9.9/zoxide-0.9.9-x86_64-unknown-linux-musl.tar.gz -o /tmp/zoxide.tar.gz && \
    mkdir -p ~/.local/bin && \
    tar -xzf /tmp/zoxide.tar.gz -C ~/.local/bin zoxide && \
    chmod +x ~/.local/bin/zoxide && \
    rm /tmp/zoxide.tar.gz && \
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && \
    echo 'eval "$(zoxide init bash)"' >> ~/.bashrc

RUN curl -fsSL https://zerobrew.rs/install | bash
