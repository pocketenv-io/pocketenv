import { Template } from "../../objects/template.ts";

export const templates: Template[] = [
  {
    id: "1",
    name: "Devbox",
    description:
      "A ready-to-use development environment with devbox already installed.",
    logo: "https://cdn.jsdelivr.net/gh/fluent-ci-templates/.github@main/assets/devbox_logo_dark.png",
    readme: "https://cdn.jsdelivr.net/gh/pocketenv-io/devbox@main/README.md",
    repoUrl: "https://github.com/pocketenv-io/devbox",
    packageName: "devbox",
  },
  {
    id: "2",
    name: "Devenv",
    description:
      "A ready-to-use development environment with devenv already installed.",
    logo: "data:image/jpeg;base64,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",
    readme: "https://cdn.jsdelivr.net/gh/pocketenv-io/devenv@main/README.md",
    repoUrl: "https://github.com/pocketenv-io/devenv",
    packageName: "devenv",
  },
  {
    id: "3",
    name: "Flox",
    description:
      "A ready-to-use development environment with flox already installed.",
    logo: "https://cdn.jsdelivr.net/gh/fluent-ci-templates/.github@main/assets/flox.svg",
    readme: "https://cdn.jsdelivr.net/gh/pocketenv-io/flox@main/README.md",
    repoUrl: "https://github.com/pocketenv-io/flox",
    packageName: "flox",
  },
  {
    id: "4",
    name: "Homebrew",
    description:
      "A ready-to-use development environment with homebrew already installed.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Brew_logo.svg",
    readme: "https://cdn.jsdelivr.net/gh/pocketenv-io/homebrew@main/README.md",
    repoUrl: "https://github.com/pocketenv-io/homebrew",
    packageName: "homebrew",
  },
  {
    id: "5",
    name: "Pkgx",
    description:
      "A ready-to-use development environment with pkgx already installed.",
    logo: "https://avatars.githubusercontent.com/u/140643783?s=200&v=4",
    readme: "https://cdn.jsdelivr.net/gh/pocketenv-io/pkgx@main/README.md",
    repoUrl: "https://github.com/pocketenv-io/pkgx",
    packageName: "pkgx",
  },
  {
    id: "6",
    name: "Nix",
    description:
      "A ready-to-use development environment with nix already installed.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/Nix_snowflake.svg",
    readme: "https://cdn.jsdelivr.net/gh/pocketenv-io/nix@main/README.md",
    repoUrl: "https://github.com/pocketenv-io/nix",
    packageName: "nix",
  },
];
