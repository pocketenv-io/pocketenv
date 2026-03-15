FROM daytonaio/sandbox:0.6.0

ARG TARGETARCH

RUN sudo apt-get update && sudo apt-get install -y wget

ENV OPENCRUST_VERSION=v0.1.21

RUN case "${TARGETARCH}" in \
    amd64) OPENCRUST_ARCH="x86_64" ;; \
    arm64) OPENCRUST_ARCH="aarch64" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    sudo wget -qO opencrust "https://github.com/opencrust-org/opencrust/releases/download/${OPENCRUST_VERSION}/opencrust-linux-${OPENCRUST_ARCH}" && \
    sudo mkdir -p /home/daytona/.local/bin && \
    sudo mv opencrust /home/daytona/.local/bin && \
    sudo chmod +x /home/daytona/.local/bin/opencrust

ENV PATH="${PATH}:/home/daytona/.local/bin"

RUN npm install -g pm2
