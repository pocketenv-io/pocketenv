FROM daytonaio/sandbox:0.6.0

ARG TARGETARCH

RUN sudo apt-get update && sudo apt-get install -y wget

RUN curl -fsSL https://tailscale.com/install.sh | sh

ENV PICOCLAW_VERSION=v0.2.2

RUN case "${TARGETARCH}" in \
    amd64) PICOCLAW_ARCH="x86_64" ;; \
    arm64) PICOCLAW_ARCH="arm64" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    sudo wget -qO /tmp/picoclaw.tar.gz "https://github.com/sipeed/picoclaw/releases/download/${PICOCLAW_VERSION}/picoclaw_Linux_${PICOCLAW_ARCH}.tar.gz" && \
    sudo mkdir -p /home/daytona/.local/bin && \
    sudo tar -xzf /tmp/picoclaw.tar.gz -C /home/daytona/.local/bin && \
    sudo chmod +x /home/daytona/.local/bin/picoclaw

ENV PATH="/home/daytona/.local/bin:/home/daytona/.npm-global/bin:${PATH}"

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

RUN curl -fsSL https://github.com/ajeetdsouza/zoxide/releases/download/v0.9.9/zoxide-0.9.9-x86_64-unknown-linux-musl.tar.gz -o /tmp/zoxide.tar.gz && \
    mkdir -p ~/.local/bin && \
    tar -xzf /tmp/zoxide.tar.gz -C ~/.local/bin zoxide && \
    chmod +x ~/.local/bin/zoxide && \
    rm /tmp/zoxide.tar.gz && \
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && \
    echo 'eval "$(zoxide init bash)"' >> ~/.bashrc
