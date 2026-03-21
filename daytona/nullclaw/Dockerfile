FROM daytonaio/sandbox:0.6.0

ARG TARGETARCH

RUN sudo apt-get update && sudo apt-get install -y wget

RUN curl -fsSL https://tailscale.com/install.sh | sh

RUN case "${TARGETARCH}" in \
    amd64) NULLCLAW_ARCH="x86_64" ;; \
    arm64) NULLCLAW_ARCH="aarch64" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    sudo wget -qO nullclaw "https://github.com/nullclaw/nullclaw/releases/latest/download/nullclaw-linux-${NULLCLAW_ARCH}.bin" && \
    sudo mkdir -p /home/daytona/.local/bin && \
    sudo mv nullclaw /home/daytona/.local/bin && \
    sudo chmod +x /home/daytona/.local/bin/nullclaw

ENV PATH="${PATH}:/home/daytona/.local/bin"

RUN npm install -g pm2

USER root
RUN mkdir -p /home/daytona/.local/share/fonts && chown -R daytona:daytona /home/daytona/.local
USER daytona

RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    code-server --install-extension bastndev.lynx-theme --force && \
    curl -fsSL https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/CascadiaCode.zip -o /tmp/CascadiaCode.zip && \
    unzip -o /tmp/CascadiaCode.zip -d /home/daytona/.local/share/fonts/CascadiaCode && \
    fc-cache -fv && \
    touch /home/daytona/.vscode-setup-done
