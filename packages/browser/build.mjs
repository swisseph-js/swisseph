#!/usr/bin/env node

/**
 * Build script for @swisseph/browser using esbuild
 *
 * This script:
 * 1. Bundles TypeScript source with @swisseph/core dependency
 * 2. Outputs ES modules for browser usage
 * 3. Generates type declarations using TypeScript compiler
 * 4. Preserves WASM files (swisseph.js and swisseph.wasm) if they exist
 */

import * as esbuild from 'esbuild';
import { execSync } from 'child_process';
import { existsSync, copyFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

// Preserve WASM files if they exist
const wasmFiles = ['swisseph.js', 'swisseph.wasm'];
const tempDir = '.temp-wasm';
const distDir = 'dist';

let hasWasm = false;
if (existsSync(distDir)) {
  const allWasmExist = wasmFiles.every(f => existsSync(join(distDir, f)));
  if (allWasmExist) {
    hasWasm = true;
    console.log('Preserving WASM files...');
    mkdirSync(tempDir, { recursive: true });
    wasmFiles.forEach(file => {
      copyFileSync(join(distDir, file), join(tempDir, file));
    });
  }
}

// Clean dist directory
console.log('Cleaning dist/...');
if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}
mkdirSync(distDir, { recursive: true });

// Build JavaScript bundle with esbuild
console.log('Bundling with esbuild...');
await esbuild.build({
  entryPoints: ['src/swisseph-browser.ts'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  outfile: 'dist/swisseph-browser.js',
  external: ['./swisseph.js', './swisseph.wasm'], // Don't bundle the WASM loader or WASM file
  sourcemap: true,
  minify: false,
  keepNames: true,
});

console.log('JavaScript bundle created');

// Generate type declarations with TypeScript
console.log('Generating type declarations...');
execSync('tsc --declaration --emitDeclarationOnly --composite false --outDir dist', { stdio: 'inherit' });

console.log('Type declarations created');

// Restore WASM files if they were preserved
if (hasWasm) {
  console.log('Restoring WASM files...');
  wasmFiles.forEach(file => {
    copyFileSync(join(tempDir, file), join(distDir, file));
  });
  rmSync(tempDir, { recursive: true, force: true });
  console.log('WASM files restored');
}

console.log('Build complete!');

if (!hasWasm) {
  console.log('\nNote: WASM files not found. Run "npm run build:wasm" to build them.');
}
