FROM daytonaio/sandbox:0.6.0

RUN curl -fsSL https://tailscale.com/install.sh | sh

RUN curl https://mise.run | sh

RUN npm install -g pm2

RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    code-server --install-extension bastndev.lynx-theme --force && \
    curl -fsSL https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/CascadiaCode.zip -o /tmp/CascadiaCode.zip && \
    unzip -o /tmp/CascadiaCode.zip -d /usr/local/share/fonts/CascadiaCode && \
    fc-cache -fv && \
    touch /root/.vscode-setup-done
