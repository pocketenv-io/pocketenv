FROM node:24-slim

COPY --from=docker.io/cloudflare/sandbox:0.7.5 /container-server/sandbox /sandbox

RUN echo "deb [signed-by=/etc/apt/keyrings/doppler.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-client \
    git \
    curl \
    ca-certificates \
    gnupg \
    unzip \
    python3 \
    build-essential

RUN curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | gpg --dearmor | tee /etc/apt/keyrings/doppler.gpg >/dev/null \
    && echo "deb [signed-by=/etc/apt/keyrings/doppler.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list \
    && apt-get update && apt-get install -y doppler && doppler --version

RUN curl -fsSL https://tailscale.com/install.sh | sh

RUN mkdir -p /root/.npm-global && npm config set prefix "/root/.npm-global"

ENV PATH="/root/.npm-global/bin:${PATH}"

RUN npm install -g \
    opencode-ai \
    pm2

RUN curl -fsSL https://deno.land/install.sh | sh

RUN curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.deno/bin:/root/.local/bin:${PATH}"

RUN echo 'PATH="$HOME/.deno/bin:$HOME/.local/bin:$PATH"' >> ~/.bashrc

WORKDIR /workspace

ENV COMMAND_TIMEOUT_MS=300000

# Required during local development to access exposed ports
EXPOSE 8080
EXPOSE 18789
EXPOSE 3000/tcp

ENTRYPOINT ["/sandbox"]
