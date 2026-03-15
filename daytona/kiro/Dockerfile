FROM daytonaio/sandbox:0.6.0

RUN mkdir -p /home/daytona/.local/bin && \
    curl -fsSL https://cli.kiro.dev/install | bash

ENV PATH="${PATH}:/home/daytona/.local/bin"

RUN npm install -g pm2
