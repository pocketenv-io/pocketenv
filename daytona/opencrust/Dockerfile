FROM daytonaio/sandbox:0.6.0

RUN sudo apt-get update && sudo apt-get install -y wget

RUN case "${TARGETARCH}" in \
    amd64) OPENCRUST_ARCH="x86_64" ;; \
    arm64) OPENCRUST_ARCH="aarch64" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    wget -qO opencrust "https://github.com/opencrust-org/opencrust/releases/download/v0.1.19/opencrust-linux-${OPENCRUST_ARCH}" && \
    mkdir -p /home/daytona/.local/bin && \
    mv opencrust /home/daytona/.local/bin && \
    chmod +x /home/daytona/.local/bin/opencrust

ENV PATH="${PATH}:/home/daytona/.local/bin"
