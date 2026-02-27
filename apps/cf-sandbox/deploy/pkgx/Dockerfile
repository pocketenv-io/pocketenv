FROM pkgxdev/pkgx:latest

COPY --from=docker.io/cloudflare/sandbox:0.7.5 /container-server/sandbox /sandbox

EXPOSE 8080
EXPOSE 3000/tcp

ENTRYPOINT ["/sandbox"]
