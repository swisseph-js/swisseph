# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-01-02

**Note:** This release only affects `@swisseph/browser`. The `@swisseph/node` and `@swisseph/core` packages remain unchanged.

### Fixed
- Fixed missing `FS` export in WASM build, enabling `loadStandardEphemeris()` and `loadEphemerisFiles()` to work properly
- Added error checking with clear message when FS is not available
- Fixed hardcoded `/dist/swisseph.wasm` path - now uses relative path that works automatically with all bundlers

### Added
- Enhanced test page (`test/calculations.html`) with:
  - "Load Swiss Ephemeris" button to load ephemeris files from CDN
  - Automatic test re-run after loading ephemeris files
  - "Re-run All Tests" button for manual test execution
  - Swiss Ephemeris vs Moshier comparison tests
  - Asteroid calculation tests (requires Swiss Ephemeris loaded)

### Changed
- Updated `build-wasm.sh` to export `FS` and `allocateUTF8` runtime methods
- Rebuilt WASM module with proper filesystem support using Emscripten SDK

## [1.0.0] - 2025-12-XX

### Added
- Initial release of Swiss Ephemeris JS monorepo
- `@swisseph/core`: Shared TypeScript types and enums
- `@swisseph/node`: Node.js native addon with bundled ephemeris files
- `@swisseph/browser`: WebAssembly browser version with Moshier ephemeris
- Modern TypeScript API with object returns and enums
- Support for planetary positions, house calculations, and eclipse predictions
- Comprehensive type definitions and IntelliSense support

[1.0.1]: https://github.com/swisseph-js/swisseph/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/swisseph-js/swisseph/releases/tag/v1.0.0
