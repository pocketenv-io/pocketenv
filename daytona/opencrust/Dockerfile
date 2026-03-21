FROM daytonaio/sandbox:0.6.0

ARG TARGETARCH

RUN sudo apt-get update && sudo apt-get install -y wget

RUN curl -fsSL https://tailscale.com/install.sh | sh

ENV OPENCRUST_VERSION=v0.1.21

RUN case "${TARGETARCH}" in \
    amd64) OPENCRUST_ARCH="x86_64" ;; \
    arm64) OPENCRUST_ARCH="aarch64" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    sudo wget -qO opencrust "https://github.com/opencrust-org/opencrust/releases/download/${OPENCRUST_VERSION}/opencrust-linux-${OPENCRUST_ARCH}" && \
    sudo mkdir -p /home/daytona/.local/bin && \
    sudo mv opencrust /home/daytona/.local/bin && \
    sudo chmod +x /home/daytona/.local/bin/opencrust

ENV PATH="${PATH}:/home/daytona/.local/bin"

RUN npm install -g pm2

USER root
RUN mkdir -p /home/daytona/.local/share/fonts && chown -R daytona:daytona /home/daytona/.local
USER daytona

RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    code-server --install-extension bastndev.lynx-theme --force && \
    curl -fsSL https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/CascadiaMono.zip -o /tmp/CascadiaMono.zip && \
    unzip -o /tmp/CascadiaMono.zip -d /home/daytona/.local/share/fonts/CascadiaMono && \
    fc-cache -fv && \
    touch /home/daytona/.vscode-setup-done
