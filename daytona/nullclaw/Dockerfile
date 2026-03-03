FROM daytonaio/sandbox:0.6.0

RUN apt-get update && apt-get install -y wget

RUN case "${TARGETARCH}" in \
    amd64) NULLCLAW_ARCH="x86_64" ;; \
    arm64) NULLCLAW_ARCH="aarch64" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    wget -qO nullclaw "https://github.com/nullclaw/nullclaw/releases/latest/download/nullclaw-linux-${NULLCLAW_ARCH}.bin" && \
    mkdir -p /home/daytona/.local/bin && \
    mv nullclaw /home/daytona/.local/bin && \
    chmod +x /home/daytona/.local/bin/nullclaw

ENV PATH="${PATH}:/home/daytona/.local/bin"
