FROM jdxcode/mise:latest

RUN apt-get update -y && apt-get install curl git unzip tmux build-essential gawk sed -y

RUN curl -s https://ohmyposh.dev/install.sh | bash -s

RUN curl -s https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/refs/heads/main/themes/tokyonight_storm.omp.json | tee /root/.tokyonight_storm.omp.json >/dev/null && \
    echo 'eval "$(oh-my-posh init bash --config ~/.tokyonight_storm.omp.json)"\n' >> /root/.bashrc

RUN git clone --recursive --depth 1 --shallow-submodules https://github.com/akinomyoga/ble.sh.git && \
    make -C ble.sh install PREFIX=~/.local && \
    rm -rf ble.sh && \
    echo 'source -- ~/.local/share/blesh/ble.sh' >> ~/.bashrc

COPY --from=docker.io/cloudflare/sandbox:0.7.5 /container-server/sandbox /sandbox

EXPOSE 8080
EXPOSE 3000/tcp

ENTRYPOINT ["/sandbox"]
