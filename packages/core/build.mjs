import * as esbuild from 'esbuild';
import { execSync } from 'child_process';
import * as fs from 'fs';

// Clean dist
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Build ESM
await esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  format: 'esm',
  target: 'es2020',
  platform: 'node',
  sourcemap: true,
  minify: false,
});

// Build CJS
await esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.cjs',
  bundle: true,
  format: 'cjs',
  target: 'es2020',
  platform: 'node',
  sourcemap: true,
  minify: false,
});

console.log('Build complete: dist/index.js (ESM) and dist/index.cjs (CJS)');

// Generate types
console.log('Generating types...');
try {
  execSync('npx tsc -p tsconfig.json --emitDeclarationOnly', { stdio: 'inherit' });
  console.log('Types generated.');
} catch (e) {
  console.error('Failed to generate types:', e);
  process.exit(1);
}
