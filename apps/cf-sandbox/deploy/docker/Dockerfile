FROM codercom/code-server:latest

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    curl \
    s3fs \
    unzip \
    git \
    fontconfig \
    python3 \
    make \
    g++ \
    pkg-config \
    libstdc++-12-dev \
    libicu-dev \
    zlib1g \
    libffi-dev \
    libssl-dev \
    openssl \
    ca-certificates \
    tzdata \
    build-essential \
    libkrb5-dev \
    uidmap \
    fuse-overlayfs \
    dbus-user-session \
    sudo \
    && rm -rf /var/lib/apt/lists/* \
    && echo "coder ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/coder

RUN curl -fsSL https://get.docker.com | sh && \
    apt-get install -y --no-install-recommends docker-ce-rootless-extras && \
    rm -rf /var/lib/apt/lists/*

RUN usermod -aG docker coder

COPY --from=docker.io/cloudflare/sandbox:0.7.8 /container-server/sandbox /sandbox

RUN mkdir -p /home/coder && \
    printf '#!/bin/sh\n\
set -eu\n\
sudo dockerd --iptables=false --ip6tables=false &\n\
until docker version >/dev/null 2>&1; do sleep 0.2; done\n\
echo "Docker is ready"\n\
wait\n' > /home/coder/boot-docker-for-dind.sh && chmod +x /home/coder/boot-docker-for-dind.sh

COPY banner.sh /usr/bin

RUN chmod a+x /usr/bin/banner.sh

COPY --from=docker.io/library/node:22 /usr/local/bin/node /usr/local/bin/node

COPY --from=docker.io/library/node:22 /usr/local/include /usr/local/include

COPY --from=docker.io/library/node:22 /usr/local/lib/node_modules /usr/local/lib/node_modules

RUN printf '#!/bin/sh\nexec node /usr/local/lib/node_modules/npm/bin/npm-cli.js "$@"\n' > /usr/local/bin/npm && \
    printf '#!/bin/sh\nexec node /usr/local/lib/node_modules/npm/bin/npx-cli.js "$@"\n' > /usr/local/bin/npx && \
    chmod +x /usr/local/bin/npm /usr/local/bin/npx

RUN curl -fsSL https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/CascadiaCode.zip -o /tmp/CascadiaCode.zip && \
    mkdir -p /usr/share/fonts && \
    unzip -o /tmp/CascadiaCode.zip -d /usr/share/fonts/CascadiaCode && \
    fc-cache -fv

USER coder

RUN curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh && \
    echo 'export PATH=$PATH:$HOME/.atuin/bin:$HOME/.local/bin:$HOME/.npm-global/bin' >> ~/.bashrc && \
    echo 'eval "$(atuin init bash)"' >> ~/.bashrc || true

RUN mkdir -p ~/.npm-global && npm config set prefix "~/.npm-global"

ENV PATH "/home/coder/.local/bin:/home/coder/.npm-global/bin:${PATH}"

RUN code-server --install-extension bastndev.lynx-theme --force && \
    touch ~/.vscode-setup-done

WORKDIR /workspace

ENV COMMAND_TIMEOUT_MS 300000

EXPOSE 8080
EXPOSE 3000/tcp

ENTRYPOINT ["/sandbox"]

CMD ["/home/coder/boot-docker-for-dind.sh"]
