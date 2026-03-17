FROM daytonaio/sandbox:0.6.0

RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends \
    openssh-client \
    git \
    curl \
    ca-certificates \
    gnupg \
    unzip \
    python3 \
    build-essential

RUN curl -fsSL https://tailscale.com/install.sh | sh

RUN curl -fsSL https://openclaw.ai/install.sh | bash || true

RUN npm install -g pm2
