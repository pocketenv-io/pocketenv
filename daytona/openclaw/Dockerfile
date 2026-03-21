FROM daytonaio/sandbox:0.6.0

RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends \
    openssh-client \
    git \
    curl \
    ca-certificates \
    gnupg \
    unzip \
    python3 \
    build-essential

RUN curl -fsSL https://tailscale.com/install.sh | sh

RUN curl -fsSL https://openclaw.ai/install.sh | bash || true

RUN npm install -g pm2

RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    code-server --install-extension bastndev.lynx-theme --force && \
    curl -fsSL https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/CascadiaCode.zip -o /tmp/CascadiaCode.zip && \
    mkdir -p /home/daytona/.local/share/fonts && \
    unzip -o /tmp/CascadiaCode.zip -d /home/daytona/.local/share/fonts/CascadiaCode && \
    fc-cache -fv && \
    touch /root/.vscode-setup-done
