#!/bin/bash

# Helper script to build WASM with automatic emsdk activation
# This script will try to locate and activate emsdk if it's installed

set -e

echo "Looking for Emscripten SDK..."

# Common emsdk installation locations
EMSDK_LOCATIONS=(
  "$HOME/emsdk"
  "$HOME/Projects/emsdk"
  "../../emsdk"
  "../../../emsdk"
  "/usr/local/emsdk"
)

EMSDK_PATH=""
for location in "${EMSDK_LOCATIONS[@]}"; do
  if [ -d "$location" ] && [ -f "$location/emsdk_env.sh" ]; then
    EMSDK_PATH="$location"
    echo "Found emsdk at: $EMSDK_PATH"
    break
  fi
done

if [ -z "$EMSDK_PATH" ]; then
  echo "ERROR: Emscripten SDK not found in common locations."
  echo ""
  echo "Please install Emscripten SDK:"
  echo "  git clone https://github.com/emscripten-core/emsdk.git ~/emsdk"
  echo "  cd ~/emsdk"
  echo "  ./emsdk install latest"
  echo "  ./emsdk activate latest"
  echo ""
  echo "Then run this script again, or run:"
  echo "  source ~/emsdk/emsdk_env.sh && ./build-wasm.sh"
  exit 1
fi

echo "Activating Emscripten SDK..."
source "$EMSDK_PATH/emsdk_env.sh"

echo "Building WASM module..."
./build-wasm.sh

echo "Done!"
