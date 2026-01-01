# Building Swiss Ephemeris for WebAssembly

This guide explains how to compile the Swiss Ephemeris C library to WebAssembly for use in browsers.

## Prerequisites

You need the **Emscripten SDK** to compile C code to WebAssembly.

### Option 1: Install Emscripten Locally (Recommended)

```bash
# 1. Clone the Emscripten SDK
cd ~
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# 2. Install the latest version
./emsdk install latest

# 3. Activate it
./emsdk activate latest

# 4. Set up environment variables
source ./emsdk_env.sh

# 5. Verify installation
emcc --version
```

**Note:** You need to run `source ./emsdk_env.sh` every time you open a new terminal, or add it to your `.bashrc`/`.zshrc`:

```bash
# Add to ~/.bashrc or ~/.zshrc
source "$HOME/emsdk/emsdk_env.sh" > /dev/null 2>&1
```

### Option 2: Use Docker (Alternative)

If you prefer not to install Emscripten locally:

```bash
# Pull the official Emscripten Docker image
docker pull emscripten/emsdk:latest

# Build using Docker (from browser directory)
docker run --rm -v $(pwd):/src emscripten/emsdk:latest \
    bash -c "cd /src && ./build-wasm.sh"
```

## Building

Once Emscripten is set up:

```bash
# Navigate to browser directory
cd browser

# Make build script executable
chmod +x build-wasm.sh

# Run the build
./build-wasm.sh
```

This will create:
- `dist/swisseph.js` (~100KB) - JavaScript glue code
- `dist/swisseph.wasm` (~1.2MB) - WebAssembly binary

## Testing the Build

After building, test in a browser:

```bash
# Start a local web server
python3 -m http.server 8000

# Or with Node.js
npx http-server -p 8000

# Or with PHP
php -S localhost:8000
```

Then open: `http://localhost:8000/test/`

## Build Options

The build script uses these Emscripten flags:

- `-O3` - Maximum optimization
- `-s WASM=1` - Generate WebAssembly
- `-s MODULARIZE=1` - Export as ES6 module
- `-s ALLOW_MEMORY_GROWTH=1` - Allow dynamic memory
- `-s FILESYSTEM=1` - Include virtual filesystem (for potential future file support)

To customize, edit `build-wasm.sh`.

## Troubleshooting

### "emcc: command not found"

You need to activate Emscripten in your current shell:

```bash
source ~/emsdk/emsdk_env.sh
```

### Build errors about missing files

Make sure you're in the `browser/` directory and that `../pyswisseph/libswe/` exists with the Swiss Ephemeris C source files.

### "Cannot find module" in browser

Make sure you're serving the files over HTTP (not `file://`). Browsers restrict ES6 modules when loaded locally.

Use a web server:
```bash
python3 -m http.server 8000
```

### Large WASM file size

The WASM file (~1.2MB) includes the entire Swiss Ephemeris library with Moshier ephemeris. This is normal. After gzip compression (automatic on most web servers), it's ~400KB.

To further reduce size, you could:
- Remove unused planet calculations from source
- Use `-Oz` instead of `-O3` (smaller but slower)
- Remove debugging symbols (already done with `--no-entry`)

## What Gets Compiled

The build includes these Swiss Ephemeris modules:

1. **Core ephemeris** (`sweph.c`, `swephlib.c`)
2. **Date functions** (`swedate.c`)
3. **Moshier ephemeris** (`swemplan.c`, `swemmoon.c`) - Built-in, no files needed!
4. **Houses** (`swehouse.c`)
5. **Eclipses** (`swecl.c`)
6. **Heliacal** (`swehel.c`)
7. **JPL support** (`swejpl.c`)

The Moshier ephemeris is compiled directly into the WASM, providing excellent accuracy without external data files.

## Next Steps

After building successfully:

1. ✅ Test with `test/index.html`
2. ✅ Integrate into your web application
3. ✅ Deploy to your website (WASM files are automatically compressed by web servers)

## Performance Tips

1. **Initialize once** - Call `await swe.init()` once and reuse the instance
2. **Use Moshier** - `FLG_MOSEPH` is optimized for browser use
3. **Batch calculations** - Calculate multiple positions in one go when possible
4. **Cache results** - Store frequently used calculations

Enjoy astronomical calculations in the browser! 🌟
