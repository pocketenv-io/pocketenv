#!/bin/bash

readonly MAGENTA="$(tput setaf 5 2>/dev/null || echo '')"
readonly GREEN="$(tput setaf 2 2>/dev/null || echo '')"
readonly CYAN="$(tput setaf 6 2>/dev/null || echo '')"
readonly NO_COLOR="$(tput sgr0 2>/dev/null || echo '')"

set -e

# Define the release information
RELEASE_URL="https://api.github.com/repos/pocketenv-io/pocketenv/releases/latest"

# Determine the operating system
OS=$(uname -s)
if [ "$OS" = "Darwin" ]; then
    # Determine the CPU architecture
    ARCH=$(uname -m)
    if [ "$ARCH" = "arm64" ]; then
        ASSET_NAME="_aarch64-apple-darwin.tar.gz"
    else
        ASSET_NAME="_x86_64-apple-darwin.tar.gz"
    fi
elif [ "$OS" = "Linux" ]; then
    # Determine the CPU architecture
    ARCH=$(uname -m)
    if [ "$ARCH" = "aarch64" ]; then
        ASSET_NAME="_aarch64-unknown-linux-gnu.tar.gz"
    elif [ "$ARCH" = "x86_64" ]; then
        ASSET_NAME="_x86_64-unknown-linux-gnu.tar.gz"
    else
        echo "Unsupported architecture: $ARCH"
        exit 1
    fi
else
    echo "Unsupported operating system: $OS"
    exit 1
fi

# Retrieve the download URL for the desired asset
DOWNLOAD_URL=$(curl -sSL $RELEASE_URL | grep -o "browser_download_url.*$ASSET_NAME\"" | cut -d ' ' -f 2)

ASSET_NAME=$(basename $DOWNLOAD_URL)

# Define the installation directory
INSTALL_DIR="/usr/local/bin"

DOWNLOAD_URL=`echo $DOWNLOAD_URL | tr -d '\"'`

# Download the asset
curl -SL $DOWNLOAD_URL -o /tmp/$ASSET_NAME

# Extract the asset
tar -xzf /tmp/$ASSET_NAME -C /tmp

# Set the correct permissions for the binary
chmod +x /tmp/pocketenv

# Check if the 'local' argument was passed
LOCAL=0
if [ $# -eq 1 ]; then
    if [ $1 = "--local" ]; then
	LOCAL=1
    fi
fi

# Move the extracted binary to the installation directory
# use sudo if OS is Linux
if [ "$OS" = "Linux" ]; then
    # Install locally if LOCAL is set to 1
    LOCAL_DIR="/home/$USER/.local/bin"
    if [ "$LOCAL" -eq 1 ]; then
	mv /tmp/pocketenv $LOCAL_DIR
    else
	if command -v sudo >/dev/null 2>&1; then
	    sudo mv /tmp/pocketenv $INSTALL_DIR
	else
	    mv /tmp/pocketenv $INSTALL_DIR
	fi
    fi
else
    mv /tmp/pocketenv $INSTALL_DIR
fi

# Clean up temporary files
rm /tmp/$ASSET_NAME

cat << EOF
${CYAN}
     ____             __        __                 
    / __ \\____  _____/ /_____  / /____  ____ _   __
   / /_/ / __ \\/ ___/ //_/ _ \\/ __/ _ \\/ __ \\ | / /
  / ____/ /_/ / /__/ ,< /  __/ /_/  __/ / / / |/ / 
 /_/    \\____/\\___/_/|_|\\___/\\__/\\___/_/ /_/|___/  
  
${NO_COLOR}
Manage your ${GREEN}development environment${NO_COLOR} with ease ✨

${GREEN}https://github.com/pocketenv-io/pocketenv${NO_COLOR}

Please file an issue if you encounter any problems!

===============================================================================

Installation completed! 🎉

To get started, run:

${MAGENTA}pocketenv init${NO_COLOR}

EOF