# Changelog

All notable changes to this project will be documented in this file.

## [0.3.1] - 2026-03-22

### Added

- **Wasmer sandbox deployment**: New Wasmer runtime provider.
- **Wasmer runtime in sandbox config**: Added Wasmer as a supported runtime option in sandbox configuration.
- **`pocketenv exec` command**: New CLI command to execute commands inside a running sandbox via the exec RPC endpoint.
- **Sandbox exec API**: New API endpoint for executing commands in sandboxes.
- **Specify repo when starting sandbox**: The `start` command now accepts a `--repo` flag to clone a repository when starting a sandbox.
- **Zoxide**: Added `zoxide` to sandbox images for smart directory jumping.
- **`~/.local/bin` in PATH**: Sandbox images now include `~/.local/bin` in `PATH`.
- **Deno in PATH**: Deno binary is now correctly added to `PATH` in sandbox Dockerfiles.
- **`TARGETARCH` build arg**: `cf-sandbox` Dockerfile now uses `TARGETARCH` for multi-architecture builds.

### Changed

- **Enhanced cf-sandbox Dockerfile**: Added more developer tools to the Cloudflare sandbox image.
- **`code-server` settings path**: Now uses `$HOME` for the code-server settings path for correctness across users.
- **Cloudflare sandbox wrangler instances**: Switched to `standard-3` instance type.
- **CI: Bun install via script**: GitHub Actions workflows now install Bun via the official install script instead of a pinned action version.
- **Sandbox ID generation**: Sandbox IDs are now generated using `getRandomValues` (16-byte, random) for better uniqueness.
- **Sandbox creation**: Uses `record.sandboxId` when creating sandbox records.
- **Sandbox provider validation**: Cloudflare provider is now required and `sandboxId` must be empty on creation.
- **Sandbox run validation**: Sandbox must be in RUNNING state before a run can be created.
- **Sandbox lookup**: Uses `sandboxId` field consistently when retrieving sandboxes.
- **Sandbox start order**: Sandbox is now started before fetching params and cloning the repository.
- **Instance resources**: Sandbox configs now specify explicit instance resource requirements.

### Fixed

- Fixed newline not being appended to stdout/stderr when missing.
- Fixed duplicate sandbox port inserts.

---

## [0.3.0] - 2026-03-22

### Added

- **VS Code in browser (code-server)**: Sandboxes now include a full VS Code experience via [code-server](https://coder.com/docs/code-server), using the Lynx theme and CascadiaMono font by default.
- **`exposeVscode` endpoint and CLI command**: Expose the VS Code (code-server) port directly from the CLI with `pocketenv vscode`.
- **Rootless Docker support**: Sandbox images now run `dockerd` as the `coder` user with rootless Docker enabled.
- **Node.js 22**: Sandbox images now ship Node.js 22 (Alpine), replacing the manual tarball approach.
- **`exposePort` preview URL**: The `expose` command now returns and displays the preview URL after successfully exposing a port.
- **Port 1024 support**: Port 1024 is now accepted in both `exposePort` and `unexposePort` schemas.
- **Tailscale support**: Sandboxes can now connect to a Tailscale network; auth keys are decrypted and passed to `setupTailscale` automatically.
- **Repository cloning**: Sandboxes can clone a git repository on terminal open, with SSH keys generated and `ssh-keyscan` entries pre-configured for GitHub and Tangled.
- **SSH option for `create`**: `pocketenv create --ssh` provisions sandboxes with SSH key support.
- **Volume and file CLI commands**: New `pocketenv volume` and `pocketenv file` subcommands for managing sandbox volumes and files.
- **Port CLI commands**: New `pocketenv port expose` and `pocketenv port unexpose` commands.
- **Sandbox lookup by name, ID, or URI**: Sandboxes can now be looked up by any of these identifiers from the CLI and API.
- **R2 volume mounting**: Cloudflare sandbox volumes are mounted via `s3fs-fuse` with an optional path prefix.
- **Colored ASCII banner in CLI**: The CLI now displays a styled ASCII banner on startup.
- **Install script**: A standalone `install.sh` script is available for quick installation on Linux and macOS.

### Changed

- **Font standardized to CascadiaMono**: All sandbox Docker images now consistently use CascadiaMono (WOFF2/TTF) for the terminal and VS Code.
- **`npm`/`npx` wrappers**: Sandbox images now use `sh` wrapper scripts pointing to `npm-cli.js` and `npx-cli.js` for reliable Node invocation.
- **Dockerfile hygiene**: Normalized `ENV` syntax, removed stray characters, and cleaned up PATH configuration across all sandbox Dockerfiles.
- **`fontconfig` installed**: Font directory ownership and `fontconfig` package are now set up correctly in sandbox images.
- **`alpine-sdk` and `krb5-dev`**: Added to Dockerfile for builds that require native compilation.
- **Sandbox port minimum raised to 1024** (was 1025 in some paths; now consistently 1024+).
- **Sandbox IDs normalized to lowercase**.
- **Sandbox ports synced to AT Protocol records**.
- **`sandbox stop` now unmounts volumes** before stopping the container.
- **`sudo` added to sandbox images** for the `coder` user.
- **CLI theme and output**: Uses theme colors consistently; `consola.success` for success messages; piped secrets are now supported.
- **Cloudflare sandbox session code disabled** (temporary, pending rework).

### Fixed

- Fixed VS Code port not being special-cased during port exposure.
- Fixed `sandbox stop` PATH normalization in Dockerfile.
- Fixed font directory not being created before code-server installation.
- Fixed `npm`/`npx` symlinks in sandbox images.
- Fixed stray backslash in Dockerfile causing build failures.
- Fixed SSH key reinitialization being allowed after first setup.
- Fixed `execFile` argument array for `tailscale up` invocation.
- Fixed misspelled `tailescaled` → `tailscaled`.
- Fixed empty string returned instead of `null` in some API responses.
- Fixed `known_hosts` not being properly cleared on reconnect.
- Fixed file writes not ending with a newline.

### Dependencies

- Bumped `effect` to `3.20.0` in `apps/cli`.
- Bumped `undici` and `wrangler` in `apps/cf-sandbox`.
- Bumped `vitest` to `2.1.9` in `apps/app-proxy`.

---

## [0.2.4] - 2026-03-16

- Bump CLI version to 0.2.4.

## [0.2.3] - prior

- Refactored CLI help styling and footer.
- Added colored ASCII banner to CLI.
- Replaced CaskaydiaCove fonts with WOFF2 versions.
- Added Bash and Homebrew install instructions to web.
- Added install script for pocketenv releases.
- Added `setupTailscale` stubs to providers.
- Installed pm2 globally in Daytona and Zeroclaw Dockerfiles.

## [0.2.2] and earlier

See git history for previous changes.
