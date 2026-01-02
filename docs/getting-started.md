# Getting Started

This guide will help you get started with Swiss Ephemeris JS in your project.

## Choosing a Package

Swiss Ephemeris JS provides two packages optimized for different environments:

### @swisseph/node (Server-side)

**Use this when:**
- Building Node.js applications (APIs, CLIs, servers)
- Need maximum precision (JPL ephemeris)
- Working with asteroids
- Need full date range (13201 BC - 17191 AD)

**Features:**
- Native C++ addon for best performance
- Swiss Ephemeris data files bundled (auto-loaded)
- Asteroid calculations supported
- JPL-level precision

### @swisseph/browser (Client-side)

**Use this when:**
- Building web applications or PWAs
- Need client-side calculations (no server required)
- Bundle size is important (~250KB gzipped)
- Sub-arcsecond accuracy is sufficient

**Features:**
- WebAssembly powered
- Moshier ephemeris built-in (no external files)
- Optional: Load Swiss Ephemeris from CDN
- Runs entirely in browser

## Installation

### Node.js

```bash
npm install @swisseph/node
```

**Requirements:**
- Node.js 14.0.0 or higher
- C++ build tools (for compiling native addon)

<details>
<summary>Installing build tools</summary>

**macOS:**
```bash
xcode-select --install
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get install build-essential
```

**Windows:**
```bash
npm install --global windows-build-tools
```
</details>

### Browser

```bash
npm install @swisseph/browser
```

**Requirements:**
- Modern browser with WebAssembly support
- No build tools required

## Quick Start

### Node.js Example

```typescript
import {
  julianDay,
  calculatePosition,
  calculateHouses,
  Planet,
  HouseSystem
} from '@swisseph/node';

// No setup required! Ephemeris files bundled and auto-loaded

// Calculate Julian day
const jd = julianDay(2007, 3, 3);
console.log('Julian day:', jd); // 2454162.5

// Calculate planetary position
const sun = calculatePosition(jd, Planet.Sun);
console.log('Sun longitude:', sun.longitude);
console.log('Sun latitude:', sun.latitude);
console.log('Sun distance:', sun.distance, 'AU');

// Calculate houses
const houses = calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);
console.log('Ascendant:', houses.ascendant);
console.log('MC:', houses.mc);
console.log('1st house cusp:', houses.cusps[1]);
```

### Browser Example

```typescript
import { SwissEphemeris, Planet, HouseSystem } from '@swisseph/browser';

// Initialize WASM module
const swe = new SwissEphemeris();
await swe.init();

// Same API as Node.js!
const jd = swe.julianDay(2007, 3, 3);

// Calculate planetary position
const sun = swe.calculatePosition(jd, Planet.Sun);
console.log('Sun longitude:', sun.longitude);

// Calculate houses
const houses = swe.calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);
console.log('Ascendant:', houses.ascendant);
console.log('MC:', houses.mc);

// Clean up when done
swe.close();
```

**Optional: Load Swiss Ephemeris files for maximum precision**

```typescript
// Load from jsDelivr CDN (~2MB)
await swe.loadStandardEphemeris();

// Now use Swiss Ephemeris
import { CalculationFlag } from '@swisseph/browser';
const sun = swe.calculatePosition(jd, Planet.Sun, CalculationFlag.SwissEphemeris);
```

## Core Concepts

### Julian Day Numbers

Swiss Ephemeris uses Julian Day numbers for all calculations. A Julian Day is a continuous count of days since January 1, 4713 BCE.

```typescript
// Convert calendar date to Julian day
const jd = julianDay(2007, 3, 3, 12.5); // March 3, 2007, 12:30 UTC

// Convert Julian day back to calendar date
const date = julianDayToDate(jd);
console.log(date.year, date.month, date.day, date.hour);
```

### Celestial Bodies

Use TypeScript enums for type-safe body selection:

```typescript
import { Planet, Asteroid, LunarPoint } from '@swisseph/node';

// Planets
Planet.Sun, Planet.Moon, Planet.Mercury, Planet.Venus, Planet.Mars,
Planet.Jupiter, Planet.Saturn, Planet.Uranus, Planet.Neptune, Planet.Pluto

// Asteroids (Node.js only)
Asteroid.Chiron, Asteroid.Pholus, Asteroid.Ceres,
Asteroid.Pallas, Asteroid.Juno, Asteroid.Vesta

// Lunar points
LunarPoint.MeanNode, LunarPoint.TrueNode,
LunarPoint.MeanApogee, LunarPoint.OscuApogee
```

### House Systems

Multiple house systems are supported:

```typescript
import { HouseSystem } from '@swisseph/node';

HouseSystem.Placidus      // Most common in Western astrology
HouseSystem.Koch          // Koch system
HouseSystem.Equal         // Equal houses from Ascendant
HouseSystem.WholeSign     // Whole sign houses
HouseSystem.Campanus      // Campanus
HouseSystem.Regiomontanus // Regiomontanus
```

### Return Types

All functions return objects with named properties (not arrays):

```typescript
// Planetary position
const position = calculatePosition(jd, Planet.Sun);
position.longitude      // Ecliptic longitude in degrees
position.latitude       // Ecliptic latitude in degrees
position.distance       // Distance in AU
position.longitudeSpeed // Speed in degrees/day
position.latitudeSpeed
position.distanceSpeed
position.flags          // Calculation flags used

// House data
const houses = calculateHouses(jd, lat, lon, HouseSystem.Placidus);
houses.cusps[1..12]     // House cusps (1-based array)
houses.ascendant        // Ascendant degree
houses.mc               // Medium Coeli (Midheaven)
houses.armc             // Sidereal time
houses.vertex           // Vertex
houses.equatorialAscendant
houses.houseSystem      // House system used

// Eclipse
const eclipse = findNextLunarEclipse(jd);
eclipse.maximum         // JD of maximum eclipse
eclipse.isTotal()       // true if total eclipse
eclipse.isPartial()     // true if partial eclipse
eclipse.getTotalityDuration()  // Duration in hours
eclipse.getPartialDuration()
```

## Next Steps

- [API Reference](./api/node.md) - Detailed API documentation
- [Birth Chart Guide](./guides/birth-charts.md) - Calculate complete birth charts
- [Eclipse Guide](./guides/eclipses.md) - Find and analyze eclipses
- [House Systems Guide](./guides/house-systems.md) - Understanding house calculations

## Common Patterns

### Error Handling

```typescript
import { calculatePosition, Planet } from '@swisseph/node';

try {
  const position = calculatePosition(jd, Planet.Sun);
  console.log('Sun:', position.longitude);
} catch (error) {
  console.error('Calculation error:', error);
}
```

### Resource Management

Always call `close()` when done (especially important in Node.js):

```typescript
import { close } from '@swisseph/node';

// ... perform calculations

// Clean up resources
close();
```

For browser:

```typescript
const swe = new SwissEphemeris();
await swe.init();

// ... perform calculations

// Clean up
swe.close();
```

### Using Custom Ephemeris Files (Node.js)

```typescript
import { setEphemerisPath } from '@swisseph/node';

// Use custom ephemeris directory
setEphemerisPath('/path/to/custom/ephemeris');

// Revert to bundled files
setEphemerisPath(null);
```

## Help & Support

- [Troubleshooting Guide](./troubleshooting.md)
- [GitHub Issues](https://github.com/swisseph-js/swisseph/issues)
- [Swiss Ephemeris Documentation](https://www.astro.com/swisseph/)
