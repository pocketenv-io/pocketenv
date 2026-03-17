FROM daytonaio/sandbox:0.6.0

RUN mkdir -p /home/daytona/.npm-global && npm config set prefix "/home/daytona/.npm-global"

RUN curl -fsSL https://tailscale.com/install.sh | sh

ENV PATH="/home/daytona/.npm-global/bin:${PATH}"

RUN npm install -g \
    @sourcegraph/amp \
    pm2
