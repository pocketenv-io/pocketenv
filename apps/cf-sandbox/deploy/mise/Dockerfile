FROM jdxcode/mise:latest

ARG TARGETARCH

RUN apt-get update -y && apt-get install curl git unzip tmux build-essential gawk sed procps wget locales-all

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

RUN curl -s https://ohmyposh.dev/install.sh | bash -s

RUN curl -s https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/refs/heads/main/themes/tokyonight_storm.omp.json | tee /root/.tokyonight_storm.omp.json >/dev/null && \
    echo 'eval "$(oh-my-posh init bash --config ~/.tokyonight_storm.omp.json)"' >> /root/.bashrc

RUN git clone --recursive --depth 1 --shallow-submodules https://github.com/akinomyoga/ble.sh.git && \
    mkdir -p /root/.local && \
    make -C ble.sh install PREFIX=/root/.local && \
    rm -rf ble.sh && \
    echo 'export LANG=en_US.UTF-8' >> ~/.bashrc && \
    echo 'source -- ~/.local/share/blesh/ble.sh' >> ~/.bashrc

RUN curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh && \
    echo 'export PATH=$PATH:/root/.atuin/bin' >> ~/.bashrc && \
    echo 'eval "$(atuin init bash)"' >> ~/.bashrc

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

COPY --from=docker.io/cloudflare/sandbox:0.7.8 /container-server/sandbox /sandbox

ENV PATH="/root/.local/bin:${PATH}"

RUN echo 'stty sane' >> ~/.bashrc && \
    echo '. "$HOME/.bashrc"' >> ~/.profile


WORKDIR /workspace

EXPOSE 8080
EXPOSE 3000/tcp

ENV COMMAND_TIMEOUT_MS=300000

ENTRYPOINT ["/sandbox"]
