# @swisseph/browser

High precision astronomical calculations for browsers using WebAssembly.

## Features

- ✅ **Runs entirely in browser** - No server required
- ✅ **WebAssembly powered** - Near-native performance
- ✅ **Moshier ephemeris built-in** - Works offline, ~250KB gzipped
- ✅ **Optional Swiss Ephemeris** - Load from CDN for JPL precision
- ✅ **Modern TypeScript API** - Same as @swisseph/node
- ✅ **Type-safe** - Enums, object returns, full TypeScript support

## Installation

```bash
npm install @swisseph/browser
```

## Quick Start

**Default: Moshier ephemeris (built-in, no setup)**

```typescript
import { SwissEphemeris, Planet, HouseSystem } from '@swisseph/browser';

// Initialize WASM module
const swe = new SwissEphemeris();
await swe.init();

// Calculate planetary position
const jd = swe.julianDay(2007, 3, 3);
const sun = swe.calculatePosition(jd, Planet.Sun);
console.log(`Sun: ${sun.longitude}°`);

// Calculate houses
const houses = swe.calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);
console.log(`Ascendant: ${houses.ascendant}°`);
console.log(`MC: ${houses.mc}°`);
```

**Optional: Swiss Ephemeris files for maximum precision**

```typescript
const swe = new SwissEphemeris();
await swe.init();

// Load ephemeris files from CDN (~2MB, one-time download)
await swe.loadStandardEphemeris();

// Use Swiss Ephemeris for JPL precision
const sun = swe.calculatePosition(jd, Planet.Sun, CalculationFlag.SwissEphemeris);
```

## Core API

### Initialization

```typescript
const swe = new SwissEphemeris();
await swe.init();
```

The WASM file is automatically loaded from the same directory as the JavaScript bundle. This works out-of-the-box with all modern bundlers (Vite, Webpack, Rollup, etc.).

### Date & Time

```typescript
swe.julianDay(year, month, day, hour?, calendarType?)
swe.julianDayToDate(jd, calendarType?)
```

### Planetary Positions

```typescript
swe.calculatePosition(jd, body, flags?)
// Returns: { longitude, latitude, distance, longitudeSpeed, ... }
```

**Available bodies:** `Planet.Sun`, `Planet.Moon`, `Planet.Mercury`, `Planet.Venus`, `Planet.Mars`, `Planet.Jupiter`, `Planet.Saturn`, `Planet.Uranus`, `Planet.Neptune`, `Planet.Pluto`

### Houses

```typescript
swe.calculateHouses(jd, latitude, longitude, houseSystem?)
// Returns: { cusps[], ascendant, mc, armc, vertex, ... }
```

**House systems:** `Placidus`, `Koch`, `Equal`, `WholeSign`, `Campanus`, `Regiomontanus`, etc.

### Eclipses

```typescript
swe.findNextLunarEclipse(startJd, flags?, eclipseType?, backward?)
swe.findNextSolarEclipse(startJd, flags?, eclipseType?, backward?)
// Returns eclipse object with methods: isTotal(), isPartial(), getTotalityDuration(), etc.
```

### Utilities

```typescript
swe.getCelestialBodyName(body)  // Get name string
swe.version()                    // Swiss Ephemeris version
swe.close()                      // Free resources when done
```

## Ephemeris Options

**Option 1: Moshier (Default - Built-in)**
- No external files needed
- Small bundle size (~250KB gzipped)
- Sub-arcsecond accuracy
- Works offline immediately
- Major planets only (no asteroids)

**Option 2: Swiss Ephemeris Files (Optional)**

Load from jsDelivr CDN for maximum precision:

```typescript
// Simple: Load standard files
await swe.loadStandardEphemeris();

// Or load from custom URLs
await swe.loadEphemerisFiles([
  { name: 'sepl_18.se1', url: 'https://your-cdn.com/sepl_18.se1' },
  { name: 'semo_18.se1', url: 'https://your-cdn.com/semo_18.se1' }
]);
```

**When to use Swiss Ephemeris files:**
- Need JPL-level precision
- Professional astronomy applications
- Research requiring maximum accuracy
- Asteroid calculations
- ~2MB download acceptable

**Note:** Files are loaded into memory and persist only for the current session.

## TypeScript Support

Full TypeScript types included. All enums and interfaces are exported:

```typescript
import {
  Planet, Asteroid, LunarPoint,      // Celestial bodies
  HouseSystem,                        // House systems
  CalculationFlag,                    // Calculation options
  CalendarType                        // Gregorian/Julian
} from '@swisseph/browser';
```

## Examples

### Birth Chart Calculation

```typescript
import {
  SwissEphemeris,
  Planet,
  HouseSystem
} from '@swisseph/browser';

const swe = new SwissEphemeris();
await swe.init();

// Birth: May 15, 1990, 14:30 UTC, New York
const jd = swe.julianDay(1990, 5, 15, 14.5);

// Calculate all planet positions
const planets = [
  { name: 'Sun', position: swe.calculatePosition(jd, Planet.Sun) },
  { name: 'Moon', position: swe.calculatePosition(jd, Planet.Moon) },
  { name: 'Mercury', position: swe.calculatePosition(jd, Planet.Mercury) },
  { name: 'Venus', position: swe.calculatePosition(jd, Planet.Venus) },
  { name: 'Mars', position: swe.calculatePosition(jd, Planet.Mars) },
  { name: 'Jupiter', position: swe.calculatePosition(jd, Planet.Jupiter) },
  { name: 'Saturn', position: swe.calculatePosition(jd, Planet.Saturn) },
  { name: 'Uranus', position: swe.calculatePosition(jd, Planet.Uranus) },
  { name: 'Neptune', position: swe.calculatePosition(jd, Planet.Neptune) },
  { name: 'Pluto', position: swe.calculatePosition(jd, Planet.Pluto) }
];

planets.forEach(({ name, position }) => {
  console.log(`${name}: ${position.longitude.toFixed(4)}°`);
});

// Calculate houses
const houses = swe.calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);
console.log(`Ascendant: ${houses.ascendant.toFixed(4)}°`);
console.log(`MC: ${houses.mc.toFixed(4)}°`);

for (let i = 1; i <= 12; i++) {
  console.log(`House ${i}: ${houses.cusps[i].toFixed(4)}°`);
}

swe.close();
```

### Eclipse Search

```typescript
import { SwissEphemeris } from '@swisseph/browser';

const swe = new SwissEphemeris();
await swe.init();

// Find next 5 lunar eclipses starting from Jan 1, 2025
let searchDate = swe.julianDay(2025, 1, 1);

for (let i = 0; i < 5; i++) {
  const eclipse = swe.findNextLunarEclipse(searchDate);
  const maxTime = swe.julianDayToDate(eclipse.maximum);

  console.log(`\nEclipse ${i + 1}:`);
  console.log(`  Date: ${maxTime.toString()}`);
  console.log(`  Type: ${eclipse.isTotal() ? 'Total' : 'Partial'}`);
  console.log(`  Duration: ${eclipse.getTotalityDuration().toFixed(2)} hours`);

  // Search for next eclipse after this one
  searchDate = eclipse.maximum + 1;
}

swe.close();
```

### Planetary Aspects

```typescript
import { SwissEphemeris, Planet } from '@swisseph/browser';

const swe = new SwissEphemeris();
await swe.init();

const jd = swe.julianDay(2025, 6, 15);

// Calculate positions
const sun = swe.calculatePosition(jd, Planet.Sun);
const moon = swe.calculatePosition(jd, Planet.Moon);

// Calculate aspect (angular difference)
let aspect = Math.abs(sun.longitude - moon.longitude);
if (aspect > 180) aspect = 360 - aspect;

console.log(`Sun-Moon aspect: ${aspect.toFixed(2)}°`);

// Classify aspect
if (Math.abs(aspect - 0) < 10) console.log('Conjunction');
else if (Math.abs(aspect - 60) < 10) console.log('Sextile');
else if (Math.abs(aspect - 90) < 10) console.log('Square');
else if (Math.abs(aspect - 120) < 10) console.log('Trine');
else if (Math.abs(aspect - 180) < 10) console.log('Opposition');

swe.close();
```

## Documentation

Complete documentation is available in the [GitHub repository](https://github.com/swisseph-js/swisseph/tree/main/docs):

- **[Getting Started Guide](https://github.com/swisseph-js/swisseph/blob/main/docs/getting-started.md)** - Installation and quick start
- **[API Reference](https://github.com/swisseph-js/swisseph/blob/main/docs/api/browser.md)** - Complete browser API documentation
- **[Shared Types](https://github.com/swisseph-js/swisseph/blob/main/docs/api/core.md)** - TypeScript types and enums reference
- **Usage Guides:**
  - [Birth Charts](https://github.com/swisseph-js/swisseph/blob/main/docs/guides/birth-charts.md) - Calculate complete birth charts
  - [Eclipse Calculations](https://github.com/swisseph-js/swisseph/blob/main/docs/guides/eclipses.md) - Find and analyze eclipses
  - [House Systems](https://github.com/swisseph-js/swisseph/blob/main/docs/guides/house-systems.md) - Understanding house systems
  - [Julian Days](https://github.com/swisseph-js/swisseph/blob/main/docs/guides/julian-days.md) - Working with Julian Day numbers
  - [Ephemeris Files](https://github.com/swisseph-js/swisseph/blob/main/docs/guides/ephemeris-files.md) - Understanding ephemeris files

## Browser Compatibility

Requires WebAssembly support (all modern browsers):
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Bundle Size

After gzip compression: ~200-250KB (WASM + TypeScript bundle)

Very reasonable for a high-precision astronomy library!

## Comparison: Browser vs Node.js

| Feature | @swisseph/browser | @swisseph/node |
|---------|-------------------|----------------|
| Platform | Any browser | Node.js only |
| Default Ephemeris | Moshier (built-in) | Swiss Ephemeris (bundled files) |
| Optional Ephemeris | Swiss Ephemeris (CDN) | Moshier (built-in) |
| Accuracy | Sub-arcsecond / JPL | JPL precision |
| Asteroids | With Swiss Ephemeris files | Yes (bundled) |
| Bundle Size | ~250KB (gzipped) | ~2MB + files |
| Performance | Excellent | Excellent |
| API | Identical | Identical |

**Both packages share the same modern TypeScript API!**

## Development

### Rebuilding the WASM Module

If you modify the C source code or need to update the WASM build (e.g., to export additional runtime methods), you'll need to rebuild:

**Prerequisites:**
- [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) installed and activated

**Steps:**

```bash
# Install Emscripten (first time only)
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

# Rebuild WASM module
cd packages/browser
./build-wasm.sh

# Build TypeScript
npm run build
```

The build script compiles the native Swiss Ephemeris C code to WebAssembly and exports:
- All calculation functions
- Runtime methods: `ccall`, `cwrap`, `FS` (filesystem), `allocateUTF8`
- Virtual filesystem support for loading ephemeris files

## License

AGPL-3.0 (same as Swiss Ephemeris)

## Links

- [GitHub Repository](https://github.com/swisseph-js/swisseph)
- [Swiss Ephemeris Documentation](https://www.astro.com/swisseph/)
- [@swisseph/node](../node/) - Native Node.js version
- [@swisseph/core](../core/) - Shared TypeScript types
