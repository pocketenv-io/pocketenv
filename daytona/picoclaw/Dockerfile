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

ENV PATH="${PATH}:/home/daytona/.local/bin"

RUN npm install -g pm2
