# Pocketenv CLI

[![npm version](https://img.shields.io/npm/v/@pocketenv/cli?color=green)](https://www.npmjs.com/package/@pocketenv/cli)
[![discord](https://img.shields.io/discord/1270021300240252979?label=discord&logo=discord&color=5865F2)](https://discord.gg/9ada4pFUFS)
[![License: MPL-2.0](https://img.shields.io/badge/License-MPL_2.0-blue.svg)](https://opensource.org/licenses/MPL-2.0)

The official CLI for [Pocketenv](https://pocketenv.io) — create, manage, and connect to isolated sandboxes from your terminal. Powered by [AT Protocol](https://atproto.com) for open, portable, and vendor-agnostic sandbox definitions.

> [!NOTE]
> **Still in development**
>
> This project is in early development. Expect breaking changes and rapid iteration.

---

## 💡 Use Cases

- Run AI agents (Codex, Claude, Gemini, OpenClaw, Copilot ...) safely in isolated environments
- Spin up ephemeral dev sandboxes for quick prototyping
- Share reproducible developer environments via [AT Protocol](https://atproto.com)
- Test untrusted or third-party code securely
- Provide sandbox infrastructure as a service

---

## 🚚 Installation

```sh
npm install -g @pocketenv/cli
```

```sh
pnpm add -g @pocketenv/cli
```

```sh
bun add -g @pocketenv/cli
```

Verify the installation:

```sh
pocketenv --version
```

## ⚡ Quick Start

```sh
# 1. Log in with your AT Proto account (e.g. Bluesky)
pocketenv login <handle>.bsky.social

# 2. Create a sandbox
pocketenv create

# 3. Start it
pocketenv start <sandbox-name>

# 4. Open an interactive shell inside it
pocketenv console <sandbox-name>
```

## 🔐 Authentication

Pocketenv uses [AT Protocol](https://atproto.com) for authentication. You need an AT Proto account (e.g. a [Bluesky](https://bsky.app) account) to use the CLI.

### 🔑 Login

```sh
pocketenv login <handle>
```

Authenticates with your AT Proto handle. A browser window will open for you to authorize the app. Your session token is saved locally at `~/.pocketenv/token.json`.

**Example:**

```sh
pocketenv login alice.bsky.social
```

### 👤 Whoami

```sh
pocketenv whoami
```

Displays the currently logged-in user.

### 🚪 Logout

```sh
pocketenv logout
```

Removes your local session token.

---

## 🛠️ Commands

### 📦 Sandbox Management

#### `pocketenv create [name]`

Create a new sandbox. Aliases: `new`

| Option                      | Description                                 |
|-----------------------------|---------------------------------------------|
| `--provider, -p <provider>` | The provider to use (default: `cloudflare`) |

```sh
pocketenv create my-sandbox
pocketenv create my-sandbox --provider cloudflare
```

Supported providers: `cloudflare`, `daytona`, `deno`, `vercel`, `sprites`.

---

#### `pocketenv ls`

List all your sandboxes with their status and creation time.

```sh
pocketenv ls
```

Output example:

```
NAME                    BASE          STATUS    CREATED AT
true-punter-0nan        openclaw      RUNNING   33 minutes ago
ruinous-straw-wz8n      nix           STOPPED   2 days ago
narrative-shift-j80dx   zeroclaw      STOPPED   11 days ago
mad-ambulance-k9eu      nullclaw      STOPPED   11 days ago
revered-amateur-n6rz    opencrust     STOPPED   11 days ago
high-priced-vac-ek73    picoclaw      STOPPED   11 days ago
```

---

#### `pocketenv start <sandbox>`

Start a stopped sandbox.

```sh
pocketenv start my-sandbox
```

---

#### `pocketenv stop <sandbox>`

Stop a running sandbox.

```sh
pocketenv stop my-sandbox
```

---

#### `pocketenv rm <sandbox>`

Delete a sandbox permanently. Aliases: `delete`, `remove`

```sh
pocketenv rm my-sandbox
```

---

### 🖥️ Interactive Shell

#### `pocketenv console [sandbox]`

Open an interactive shell inside a running sandbox. Aliases: `shell`, `ssh`, `s`

```sh
# Connect to a specific sandbox
pocketenv console my-sandbox

# Omit the name to auto-connect to the first running sandbox
pocketenv console
```

---

### 🌍 Environment Variables

Manage environment variables scoped to a sandbox.

#### `pocketenv env put <sandbox> <key> <value>`

Set an environment variable.

```sh
pocketenv env put my-sandbox DATABASE_URL postgres://localhost/mydb
```

#### `pocketenv env list <sandbox>`

List all environment variables for a sandbox. Aliases: `ls`

```sh
pocketenv env list my-sandbox
pocketenv env ls my-sandbox
```

#### `pocketenv env delete <sandbox> <key>`

Remove an environment variable. Aliases: `rm`, `remove`

```sh
pocketenv env delete my-sandbox DATABASE_URL
```

---

### 🤫 Secrets

Manage encrypted secrets scoped to a sandbox.

#### `pocketenv secret put <sandbox> <key>`

Store a secret in a sandbox (value is prompted securely).

```sh
pocketenv secret put my-sandbox API_KEY
```

#### `pocketenv secret list <sandbox>`

List all secret keys stored in a sandbox. Aliases: `ls`

```sh
pocketenv secret list my-sandbox
```

#### `pocketenv secret delete <sandbox> <key>`

Delete a secret from a sandbox. Aliases: `rm`, `remove`

```sh
pocketenv secret delete my-sandbox API_KEY
```

---

### 🗝️ SSH Keys

Manage SSH keys associated with a sandbox.

#### `pocketenv sshkeys put <sandbox>`

Upload an SSH key pair to a sandbox.

| Option          | Description                 |
|-----------------|-----------------------------|
| `--private-key` | Path to the SSH private key |
| `--public-key`  | Path to the SSH public key  |

```sh
pocketenv sshkeys put my-sandbox
```

#### `pocketenv sshkeys get <sandbox>`

Retrieve the public SSH key from a sandbox.

```sh
pocketenv sshkeys get my-sandbox
```

---

### 🔒 Tailscale

Manage Tailscale integration for your sandboxes.

#### `pocketenv tailscale put <sandbox>`

Store a Tailscale auth key in a sandbox.

```sh
pocketenv tailscale put my-sandbox
```

#### `pocketenv tailscale get <sandbox>`

Retrieve the stored Tailscale auth key (redacted) from a sandbox.

```sh
pocketenv tailscale get my-sandbox
```

---

## ⚙️ Configuration

The CLI can be configured via the following environment variables:

| Variable            | Default                    | Description                                   |
|---------------------|----------------------------|-----------------------------------------------|
| `POCKETENV_TOKEN`   | _(none)_                   | Override the session token (useful for CI/CD) |
| `POCKETENV_API_URL` | `https://api.pocketenv.io` | Override the API base URL                     |
| `POCKETENV_CF_URL`  | `https://sbx.pocketenv.io` | Override the Cloudflare sandbox URL           |
| `POCKETENV_TTY_URL` | `https://api.pocketenv.io` | Override the TTY URL                          |

**Example — using a token in CI:**

```sh
POCKETENV_TOKEN=<your-token> pocketenv ls
```

## 📚 Documentation

Full documentation is available at **[docs.pocketenv.io](https://docs.pocketenv.io)**.

---

## 🤝 Contributing

Contributions are welcome! Please read the [Contributing Guidelines](https://github.com/pocketenv-io/pocketenv/blob/main/CONTRIBUTING.md) before submitting a pull request.

- **Bug reports & feature requests:** [Open an issue](https://github.com/pocketenv-io/pocketenv/issues/new)
- **Community & feedback:** [Join our Discord](https://discord.gg/9ada4pFUFS)

---

## 📄 License

[Mozilla Public License 2.0](https://github.com/pocketenv-io/pocketenv/blob/main/LICENSE)
