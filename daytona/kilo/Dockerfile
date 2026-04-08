FROM daytonaio/sandbox:0.6.0

USER root
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="amd64"; fi && \
    if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    VERSION=$(curl -s https://api.github.com/repos/tigrisdata/tigrisfs/releases/latest | grep -o '"tag_name": "[^"]*' | cut -d'"' -f4) && \
    curl -L "https://github.com/tigrisdata/tigrisfs/releases/download/${VERSION}/tigrisfs_${VERSION#v}_linux_${ARCH}.tar.gz" -o /tmp/tigrisfs.tar.gz && \
    tar -xzf /tmp/tigrisfs.tar.gz -C /usr/local/bin/ && \
    rm /tmp/tigrisfs.tar.gz && \
    chmod +x /usr/local/bin/tigrisfs
USER daytona

RUN curl -fsSL https://tailscale.com/install.sh | sh

RUN mkdir -p /home/daytona/.npm-global && npm config set prefix "/home/daytona/.npm-global"

ENV PATH="/home/daytona/.local/bin:/home/daytona/.npm-global/bin:${PATH}"

RUN npm install -g \
    @kilocode/cli \
    pm2

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

RUN curl -fsSL https://zerobrew.rs/install | bash
