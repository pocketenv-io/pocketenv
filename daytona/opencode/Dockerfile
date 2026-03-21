FROM daytonaio/sandbox:0.6.0

RUN curl -fsSL https://tailscale.com/install.sh | sh

RUN mkdir -p /home/daytona/.npm-global && npm config set prefix "/home/daytona/.npm-global"

ENV PATH="/home/daytona/.npm-global/bin:${PATH}"

RUN npm install -g \
    opencode-ai \
    pm2

USER root
RUN mkdir -p /home/daytona/.local/share/fonts && chown -R daytona:daytona /home/daytona/.local
USER daytona

RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    code-server --install-extension bastndev.lynx-theme --force && \
    curl -fsSL https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/CascadiaCode.zip -o /tmp/CascadiaCode.zip && \
    unzip -o /tmp/CascadiaCode.zip -d /home/daytona/.local/share/fonts/CascadiaCode && \
    fc-cache -fv && \
    touch /home/daytona/.vscode-setup-done
