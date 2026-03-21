FROM daytonaio/sandbox:0.6.0

ARG TARGETARCH

RUN curl -fsSL https://tailscale.com/install.sh | sh

RUN sudo apt-get update && sudo apt-get install -y wget

ENV ZEROCLAW_VERSION=v0.1.7

RUN case "${TARGETARCH}" in \
    amd64) ZEROCLAW_ARCH="x86_64" ;; \
    arm64) ZEROCLAW_ARCH="aarch64" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    sudo wget -qO /tmp/zeroclaw.tar.gz "https://github.com/zeroclaw-labs/zeroclaw/releases/download/${ZEROCLAW_VERSION}/zeroclaw-${ZEROCLAW_ARCH}-unknown-linux-gnu.tar.gz" && \
    sudo mkdir -p /home/daytona/.local/bin && \
    sudo tar -xzf /tmp/zeroclaw.tar.gz -C /home/daytona/.local/bin && \
    sudo chmod +x /home/daytona/.local/bin/zeroclaw

ENV PATH="${PATH}:/home/daytona/.local/bin"

RUN npm install -g pm2

RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    code-server --install-extension bastndev.lynx-theme --force && \
    curl -fsSL https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/CascadiaCode.zip -o /tmp/CascadiaCode.zip && \
    mkdir -p /home/daytona/.local/share/fonts && \
    unzip -o /tmp/CascadiaCode.zip -d /home/daytona/.local/share/fonts/CascadiaCode && \
    fc-cache -fv && \
    touch /home/daytona/.vscode-setup-done
