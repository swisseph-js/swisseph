# Publishing Guide

This guide explains how to publish packages from the Swiss Ephemeris monorepo.

## Packages

- `@swisseph/core` - TypeScript types only
- `@swisseph/node` - Node.js native addon
- `@swisseph/browser` - Browser WebAssembly version

## Publishing Order

Always publish in this order to ensure dependencies are available:

```bash
# 1. Core (no dependencies)
pnpm --filter @swisseph/core publish

# 2. Node (depends on core)
pnpm --filter @swisseph/node publish

# 3. Browser (depends on core)
pnpm --filter @swisseph/browser publish
```

## @swisseph/core

Simple TypeScript package with no build requirements:

```bash
cd packages/core
pnpm build
pnpm publish
```

## @swisseph/node

Requires building native addon:

```bash
cd packages/node
pnpm build  # Builds native C code + TypeScript
pnpm publish
```

**Note:** The native addon is built during `npm install` on the user's machine using `node-gyp`.

## @swisseph/browser

**Requires Emscripten SDK to build WASM:**

### Option 1: Build Locally

```bash
# Install Emscripten (one-time setup)
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

# Build and publish
cd packages/browser
pnpm run build:all  # Builds TypeScript + WASM
pnpm publish
```

### Option 2: Use GitHub Actions (Recommended)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish Packages

on:
  workflow_dispatch:
    inputs:
      package:
        description: 'Package to publish'
        required: true
        type: choice
        options:
          - core
          - node
          - browser
          - all

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      # For browser package only
      - name: Setup Emscripten
        if: inputs.package == 'browser' || inputs.package == 'all'
        uses: mymindstorm/setup-emsdk@v12
        with:
          version: 'latest'

      - name: Publish @swisseph/core
        if: inputs.package == 'core' || inputs.package == 'all'
        run: |
          pnpm --filter @swisseph/core build
          pnpm --filter @swisseph/core publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish @swisseph/node
        if: inputs.package == 'node' || inputs.package == 'all'
        run: |
          pnpm --filter @swisseph/node build
          pnpm --filter @swisseph/node publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish @swisseph/browser
        if: inputs.package == 'browser' || inputs.package == 'all'
        run: |
          pnpm --filter @swisseph/browser run build:all
          pnpm --filter @swisseph/browser publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Option 3: Use Docker

```bash
# Build WASM in Docker container
docker run --rm \
  -v $(pwd):/src \
  emscripten/emsdk \
  bash -c "cd /src/packages/browser && ./build-wasm.sh"

# Then publish
cd packages/browser
pnpm publish
```

## Pre-publish Checklist

Before publishing any package:

- [ ] Update version in `package.json`
- [ ] Update CHANGELOG.md (if exists)
- [ ] Run tests: `pnpm test`
- [ ] Build successfully: `pnpm build`
- [ ] For @swisseph/browser: Verify WASM files exist in `dist/`
- [ ] Verify `files` field in package.json includes all necessary files
- [ ] Set npm access to public: `--access public`

## Versioning

This monorepo uses independent versioning - each package has its own version number.

When updating:
1. Increment version in package.json
2. If a package depends on another package in this repo, use `workspace:*` in package.json
3. Before publishing, pnpm will resolve `workspace:*` to the actual version

## Testing Before Publishing

Test installation locally:

```bash
# Pack the package
cd packages/node
pnpm pack

# This creates @swisseph-node-1.0.0.tgz

# Test in another project
npm install /path/to/@swisseph-node-1.0.0.tgz
```

## WASM Files in @swisseph/browser

**Important:** The WASM files (`dist/swisseph.js` and `dist/swisseph.wasm`) are:
- ❌ NOT checked into Git
- ✅ Built at publish time
- ✅ Included in the npm package (via `files` field)
- ✅ Automatically built by `prepublishOnly` hook

Users installing `@swisseph/browser` from npm will get the pre-built WASM files.

## Troubleshooting

**"Cannot find module '@swisseph/core'"**
- Make sure you published @swisseph/core first
- Wait a few minutes for npm registry to update

**"WASM build failed"**
- Ensure Emscripten is installed and activated
- Check that `../../pyswisseph/libswe` exists with C source files
- Try `emcc --version` to verify Emscripten works

**"prepublishOnly script failed"**
- This means WASM build failed
- You can skip it temporarily with `npm publish --ignore-scripts`
- But the published package won't work without WASM!
