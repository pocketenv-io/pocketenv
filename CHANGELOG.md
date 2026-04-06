# Changelog

All notable changes to this project will be documented in this file.

## [0.6.7] - 2026-04-06

### Changed

- **Bumped CLI version to 0.6.7**.
- **Updated `@pocketenv/sdk` to `^0.2.6`**: CLI now depends on the latest SDK release.


## [0.6.6] - 2026-04-06

### Changed

- **Bumped CLI version to 0.6.6**.
- **Updated `@pocketenv/sdk` to `^0.2.5`**: CLI now depends on the latest SDK release.

---

## [0.6.5] - 2026-04-06

### Changed

- **Bumped CLI version to 0.6.5**.
- **Updated `@pocketenv/sdk` to `^0.2.4`**: CLI now depends on the latest SDK release.

---

## [0.6.4] - 2026-04-06

### Added

- **Sandbox presets**: YAML-based preset system for sandbox bases (amp, claude, codex, and others). A new `prepareSandbox` helper parses and executes preset steps with conditional checks.
- **Preset type and schema validation**: `Preset` type and Zod schema added for validating sandbox preset definitions.
- **Provider column in `list` and `ps`**: The `pocketenv list` and `pocketenv ps` commands now show the sandbox provider.
- **`@chrysb/alphaclaw` in OpenClaw images**: AlphaClaw is now pre-installed in OpenClaw sandbox images.
- **Unit tests and CI workflows**: Vitest-based unit tests and GitHub Actions CI workflows added for `apps/api`, `apps/cli`, and `apps/cf-sandbox`.

### Changed

- **Sandbox app modularized**: Sandbox routes and helper logic have been split into separate modules for better maintainability.
- **Bash runs in interactive mode for TTY sessions**: Sandbox TTY sessions now invoke `bash` in interactive mode (`-i`) for correct profile sourcing.
- **`sudo`-first `apt-get` in sandbox presets**: Preset install commands now use `sudo apt-get` for compatibility with non-root sandbox environments.
- **Bumped `@pocketenv/sdk`**: CLI updated to use the latest SDK release.

### Fixed

- **Only install Tailscale if missing**: Tailscale setup now skips installation when it is already present in the sandbox.
- **Condition check in `prepareSandbox`**: Fixed an incorrect condition guard that could skip required preset steps.
- **Command failures propagated correctly**: `exec` errors are now unwrapped and propagated so preset failures surface clearly.
- **Do not throw on non-fatal command failures in `prepareSandbox`**: Non-critical preset steps no longer abort the entire preparation sequence.
- **`env` import in sprites provider**: Fixed import to use `env` from `node:process` instead of a bare global reference.

---

## [0.6.3] - 2026-04-05

### Changed

- **Migrate CLI to `@pocketenv/sdk`**: All direct API/axios calls have been replaced with the official `@pocketenv/sdk`. A new `configureSdk()` helper initialises the SDK once per command using the resolved auth token. Encryption, redaction, and SSH key generation for secrets, files, tailscale, and SSH keys are now handled by the SDK internally. The `waitUntilRunning` local helper has been removed in favour of `sandbox.waitUntilRunning()`.

---

## [0.6.2] - 2026-04-05

### Added

- **Nested ignore file support**: `loadIgnoreFiles` and `makeIsIgnored` now handle per-directory `.gitignore`/`.pocketenvignore` contexts when packaging, correctly applying ignore rules at each directory level.
- **Ignore file unit tests**: Comprehensive Vitest-based test suite for the ignore logic, with a `vitest.config.ts` and updated dev deps/test scripts.

### Fixed

- **Sandbox dotfile copying**: Enabled `bash dotglob` in sandbox copy commands so dotfiles are included when copying directories.

---

## [0.6.1] - 2026-04-04

### Added

- **`pocketenv ps` command**: New CLI subcommand to list all running sandboxes in a formatted table showing name, base image, uptime, and creation time.

### Fixed

- **`push-directory` tar archive handling**: Fixed directory archiving to use `-C` with basename so paths inside the archive are relative. Non-directory paths are now handled correctly, and archives are compressed before being pushed to the sandbox. The sandbox side now decompresses the archive to the correct destination.

---

## [0.6.0] - 2026-03-31

### Added

- **PTY support with pty-tunnel and UI integration**: Full pseudo-terminal (PTY) support via a `pty-tunnel` server, wired into the web UI for interactive terminal sessions in the browser.
- **Vercel credentials when starting sandbox**: Vercel auth tokens and project IDs are now passed through when starting a Vercel-backed sandbox.
- **Vercel auth fields and DB migration**: New database fields for Vercel (`vercelApiToken`, project/deployment IDs) with a corresponding migration.
- **Vercel auth persisted on create**: Vercel auth is now saved when a sandbox is first created.

### Changed

- **Fixed PTY port 26661**: The PTY tunnel server now uses a fixed port for predictable connections.
- **`sandboxId` validated for terminal sessions**: Terminal sessions now validate and use the correct `sandboxId`.
- **Zeroclaw bumped to v0.1.7-beta.1** and switched to `openagen`.
- **`sandboxId` cleared for Deno and Vercel on stop**: Sandbox ID is properly cleared when stopping Deno/Vercel sandboxes.
- **`jsonlines` packages pinned to exact versions** for reproducible builds.

### Fixed

- **Guarantee newline for PTY stdout**: PTY stdout now always ends with a newline; `sh` added for compatibility.
- **Pipe PTY tunnel server stdout into listener**: PTY output is properly forwarded to connected clients.
- **Await socket open and capture sandbox logs**: Socket is awaited before proceeding; sandbox start logs are now captured.
- **Zod schema messages and `superRefine` closure**: Fixed validation error messages and properly closed `superRefine` calls.
- **Misspelled `redactedSpriteToken`** corrected (was `redacredSpriteToken`).
- **`vercelApiKey` renamed to `vercelApiToken`** for naming consistency.

---

## [0.5.0] - 2026-03-30

### Added

- **Multi-provider auth system**: New auth tables and token support for Daytona, Deno, Sprite, and Vercel providers. Tokens are stored with redacted columns for safe display.
- **Sandbox provider preferences**: Users can set and persist a preferred sandbox provider via a new UI and API. API key is cleared when the provider changes.
- **Provider token handling**: Daytona and Deno provider tokens are fetched and passed through sandbox operations. Sprite token support added.
- **Daytona auth support**: Full Daytona authentication with `organizationId` and `organization_id` fields, including graceful handling when the API key is missing.
- **Terminal SSH client**: New SSH client wired into the `ssh` command, with buffered SSH output until an SSE client connects.
- **Redis-backed rate limiter**: New rate limiter middleware using Redis (500 requests per 30s).
- **`sandbox()` client**: Sandbox operations now use a unified `sandbox()` client; Daytona snapshot is set on start.

### Changed

- **`sandboxId` updated after start and SSH fetch**: Ensures the sandbox ID is kept in sync after provider start and SSH key retrieval.
- **`sandbox.start()` called before fetching params**: Provider start is now invoked earlier in the sandbox lifecycle.
- **Sandbox created if missing on start**: The `start` command now creates a sandbox if one does not already exist.
- **Increased default memory and disk sizes**: Higher resource defaults for sandboxes.
- **Rate limiter threshold raised**: Redis rate limiter now allows 500 requests per 30-second window.

### Fixed

- **Conditionally save prefs and accept masked key**: Provider preferences are only saved when changed; masked/redacted keys are accepted without overwriting.
- **`organizationId` in sandbox provider prefs**: Organization ID is now included in provider preference payloads.
- **Stray `console.log` removed** from `getPreferences`.
- **SSH session connection info logged** for easier debugging.

---

## [0.4.0] - 2026-03-29

### Added

- **Services support**: Full services feature across the stack — schema, API endpoints, lexicon, CLI commands, and a web management UI. Sandboxes can now define, start, stop, and monitor named services.
- **`pocketenv service` CLI commands**: New CLI subcommands for managing sandbox services (start, stop, status).
- **Service start/stop API endpoints**: New API routes for starting and stopping individual services with JSON responses.
- **Service status tracking**: Service status is now exposed and updated on start; services are set to `STOPPED` when their sandbox is stopped.
- **`--keep-alive` option for `start`**: The `start` command now accepts `--keep-alive` to keep the sandbox running after the terminal session ends.
- **Cursor sandbox deployment**: New Cursor-based sandbox provider with publish workflow model support.
- **Sandbox lookup by id, name, or URI**: Sandbox resolution now accepts any of these identifiers uniformly.

### Changed

- **`npm` global bin added to PATH in Dockerfile**: Ensures globally installed npm packages are available in the sandbox.
- **Increased Cloudflare default memory and disk**: Higher resource defaults for Cloudflare sandbox deployments.
- **`record.id` used for sandbox wiring**: Sandbox CLI calls now use `record.id` consistently.
- **Services started when starting sandbox**: All configured services are automatically started when a sandbox starts.

### Fixed

- **ON DELETE CASCADE on sandbox foreign keys**: Sandbox-related records are now automatically removed when a sandbox is deleted.
- **Service start guard**: Prevents starting a service that is already running.
- **Service delete logs success**: A success message is now logged after a service is deleted.

---

## [0.3.5] - 2026-03-27

### Fixed

- **Ctrl+C signal handling**: Replaced `stty raw` with `stty -icanon -echo` when probing terminal background color, preventing `ISIG` from being disabled so Ctrl+C continues to work even if the terminal restore fails.
- **Terminal restore robustness**: `tty` close and `stty` restore in the `finally` block are now wrapped in individual try/catch blocks to avoid masking earlier errors.

---

## [0.3.4] - 2026-03-27

### Added

- **Nanoclaw sandbox provider**: New Cloudflare-based `nanoclaw` sandbox deployment with its own Dockerfile, Wrangler config, and banner.
- **Volume support for Sprites, Daytona, Deno, and Vercel providers**: All major providers now support volume mounting alongside the existing Cloudflare provider.
- **`@anthropic-ai/claude-code` in Dockerfiles**: Claude Code is now pre-installed in sandbox images.
- **`keepAlive` option**: Sandbox APIs now accept a `keepAlive` option to control sandbox lifecycle.
- **Sandbox reuse by repo and DID**: When a matching sandbox (same repo + DID) already exists, it is returned instead of creating a new one.
- **GitLab repo expansion**: CLI and web now support GitLab repository URLs in addition to GitHub and Tangled.
- **`/new` page in web**: New page for creating sandboxes directly from a repository URL.
- **"Open in Pocketenv" badge**: Added SVG badge and README integration so projects can link directly to Pocketenv.
- **GitHub downloads badge**: README now shows a download count badge.
- **VS Code expose button in web UI**: Sandbox detail page now has a button to expose VS Code and open the preview URL.
- **`folder` param for Cloudflare preview URL**: Preview URL generation now accepts an optional folder parameter.

### Changed

- **Sandbox creation flow**: Sandbox is now started on create; `sandboxId`, `status`, and `startedAt` are set on start. The `sandboxId` is no longer cleared on stop.
- **Async repo cloning**: Repository cloning on sandbox creation is now done asynchronously, unblocking the terminal session sooner.
- **Sandbox configs run in background on start**: Provider config steps are now non-blocking.
- **Sandbox POST moved outside DB transaction**: Improves reliability of sandbox creation under load.
- **s3fs options**: `compat_dir` option enabled; `s3fs` is now exec'd directly for volume mounting.
- **Sandbox instance type**: Upgraded to `standard-3` for improved performance.
- **Zerobrew setup**: Zerobrew binaries moved to root `~/.local/bin` and installed consistently across sandbox, Daytona, and Cloudflare Dockerfiles. Zerobrew installer script removed in favor of direct binary install.
- **`node:lts-trixie-slim` base image**: Codex and related sandbox images now use `node:lts-trixie-slim`.
- **`coder` user added to Codex and CF sandbox Dockerfiles**.
- **oh-my-posh install combined** with Node version bump to reduce image layers.
- **Stale sandbox port cleanup**: `sandboxPorts` records are now deleted for stale sandboxes.
- **`exposeVscode` allows unauthenticated queries** for public (userId-less) sandboxes; AT Protocol agent creation is deferred until the sandbox has an `at://` URI.
- **Sandbox filtered by base segment** when looking up existing sandboxes.
- **Sandbox start retries removed**: Retry wrappers and readiness waits have been simplified; sandbox is started once before opening the terminal session.

### Fixed

- **Terminal rendering issue**: Fixed a CLI rendering bug affecting terminal output (theme.ts).
- **Volume not correctly mounted on start**: Fixed volume mount logic when starting an existing sandbox.
- **Sandbox port upsert**: Port record is now inserted if an update hits no rows.
- **Sandbox port deduplication**: Stale sandbox ports are cleaned up to avoid duplicate entries.

---

## [0.3.3] - 2026-03-23

### Added

- **`waitUntilRunning` helper**: CLI now waits for a sandbox to reach RUNNING status (up to 60s, polling every 2s) before connecting via SSH in `create` and `start` commands.
- **Sandbox cleanup cron**: New cron job and worker list to automatically clean up uninitialized sandboxes every 5 minutes.

### Changed

- **Logging for sandbox cleanup**: Uninitialized sandbox cleanup now logs when it runs.

---

## [0.3.2] - 2026-03-22

### Added

- **Shorthand repo names**: The `--repo` flag in `create` and `start` commands now accepts shorthand notation (`github:owner/repo`, `tangled:owner/repo`) in addition to full URLs.

---

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
