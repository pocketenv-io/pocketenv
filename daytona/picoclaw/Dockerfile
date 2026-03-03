FROM daytonaio/sandbox:0.6.0

ARG TARGETARCH

RUN sudo apt-get update && sudo apt-get install -y wget

RUN case "${TARGETARCH}" in \
    amd64) PICOCLAW_ARCH="x86_64" ;; \
    arm64) PICOCLAW_ARCH="arm64" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    wget -qO /tmp/picoclaw.tar.gz "https://github.com/sipeed/picoclaw/releases/download/v0.2.0/picoclaw_Linux_${PICOCLAW_ARCH}.tar.gz" && \
    mkdir -p /home/daytona/.local/bin && \
    tar -xzf /tmp/picoclaw.tar.gz -C /home/daytona/.local/bin && \
    chmod +x /home/daytona/.local/bin/picoclaw

ENV PATH="${PATH}:/home/daytona/.local/bin"
