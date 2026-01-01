# Swiss Ephemeris for JavaScript/TypeScript

Modern, type-safe TypeScript wrapper for the Swiss Ephemeris library - high precision astronomical calculations for astrology and astronomy.

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## ✨ Modern TypeScript API

This library provides a developer-friendly API with:

- 🎯 **Object returns** instead of arrays - named properties with autocomplete
- 🔢 **TypeScript enums** - type-safe constants (Planet.Sun, HouseSystem.Placidus)
- 📝 **Descriptive names** - `julianDay()`, `calculatePosition()`, `findNextLunarEclipse()`
- 🛠️ **Convenience methods** - `eclipse.isTotal()`, `date.toString()`
- ✨ **Full IntelliSense** - autocomplete in VS Code, WebStorm, etc.

**Traditional approach:**
```typescript
const [xx, flags] = swe.calc_ut(jd, swe.SUN);
const longitude = xx[0];  // What is xx[0]?
```

**Modern API (this library):**
```typescript
const sun = calculatePosition(jd, Planet.Sun);
const longitude = sun.longitude; // Clear and autocompleted!
```

## 📦 Packages

This monorepo contains three npm packages:

| Package | Platform | Ephemeris | Bundle Size | Installation |
|---------|----------|-----------|-------------|--------------|
| [@swisseph/node](packages/node/) | Node.js | Swiss Ephemeris (bundled) | ~2MB | `npm install @swisseph/node` |
| [@swisseph/browser](packages/browser/) | Browser | Moshier (built-in) + Swiss (optional CDN) | ~250KB | `npm install @swisseph/browser` |
| [@swisseph/core](packages/core/) | Any | Types only | <1KB | Auto-installed as dependency |

### Which Package Should I Use?

**Use `@swisseph/node` for:**
- ✅ Server-side applications, APIs, CLI tools
- ✅ Maximum precision (JPL ephemeris, bundled automatically)
- ✅ Asteroid calculations
- ✅ Full date range (13201 BC - 17191 AD)

**Use `@swisseph/browser` for:**
- ✅ Web applications, PWAs
- ✅ Client-side calculations (no server needed)
- ✅ Small bundle size (~250KB gzipped)
- ✅ Good accuracy (sub-arcsecond with Moshier)
- ✅ Optional: Load Swiss Ephemeris from CDN for JPL precision

**Both packages share identical TypeScript APIs!**

## Quick Start

### Node.js

```bash
npm install @swisseph/node
```

```typescript
import {
  julianDay,
  calculatePosition,
  calculateHouses,
  Planet,
  HouseSystem
} from '@swisseph/node';

// No setup required! Ephemeris files are bundled and auto-loaded.

// Calculate Julian day
const jd = julianDay(2007, 3, 3);

// Calculate planetary position
const sun = calculatePosition(jd, Planet.Sun);
console.log(`Sun: ${sun.longitude}°`);

// Calculate houses
const houses = calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);
console.log(`Ascendant: ${houses.ascendant}°`);
console.log(`MC: ${houses.mc}°`);
```

See [@swisseph/node documentation](packages/node/) for complete API reference.

### Browser

```bash
npm install @swisseph/browser
```

```typescript
import { SwissEphemeris, Planet, HouseSystem } from '@swisseph/browser';

// Initialize WASM module
const swe = new SwissEphemeris();
await swe.init();

// Same API as Node.js!
const jd = swe.julianDay(2007, 3, 3);
const sun = swe.calculatePosition(jd, Planet.Sun);
console.log(`Sun: ${sun.longitude}°`);

const houses = swe.calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);
console.log(`Ascendant: ${houses.ascendant}°`);
```

**Optional: Load Swiss Ephemeris files for maximum precision**

```typescript
// Load from jsDelivr CDN (~2MB, one-time download)
await swe.loadStandardEphemeris();

// Now use Swiss Ephemeris for JPL precision
const sun = swe.calculatePosition(jd, Planet.Sun, CalculationFlag.SwissEphemeris);
```

See [@swisseph/browser documentation](packages/browser/) for complete API reference.

## Features

### Astronomical Calculations

- **Planetary positions** - All major planets, Moon, Sun, asteroids, lunar nodes
- **House systems** - Placidus, Koch, Equal, Whole Sign, Campanus, Regiomontanus, and more
- **Eclipse calculations** - Solar and lunar eclipses with precise timing
- **Date conversions** - Julian day ↔ calendar date conversions
- **High precision** - JPL DE431 ephemeris accuracy (Node.js), sub-arcsecond (browser)
- **Extensive range** - 13201 BC to 17191 AD (Node.js with Swiss Ephemeris)

### Developer Experience

- **Full TypeScript support** - Types, enums, and interfaces included
- **Object returns** - Named properties instead of positional arrays
- **Type-safe enums** - `Planet.Sun`, `HouseSystem.Placidus`, etc.
- **Convenience methods** - `eclipse.isTotal()`, `eclipse.getTotalityDuration()`
- **Modern tooling** - Works with ES modules, bundlers, and TypeScript
- **Comprehensive docs** - API reference, examples, and guides

## Examples

### Birth Chart Calculation

```typescript
import { julianDay, calculatePosition, Planet } from '@swisseph/node';

const jd = julianDay(1990, 5, 15, 14.5); // May 15, 1990, 14:30 UTC

const planets = [
  Planet.Sun, Planet.Moon, Planet.Mercury, Planet.Venus,
  Planet.Mars, Planet.Jupiter, Planet.Saturn, Planet.Uranus,
  Planet.Neptune, Planet.Pluto
];

planets.forEach(planet => {
  const position = calculatePosition(jd, planet);
  console.log(`${Planet[planet]}: ${position.longitude.toFixed(4)}°`);
});
```

### Eclipse Search

```typescript
import { julianDay, findNextLunarEclipse, julianDayToDate } from '@swisseph/node';

let searchDate = julianDay(2025, 1, 1);

for (let i = 0; i < 5; i++) {
  const eclipse = findNextLunarEclipse(searchDate);
  const date = julianDayToDate(eclipse.maximum);

  console.log(`Eclipse ${i + 1}: ${date.toString()}`);
  console.log(`Type: ${eclipse.isTotal() ? 'Total' : 'Partial'}`);
  console.log(`Duration: ${eclipse.getTotalityDuration().toFixed(2)} hours\n`);

  searchDate = eclipse.maximum + 1;
}
```

More examples in each package's README:
- [Node.js Examples](packages/node/#examples)
- [Browser Examples](packages/browser/#examples)

## Documentation

- [@swisseph/node](packages/node/) - Node.js package documentation
- [@swisseph/browser](packages/browser/) - Browser package documentation
- [@swisseph/core](packages/core/) - Shared TypeScript types

## Development

This is a monorepo managed with pnpm workspaces.

### Setup

```bash
# Clone repository
git clone https://github.com/swisseph-js/swisseph.git
cd swisseph

# Install dependencies
pnpm install

# Build all packages
pnpm run build
```

### Build Commands

```bash
# Build all packages
pnpm run build

# Build specific package
pnpm --filter @swisseph/node build
pnpm --filter @swisseph/browser build
pnpm --filter @swisseph/core build

# Run tests
pnpm test
```

### Repository Structure

```
swisseph/
├── packages/
│   ├── core/              # Shared TypeScript types
│   ├── node/              # Node.js native addon
│   │   ├── tests/         # Package tests
│   │   ├── examples/      # Usage examples
│   │   └── ephemeris/     # Bundled data files
│   └── browser/           # WebAssembly browser version
│       ├── test/          # Browser tests
│       └── examples/      # Usage examples
├── native/                # Shared C source (Swiss Ephemeris library)
└── docs/                  # Documentation
```

## Testing

### Node.js Tests

```bash
cd packages/node
npm test
```

Tests verify calculations match pyswisseph output.

### Browser Tests

```bash
cd packages/browser
npm run dev
```

Open http://localhost:8000/test/calculations.html in your browser.

## Comparison with Other Libraries

| Feature | This Library | pyswisseph | swisseph (C) |
|---------|-------------|------------|--------------|
| Language | TypeScript/JavaScript | Python | C |
| API Style | Modern (objects, enums) | Traditional (tuples) | Traditional (arrays) |
| Platform | Node.js + Browser | Python only | Any with C bindings |
| TypeScript | Native support | Type stubs | No |
| Return Types | Named objects | Tuples | Arrays |
| Bundle Size | ~250KB (browser) | N/A | N/A |

## License

AGPL-3.0 - Same as Swiss Ephemeris and pyswisseph

The Swiss Ephemeris library is dual-licensed:
- GNU Affero General Public License (AGPL) - Free for AGPL-compatible projects
- Swiss Ephemeris Professional License - Commercial license available from Astrodienst

For commercial licensing, visit [astro.com/swisseph](https://www.astro.com/swisseph/).

## Credits

- **Swiss Ephemeris** - Dieter Koch and Alois Treindl, Astrodienst AG
- **pyswisseph** - Stanislas Marquis (API design inspiration)
- **Modern TypeScript API** - Type-safe enums, object returns, convenience methods

## Links

- [GitHub Repository](https://github.com/swisseph-js/swisseph)
- [Swiss Ephemeris Documentation](https://www.astro.com/swisseph/)
- [pyswisseph](https://github.com/astrorigin/pyswisseph)
- [Swiss Ephemeris C Library](https://github.com/aloistr/swisseph)
