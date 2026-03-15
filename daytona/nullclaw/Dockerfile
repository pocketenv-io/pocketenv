FROM daytonaio/sandbox:0.6.0

ARG TARGETARCH

RUN sudo apt-get update && sudo apt-get install -y wget

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
