#!/bin/bash

# Build Swiss Ephemeris WebAssembly module
# Requires Emscripten SDK (emsdk) to be installed and activated

set -e

echo "Building Swiss Ephemeris for WebAssembly..."

# Check if emcc is available
if ! command -v emcc &> /dev/null; then
    echo "Error: Emscripten compiler (emcc) not found!"
    echo "Please install and activate Emscripten SDK:"
    echo "  git clone https://github.com/emscripten-core/emsdk.git"
    echo "  cd emsdk"
    echo "  ./emsdk install latest"
    echo "  ./emsdk activate latest"
    echo "  source ./emsdk_env.sh"
    exit 1
fi

# Source files from Swiss Ephemeris (shared location)
SWE_DIR="../../native/libswe"

# C source files to compile
SOURCES=(
    "$SWE_DIR/sweph.c"
    "$SWE_DIR/swephlib.c"
    "$SWE_DIR/swedate.c"
    "$SWE_DIR/swejpl.c"
    "$SWE_DIR/swemmoon.c"
    "$SWE_DIR/swemplan.c"
    "$SWE_DIR/swehouse.c"
    "$SWE_DIR/swecl.c"
    "$SWE_DIR/swehel.c"
    "src/swisseph_wasm.c"
)

# Output directory
OUT_DIR="dist"
mkdir -p "$OUT_DIR"

# Exported functions
EXPORTED_FUNCTIONS='[
    "_swe_set_ephe_path_wrap",
    "_swe_julday_wrap",
    "_swe_revjul_wrap",
    "_swe_calc_ut_wrap",
    "_swe_get_planet_name_wrap",
    "_swe_lun_eclipse_when_wrap",
    "_swe_sol_eclipse_when_glob_wrap",
    "_swe_houses_wrap",
    "_swe_close_wrap",
    "_swe_version_wrap",
    "_malloc",
    "_free"
]'

# Compile to WebAssembly
emcc ${SOURCES[@]} \
    -I"$SWE_DIR" \
    -o "$OUT_DIR/swisseph.js" \
    -s WASM=1 \
    -s EXPORTED_FUNCTIONS="$EXPORTED_FUNCTIONS" \
    -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","getValue","setValue","UTF8ToString","stringToUTF8","lengthBytesUTF8","allocateUTF8","FS"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="SwissEphModule" \
    -s ENVIRONMENT='web,worker' \
    -s FILESYSTEM=1 \
    -s FORCE_FILESYSTEM=1 \
    -O3 \
    --no-entry

# Add ES module export for browser compatibility
echo "export default SwissEphModule;" >> "$OUT_DIR/swisseph.js"

echo "Build complete! Output in $OUT_DIR/"
echo "Files created:"
echo "  - $OUT_DIR/swisseph.js (with ES module export)"
echo "  - $OUT_DIR/swisseph.wasm"
