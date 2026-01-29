# Troubleshooting Guide

Common issues and solutions for Swiss Ephemeris JS.

## Table of Contents

- [Invalid Date Errors](#invalid-date-errors)
- [TypeScript Enum Usage](#typescript-enum-usage)
- [Celestial Body Organization](#celestial-body-organization)
- [Installation Issues](#installation-issues)
- [Calculation Errors](#calculation-errors)
- [Platform-Specific Issues](#platform-specific-issues)

---

## Invalid Date Errors

### TypeError: Invalid Date object provided to dateToJulianDay

**Symptom:**
```
TypeError: Invalid Date object provided to dateToJulianDay.
Date.toString() returned: "Invalid Date"
```

**Cause:** Passing an invalid JavaScript Date object to `dateToJulianDay()`.

**Solution:**

Always validate date inputs before conversion:

```typescript
import { dateToJulianDay } from '@swisseph/node';

// ❌ BAD - Invalid date string
const badDate = new Date("garbage");
const jd = dateToJulianDay(badDate); // Throws TypeError

// ✅ GOOD - Validate first
function safeConvert(dateInput: string | Date): number | null {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateInput);
    return null;
  }

  return dateToJulianDay(date);
}

const jd = safeConvert("2007-03-03T12:00:00Z"); // Works!
```

**Common invalid date patterns:**
```typescript
new Date("not-a-date")      // Invalid
new Date("13/45/2024")      // Invalid month/day
new Date(NaN)               // Invalid
new Date(undefined)         // Invalid
```

**Valid patterns:**
```typescript
new Date("2007-03-03")                    // ISO 8601
new Date("2007-03-03T12:30:00Z")          // ISO 8601 with time
new Date(2007, 2, 3)                      // Year, month (0-indexed), day
new Date(Date.UTC(2007, 2, 3, 12, 30))    // UTC timestamp
```

---

### TypeError: julianDay requires finite numbers

**Symptom:**
```
TypeError: julianDay requires finite numbers.
Received: year=NaN, month=NaN, day=NaN, hour=NaN
```

**Cause:** Passing `NaN`, `Infinity`, or invalid numbers to `julianDay()`.

**Solution:**

```typescript
import { julianDay } from '@swisseph/node';

// ❌ BAD
const jd = julianDay(NaN, 3, 3); // Throws TypeError

// ✅ GOOD - Validate inputs
function safeJulianDay(year: number, month: number, day: number, hour: number = 0): number | null {
  if (!Number.isFinite(year) || !Number.isFinite(month) ||
      !Number.isFinite(day) || !Number.isFinite(hour)) {
    console.error('Invalid date components');
    return null;
  }

  return julianDay(year, month, day, hour);
}
```

---

## TypeScript Enum Usage

### Understanding Enum Structure

TypeScript numeric enums create **both forward and reverse mappings**:

```typescript
import { Planet } from '@swisseph/node';

console.log(Planet.Sun);    // 0 (name → value)
console.log(Planet[0]);     // "Sun" (value → name)

// This means Object.keys(Planet) returns BOTH keys and values:
console.log(Object.keys(Planet));
// ["0", "1", "2", ..., "Sun", "Moon", "Mercury", ...]
```

### ✅ Recommended Patterns

**Direct usage (best practice):**
```typescript
import { calculatePosition, Planet } from '@swisseph/node';

// Use enum values directly
const sun = calculatePosition(jd, Planet.Sun);
const moon = calculatePosition(jd, Planet.Moon);

// Array of specific planets
const planets = [Planet.Sun, Planet.Moon, Planet.Mars];
planets.forEach(planet => {
  const pos = calculatePosition(jd, planet);
  console.log(`Planet ${planet}:`, pos.longitude);
});
```

**Getting all numeric values:**
```typescript
const planetValues = Object.values(Planet)
  .filter(v => typeof v === 'number') as number[];

console.log(planetValues); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 14, -1, -10]
```

**Getting all string keys:**
```typescript
const planetNames = Object.keys(Planet)
  .filter(k => isNaN(Number(k)));

console.log(planetNames);
// ["Sun", "Moon", "Mercury", "Venus", "Mars", ...]
```

**Iterating all planets:**
```typescript
import { calculatePosition, Planet, getCelestialBodyName } from '@swisseph/node';

// Get numeric values only
const planetIds = Object.values(Planet).filter(v => typeof v === 'number') as number[];

planetIds.forEach(planetId => {
  const name = getCelestialBodyName(planetId);
  const position = calculatePosition(jd, planetId);
  console.log(`${name}: ${position.longitude}°`);
});
```

### ⚠️ Common Pitfalls

**Don't iterate Object.keys() directly:**
```typescript
// ❌ BAD - This includes both keys AND values
Object.keys(Planet).forEach(key => {
  console.log(key); // Logs: "0", "1", "2", ..., "Sun", "Moon", ...
});
```

**Don't use for...in without filtering:**
```typescript
// ❌ BAD - Iterates over both directions
for (const key in Planet) {
  console.log(key); // Includes numeric strings too
}
```

### Enum to String Conversion

```typescript
import { Planet, getCelestialBodyName } from '@swisseph/node';

// Method 1: Use enum reverse mapping
console.log(Planet[Planet.Sun]);  // "Sun"

// Method 2: Use library function (recommended)
console.log(getCelestialBodyName(Planet.Sun));  // "Sun"

// Method 3: Custom mapping
const planetNames: Record<number, string> = {
  [Planet.Sun]: "Sun",
  [Planet.Moon]: "Moon",
  // ...
};
```

---

## Celestial Body Organization

### Why are MeanNode and TrueNode not in the Planet enum?

**Issue:** Users coming from the C library expect all celestial body IDs in one enum.

**Design:** Swiss Ephemeris JS organizes bodies into **semantic categories**:

| Enum | Purpose | Examples |
|------|---------|----------|
| `Planet` | Major planets & luminaries | Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto |
| `LunarPoint` | Lunar nodes & apogees | MeanNode, TrueNode, MeanApogee (Lilith) |
| `Asteroid` | Main belt asteroids | Chiron, Pholus, Ceres, Pallas, Juno, Vesta |
| `FictitiousPlanet` | Uranian & hypothetical | Cupido, Hades, Zeus, Vulcan, etc. |

**✅ Correct Usage:**

```typescript
import { calculatePosition, Planet, LunarPoint, Asteroid } from '@swisseph/node';

// Planets
const sun = calculatePosition(jd, Planet.Sun);
const mars = calculatePosition(jd, Planet.Mars);

// Lunar points
const northNode = calculatePosition(jd, LunarPoint.MeanNode);
const trueNode = calculatePosition(jd, LunarPoint.TrueNode);
const lilith = calculatePosition(jd, LunarPoint.MeanApogee);

// Asteroids
const chiron = calculatePosition(jd, Asteroid.Chiron);
const ceres = calculatePosition(jd, Asteroid.Ceres);
```

**All work the same way with `calculatePosition()`** - the separation is purely for developer clarity.

### Quick Reference: Common Body IDs

```typescript
// Lunar Nodes
LunarPoint.MeanNode      // 10 - Mean North Node
LunarPoint.TrueNode      // 11 - True/Osculating North Node

// Black Moon Lilith
LunarPoint.MeanApogee    // 12 - Mean Lunar Apogee (most common Lilith)

// Major Asteroids
Asteroid.Chiron          // 15
Asteroid.Pholus          // 16
Asteroid.Ceres           // 17
Asteroid.Pallas          // 18
Asteroid.Juno            // 19
Asteroid.Vesta           // 20
```

### Creating a Combined List

If you need all bodies in one array:

```typescript
import { Planet, LunarPoint, Asteroid, CelestialBody } from '@swisseph/node';

const allBodies: CelestialBody[] = [
  // Planets
  Planet.Sun,
  Planet.Moon,
  Planet.Mercury,
  Planet.Venus,
  Planet.Mars,
  Planet.Jupiter,
  Planet.Saturn,
  Planet.Uranus,
  Planet.Neptune,
  Planet.Pluto,

  // Lunar points
  LunarPoint.MeanNode,
  LunarPoint.TrueNode,

  // Asteroids
  Asteroid.Chiron,
  Asteroid.Ceres,
];

allBodies.forEach(body => {
  const position = calculatePosition(jd, body);
  console.log(getCelestialBodyName(body), position.longitude);
});
```

---

## Installation Issues

### Module did not self-register (Node.js)

**Symptom:**
```
Error: Module did not self-register
```

**Causes:**
- Node.js version mismatch between build and runtime
- Platform mismatch (e.g., built on macOS, running on Linux)
- Corrupted prebuilt binaries

**Solutions:**

```bash
# Solution 1: Rebuild the native addon
npm rebuild @swisseph/node

# Solution 2: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Solution 3: Force compilation from source
npm install @swisseph/node --build-from-source
```

### Build fails with "node-gyp rebuild failed"

**Symptom:**
```
gyp ERR! build error
gyp ERR! stack Error: `make` failed with exit code: 2
```

**Solution:** Install C++ build tools for your platform.

**macOS:**
```bash
xcode-select --install
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install build-essential
```

**Windows:**
```bash
npm install --global windows-build-tools
```

### Cannot find ephemeris files

**Symptom:**
```
Error: Cannot find ephemeris files
```

**Node.js Solution:**

Ephemeris files are bundled by default. If you see this error:

```typescript
import { setEphemerisPath } from '@swisseph/node';
import * as path from 'path';

// Explicitly set path to bundled files
const bundledPath = path.join(__dirname, '..', 'node_modules', '@swisseph/node', 'ephemeris');
setEphemerisPath(bundledPath);
```

**Browser Solution:**

```typescript
import { SwissEphemeris } from '@swisseph/browser';

const swe = new SwissEphemeris();
await swe.init();

// Load Swiss Ephemeris from CDN
await swe.loadStandardEphemeris();
```

---

## Calculation Errors

### Planet calculation returns error

**Symptom:**
```
Error: planet number -2 not found
```

**Cause:** Invalid planet/body ID.

**Solution:** Use enum constants instead of magic numbers.

```typescript
// ❌ BAD
const position = calculatePosition(jd, -2); // Invalid ID

// ✅ GOOD
import { Planet, LunarPoint, Asteroid } from '@swisseph/node';

const sun = calculatePosition(jd, Planet.Sun);
const node = calculatePosition(jd, LunarPoint.MeanNode);
const chiron = calculatePosition(jd, Asteroid.Chiron);
```

### House calculation fails

**Symptom:**
```
Error: Failed to calculate houses
```

**Common causes:**
1. Invalid latitude/longitude (outside ±90°/±180°)
2. Invalid house system character
3. Extreme geographic locations (near poles)

**Solution:**

```typescript
import { calculateHouses, HouseSystem } from '@swisseph/node';

// Validate coordinates
function safeCalculateHouses(
  jd: number,
  lat: number,
  lon: number,
  system: HouseSystem
) {
  // Validate latitude (-90 to 90)
  if (lat < -90 || lat > 90) {
    throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90.`);
  }

  // Validate longitude (-180 to 180)
  if (lon < -180 || lon > 180) {
    throw new Error(`Invalid longitude: ${lon}. Must be between -180 and 180.`);
  }

  return calculateHouses(jd, lat, lon, system);
}

// Use with valid coordinates
const houses = safeCalculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);
```

---

## Platform-Specific Issues

### Node.js v22+ Enum Behavior

**Issue:** TypeScript enum iteration may behave differently in Node.js v22+.

**Solution:** Always filter enum values explicitly (see [TypeScript Enum Usage](#typescript-enum-usage) above).

### WebAssembly not supported (Browser)

**Symptom:**
```
Error: WebAssembly is not supported in this browser
```

**Solution:** Check browser compatibility and provide fallback.

```typescript
function checkWasmSupport(): boolean {
  try {
    if (typeof WebAssembly === 'object' &&
        typeof WebAssembly.instantiate === 'function') {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

if (!checkWasmSupport()) {
  console.error('WebAssembly not supported. Please upgrade your browser.');
  // Show user-friendly error message
}
```

**Minimum browser versions:**
- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 16+

---

## Getting Help

If you encounter an issue not covered here:

1. **Check the API documentation:**
   - [@swisseph/node API](./api/node.md)
   - [@swisseph/core Types](./api/core.md)
   - [Getting Started Guide](./getting-started.md)

2. **Search existing issues:**
   - [GitHub Issues](https://github.com/swisseph-js/swisseph/issues)

3. **Create a new issue with:**
   - Node.js version (`node --version`)
   - Package version (`npm list @swisseph/node`)
   - Operating system
   - Minimal reproduction code
   - Full error message

4. **Consult Swiss Ephemeris documentation:**
   - [Swiss Ephemeris Official Docs](https://www.astro.com/swisseph/)
