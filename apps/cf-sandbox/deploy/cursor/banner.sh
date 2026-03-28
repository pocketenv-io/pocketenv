#!/usr/bin/env bash

readonly MAGENTA="$(tput setaf 5 2>/dev/null || echo '')"
readonly GREEN="$(tput setaf 2 2>/dev/null || echo '')"
readonly CYAN="$(tput setaf 6 2>/dev/null || echo '')"
readonly NEON="$(tput setaf 50 2>/dev/null || echo '')"
readonly NO_COLOR="$(tput sgr0 2>/dev/null || echo '')"

cat << EOF
${NEON}
██████╗  ██████╗  ██████╗██╗  ██╗███████╗████████╗███████╗███╗   ██╗██╗   ██╗
██╔══██╗██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗  ██║██║   ██║
██████╔╝██║   ██║██║     █████╔╝ █████╗     ██║   █████╗  ██╔██╗ ██║██║   ██║
██╔═══╝ ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ██╔══╝  ██║╚██╗██║╚██╗ ██╔╝
██║     ╚██████╔╝╚██████╗██║  ██╗███████╗   ██║   ███████╗██║ ╚████║ ╚████╔╝
╚═╝      ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝  ╚═══╝
${NO_COLOR}

╭─────────────────────────────────────────────────────────────╮
│  This environment is ephemeral.                             │
│  What you build here lives fast and dies clean.             │
│                                                             │
│  Break systems.                                             │
│  Spawn agents.                                              │
│  Ship experiments.                                          │
╰─────────────────────────────────────────────────────────────╯

Type ${NEON}agent${NO_COLOR} to get started.

Happy hacking! 🎉

EOF
