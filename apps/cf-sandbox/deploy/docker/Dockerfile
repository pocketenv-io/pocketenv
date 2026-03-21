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
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://get.docker.com | sh && \
    apt-get install -y --no-install-recommends docker-ce-rootless-extras && \
    rm -rf /var/lib/apt/lists/*

RUN echo "coder:100000:65536" >> /etc/subuid && \
    echo "coder:100000:65536" >> /etc/subgid

RUN curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh && \
    echo 'export PATH=$PATH:/root/.atuin/bin:/root/.local/bin:/root/.npm-global/bin' >> ~/.bashrc && \
    echo 'eval "$(atuin init bash)"' >> ~/.bashrc || true

COPY --from=docker.io/cloudflare/sandbox:0.7.8 /container-server/sandbox /sandbox

RUN mkdir -p /home/coder && \
    printf '#!/bin/sh\n\
set -eu\n\
export XDG_RUNTIME_DIR=/run/user/1000\n\
export DOCKER_HOST=unix:///run/user/1000/docker.sock\n\
mkdir -p "$XDG_RUNTIME_DIR"\n\
su -s /bin/sh coder -c "XDG_RUNTIME_DIR=$XDG_RUNTIME_DIR dockerd-rootless.sh --iptables=false --ip6tables=false" &\n\
until DOCKER_HOST="$DOCKER_HOST" docker version >/dev/null 2>&1; do sleep 0.2; done\n\
echo "Docker is ready"\n\
wait\n' > /home/coder/boot-docker-for-dind.sh && chmod +x /home/coder/boot-docker-for-dind.sh

COPY banner.sh /usr/bin

RUN chmod a+x /usr/bin/banner.sh && \
    echo 'source /root/.bashrc' >> ~/.profile

COPY --from=docker.io/library/node:22 /usr/local/bin/node /usr/local/bin/node

COPY --from=docker.io/library/node:22 /usr/local/include /usr/local/include

COPY --from=docker.io/library/node:22 /usr/local/lib/node_modules /usr/local/lib/node_modules

RUN printf '#!/bin/sh\nexec node /usr/local/lib/node_modules/npm/bin/npm-cli.js "$@"\n' > /usr/local/bin/npm && \
    printf '#!/bin/sh\nexec node /usr/local/lib/node_modules/npm/bin/npx-cli.js "$@"\n' > /usr/local/bin/npx && \
    chmod +x /usr/local/bin/npm /usr/local/bin/npx

RUN mkdir -p /root/.npm-global && npm config set prefix "/root/.npm-global"

ENV PATH "/root/.local/bin:/root/.npm-global/bin:${PATH}"

RUN code-server --install-extension bastndev.lynx-theme --force && \
    curl -fsSL https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/CascadiaCode.zip -o /tmp/CascadiaCode.zip && \
    mkdir -p /usr/share/fonts && \
    unzip -o /tmp/CascadiaCode.zip -d /usr/share/fonts/CascadiaCode && \
    fc-cache -fv && \
    touch /root/.vscode-setup-done

WORKDIR /workspace

ENV COMMAND_TIMEOUT_MS 300000

EXPOSE 8080
EXPOSE 3000/tcp

ENTRYPOINT ["/sandbox"]

CMD ["/home/coder/boot-docker-for-dind.sh"]
