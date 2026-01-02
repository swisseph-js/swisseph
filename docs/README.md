# Swiss Ephemeris JS - Documentation

Complete documentation for the Swiss Ephemeris JavaScript/TypeScript library.

## Table of Contents

### Getting Started
- [Installation & Setup](./getting-started.md)
- [Quick Start Guide](./getting-started.md#quick-start)
- [Choosing a Package](./getting-started.md#choosing-a-package)

### API Reference
- [@swisseph/node API](./api/node.md) - Node.js native addon
- [@swisseph/browser API](./api/browser.md) - WebAssembly browser version
- [@swisseph/core API](./api/core.md) - Shared TypeScript types

### Guides
- [Calculating Birth Charts](./guides/birth-charts.md)
- [Eclipse Calculations](./guides/eclipses.md)
- [House Systems](./guides/house-systems.md)
- [Working with Julian Days](./guides/julian-days.md)
- [Understanding Ephemeris Files](./guides/ephemeris-files.md)

### Additional Resources
- [TypeScript Type Reference](./typescript-types.md)
- [Comparison with pyswisseph](./comparison-pyswisseph.md)
- [Troubleshooting](./troubleshooting.md)

## Package Overview

This monorepo contains three packages:

| Package | Description | Documentation |
|---------|-------------|---------------|
| `@swisseph/node` | Node.js native addon for server-side calculations | [API Docs](./api/node.md) |
| `@swisseph/browser` | WebAssembly version for browsers | [API Docs](./api/browser.md) |
| `@swisseph/core` | Shared TypeScript types and interfaces | [API Docs](./api/core.md) |

## Quick Links

- [GitHub Repository](https://github.com/swisseph-js/swisseph)
- [Swiss Ephemeris Official Documentation](https://www.astro.com/swisseph/)
- [npm: @swisseph/node](https://www.npmjs.com/package/@swisseph/node)
- [npm: @swisseph/browser](https://www.npmjs.com/package/@swisseph/browser)
- [npm: @swisseph/core](https://www.npmjs.com/package/@swisseph/core)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to this project.

## License

AGPL-3.0 - See [LICENSE](../LICENSE) for details.
