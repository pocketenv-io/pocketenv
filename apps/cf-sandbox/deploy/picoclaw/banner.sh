#!/usr/bin/env bash

readonly MAGENTA="$(tput setaf 5 2>/dev/null || echo '')"
readonly GREEN="$(tput setaf 2 2>/dev/null || echo '')"
readonly CYAN="$(tput setaf 6 2>/dev/null || echo '')"
readonly NO_COLOR="$(tput sgr0 2>/dev/null || echo '')"

cat << EOF
${CYAN}
██████╗  ██████╗  ██████╗██╗  ██╗███████╗████████╗███████╗███╗   ██╗██╗   ██╗
██╔══██╗██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗  ██║██║   ██║
██████╔╝██║   ██║██║     █████╔╝ █████╗     ██║   █████╗  ██╔██╗ ██║██║   ██║
██╔═══╝ ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ██╔══╝  ██║╚██╗██║╚██╗ ██╔╝
██║     ╚██████╔╝╚██████╗██║  ██╗███████╗   ██║   ███████╗██║ ╚████║ ╚████╔╝
╚═╝      ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝  ╚═══╝
${NO_COLOR}
                🚀  Pocketenv Sandbox Ready
──────────────────────────────────────────────────────────────────────

🧠 Ephemeral. Isolated.
🔐 Safe environment — experiment freely.

Type ${MAGENTA}picoclaw${NO_COLOR} to get started.

Happy hacking!

EOF
