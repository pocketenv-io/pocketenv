FROM pkgxdev/pkgx:latest

RUN apt-get update -y && apt-get install curl git unzip tmux gawk sed build-essential procps wget -y

RUN curl -s https://ohmyposh.dev/install.sh | bash -s

RUN curl -s https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/refs/heads/main/themes/tokyonight_storm.omp.json | tee /root/.tokyonight_storm.omp.json >/dev/null && \
    echo 'eval "$(oh-my-posh init bash --config ~/.tokyonight_storm.omp.json)"\n' >> /root/.bashrc

RUN git clone --recursive --depth 1 --shallow-submodules https://github.com/akinomyoga/ble.sh.git && \
    mkdir -p /root/.local && \
    make -C ble.sh install PREFIX=/root/.local && \
    rm -rf ble.sh && \
    echo 'source -- ~/.local/share/blesh/ble.sh' >> ~/.bashrc

RUN wget -qO /tmp/eza.tar.gz "https://github.com/eza-community/eza/releases/latest/download/eza_x86_64-unknown-linux-musl.tar.gz" && \
    tar -xzf /tmp/eza.tar.gz -C /root/.local/bin && \
    chmod +x /root/.local/bin/eza && \
    rm /tmp/eza.tar.gz && \
    echo 'alias ls="eza -l"' >> ~/.bashrc

COPY --from=docker.io/cloudflare/sandbox:0.7.5 /container-server/sandbox /sandbox

EXPOSE 8080
EXPOSE 3000/tcp

ENTRYPOINT ["/sandbox"]
