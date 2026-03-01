FROM pkgxdev/pkgx:latest

ARG TARGETARCH

RUN apt-get update -y && apt-get install curl git unzip wget -y

RUN curl -s https://ohmyposh.dev/install.sh | bash -s

RUN curl -s https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/refs/heads/main/themes/tokyonight_storm.omp.json | tee /root/.tokyonight_storm.omp.json >/dev/null && \
    echo 'eval "$(oh-my-posh init bash --config ~/.tokyonight_storm.omp.json)"\n' >> /root/.bashrc

RUN case "${TARGETARCH}" in \
    amd64) EZA_ARCH="x86_64-unknown-linux-musl" ;; \
    arm64) EZA_ARCH="aarch64-unknown-linux-musl" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    wget -qO /tmp/eza.tar.gz "https://github.com/eza-community/eza/releases/latest/download/eza_${EZA_ARCH}.tar.gz" && \
    tar -xzf /tmp/eza.tar.gz -C /root/.local/bin && \
    chmod +x /root/.local/bin/eza && \
    rm /tmp/eza.tar.gz && \
    echo 'alias ls="eza -l"' >> ~/.bashrc

COPY --from=docker.io/cloudflare/sandbox:0.7.5 /container-server/sandbox /sandbox

WORKDIR /workspace

EXPOSE 8080
EXPOSE 3000/tcp

ENV COMMAND_TIMEOUT_MS=300000

ENTRYPOINT ["/sandbox"]
