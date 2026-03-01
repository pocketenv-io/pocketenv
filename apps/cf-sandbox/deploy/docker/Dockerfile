FROM docker:dind-rootless

USER root

RUN apk update && apk add --no-cache bash

# Use the musl build so it runs on Alpine-based docker:dind-rootless
COPY --from=docker.io/cloudflare/sandbox:0.7.5-musl /container-server/sandbox /sandbox
COPY --from=docker.io/cloudflare/sandbox:0.7.5-musl /usr/lib/libstdc++.so.6 /usr/lib/libstdc++.so.6
COPY --from=docker.io/cloudflare/sandbox:0.7.5-musl /usr/lib/libgcc_s.so.1 /usr/lib/libgcc_s.so.1
COPY --from=docker.io/cloudflare/sandbox:0.7.5-musl /bin/bash /bin/bash
COPY --from=docker.io/cloudflare/sandbox:0.7.5-musl /usr/lib/libreadline.so.8 /usr/lib/libreadline.so.8
COPY --from=docker.io/cloudflare/sandbox:0.7.5-musl /usr/lib/libreadline.so.8.2 /usr/lib/libreadline.so.8.2

# Create startup script that starts dockerd with
# iptables disabled, waits for readiness, then keeps running
RUN printf '#!/bin/sh\n\
    set -eu\n\
    dockerd-entrypoint.sh dockerd --iptables=false --ip6tables=false &\n\
    until docker version >/dev/null 2>&1; do sleep 0.2; done\n\
    echo "Docker is ready"\n\
    wait\n' > /home/rootless/boot-docker-for-dind.sh && chmod +x /home/rootless/boot-docker-for-dind.sh

ENV COMMAND_TIMEOUT_MS=300000

ENTRYPOINT ["/sandbox"]

CMD ["/home/rootless/boot-docker-for-dind.sh"]
