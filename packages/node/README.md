# @swisseph/node

High precision astronomical calculations for Node.js using native bindings to the Swiss Ephemeris C library.

## Installation

```bash
npm install @swisseph/node
# or
pnpm add @swisseph/node
# or
bun add @swisseph/node
```

**Requirements:**
- Node.js 14.0.0 or higher (or Bun)

**Prebuilt binaries are included** for common platforms (macOS, Linux, Windows). No C++ compiler needed for most users.

<details>
<summary>Building from source (optional)</summary>

If prebuilt binaries aren't available for your platform, the package will automatically build from source. You'll need C++ build tools:

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

## Quick Start

```typescript
import {
  dateToJulianDay,
  calculatePosition,
  calculateHouses,
  Planet,
  HouseSystem
} from '@swisseph/node';

// No setup required! Ephemeris files are bundled and auto-loaded.

// Calculate planetary position using Date object
const date = new Date('2007-03-03T00:00:00Z');
const jd = dateToJulianDay(date);
const sun = calculatePosition(jd, Planet.Sun);
console.log(`Sun: ${sun.longitude}°`);

// Calculate houses
const houses = calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);
console.log(`Ascendant: ${houses.ascendant}°`);
console.log(`MC: ${houses.mc}°`);
```

## Core API

### Date & Time

```typescript
// Convert JavaScript Date to Julian day (recommended)
dateToJulianDay(date, calendarType?)

// Convert date components to Julian day
julianDay(year, month, day, hour?, calendarType?)

// Convert Julian day back to date
julianDayToDate(jd, calendarType?)
```

**Examples:**
```typescript
// Using Date object (easiest)
const jd = dateToJulianDay(new Date('1990-05-15T14:30:00Z'));

// Using date components
const jd2 = julianDay(1990, 5, 15, 14.5);  // Same result

// Current time
const now = dateToJulianDay(new Date());
```

### Planetary Positions

```typescript
calculatePosition(jd, body, flags?)
// Returns: { longitude, latitude, distance, longitudeSpeed, ... }
```

**Available bodies:** `Planet.Sun`, `Planet.Moon`, `Planet.Mercury`, `Planet.Venus`, `Planet.Mars`, `Planet.Jupiter`, `Planet.Saturn`, `Planet.Uranus`, `Planet.Neptune`, `Planet.Pluto`, `Asteroid.Chiron`, `LunarPoint.MeanNode`, etc.

### Houses

```typescript
calculateHouses(jd, latitude, longitude, houseSystem?)
// Returns: { cusps[], ascendant, mc, armc, vertex, ... }
```

**House systems:** `Placidus`, `Koch`, `Equal`, `WholeSign`, `Campanus`, `Regiomontanus`, etc.

### Eclipses

```typescript
findNextLunarEclipse(startJd, flags?, eclipseType?, backward?)
findNextSolarEclipse(startJd, flags?, eclipseType?, backward?)
// Returns eclipse object with methods: isTotal(), isPartial(), getTotalityDuration(), etc.
```

### Utilities

```typescript
getCelestialBodyName(body)  // Get name string
close()                      // Free resources when done
```

## Ephemeris Options

**Default: Swiss Ephemeris (bundled, ~2MB)**
- JPL precision, automatically loaded
- Includes planets, moon, and main asteroids
- No configuration needed

**Optional: Moshier Ephemeris (built-in)**
```typescript
import { CalculationFlag } from '@swisseph/node';
calculatePosition(jd, Planet.Sun, CalculationFlag.MoshierEphemeris);
```
- No files loaded, smaller footprint
- Sub-arcsecond precision
- Major planets only (no asteroids)

**Optional: Custom Files**
```typescript
import { setEphemerisPath } from '@swisseph/node';
setEphemerisPath('/path/to/custom/ephemeris');
```

Download additional files from [Swiss Ephemeris repository](https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/).

## TypeScript Support

Full TypeScript types included. All enums and interfaces are exported:

```typescript
import {
  Planet, Asteroid, LunarPoint,      // Celestial bodies
  HouseSystem,                        // House systems
  CalculationFlag,                    // Calculation options
  CalendarType                        // Gregorian/Julian
} from '@swisseph/node';
```

## Examples

### Birth Chart Calculation

```typescript
import {
  dateToJulianDay,
  calculatePosition,
  calculateHouses,
  Planet,
  HouseSystem,
  close
} from '@swisseph/node';

// Birth: May 15, 1990, 14:30 UTC, New York (40.7128°N, 74.0060°W)
const birthDate = new Date('1990-05-15T14:30:00Z');
const jd = dateToJulianDay(birthDate);

// Calculate all planet positions
const planets = [
  { name: 'Sun', position: calculatePosition(jd, Planet.Sun) },
  { name: 'Moon', position: calculatePosition(jd, Planet.Moon) },
  { name: 'Mercury', position: calculatePosition(jd, Planet.Mercury) },
  { name: 'Venus', position: calculatePosition(jd, Planet.Venus) },
  { name: 'Mars', position: calculatePosition(jd, Planet.Mars) },
  { name: 'Jupiter', position: calculatePosition(jd, Planet.Jupiter) },
  { name: 'Saturn', position: calculatePosition(jd, Planet.Saturn) },
  { name: 'Uranus', position: calculatePosition(jd, Planet.Uranus) },
  { name: 'Neptune', position: calculatePosition(jd, Planet.Neptune) },
  { name: 'Pluto', position: calculatePosition(jd, Planet.Pluto) }
];

planets.forEach(({ name, position }) => {
  console.log(`${name}: ${position.longitude.toFixed(4)}°`);
});

// Calculate houses
const houses = calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);
console.log(`Ascendant: ${houses.ascendant.toFixed(4)}°`);
console.log(`MC: ${houses.mc.toFixed(4)}°`);

for (let i = 1; i <= 12; i++) {
  console.log(`House ${i}: ${houses.cusps[i].toFixed(4)}°`);
}

close();
```

### Eclipse Search

```typescript
import {
  julianDay,
  julianDayToDate,
  findNextLunarEclipse,
  close
} from '@swisseph/node';

// Find next 5 lunar eclipses starting from Jan 1, 2025
let searchDate = julianDay(2025, 1, 1);

for (let i = 0; i < 5; i++) {
  const eclipse = findNextLunarEclipse(searchDate);
  const maxTime = julianDayToDate(eclipse.maximum);

  console.log(`\nEclipse ${i + 1}:`);
  console.log(`  Date: ${maxTime.toString()}`);
  console.log(`  Type: ${eclipse.isTotal() ? 'Total' : eclipse.isPartial() ? 'Partial' : 'Penumbral'}`);
  console.log(`  Totality duration: ${eclipse.getTotalityDuration().toFixed(2)} hours`);

  // Search for next eclipse after this one
  searchDate = eclipse.maximum + 1;
}

close();
```

### Planetary Aspects

```typescript
import { dateToJulianDay, calculatePosition, Planet, close } from '@swisseph/node';

// Calculate for current time
const jd = dateToJulianDay(new Date());

// Calculate positions
const sun = calculatePosition(jd, Planet.Sun);
const moon = calculatePosition(jd, Planet.Moon);

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

close();
```

## Documentation

Complete documentation is available in the [GitHub repository](https://github.com/swisseph-js/swisseph/tree/main/docs):

- **[Getting Started Guide](https://github.com/swisseph-js/swisseph/blob/main/docs/getting-started.md)** - Installation and quick start
- **[API Reference](https://github.com/swisseph-js/swisseph/blob/main/docs/api/node.md)** - Complete Node.js API documentation
- **[Shared Types](https://github.com/swisseph-js/swisseph/blob/main/docs/api/core.md)** - TypeScript types and enums reference
- **Usage Guides:**
  - [Birth Charts](https://github.com/swisseph-js/swisseph/blob/main/docs/guides/birth-charts.md) - Calculate complete birth charts
  - [Eclipse Calculations](https://github.com/swisseph-js/swisseph/blob/main/docs/guides/eclipses.md) - Find and analyze eclipses
  - [House Systems](https://github.com/swisseph-js/swisseph/blob/main/docs/guides/house-systems.md) - Understanding house systems
  - [Julian Days](https://github.com/swisseph-js/swisseph/blob/main/docs/guides/julian-days.md) - Working with Julian Day numbers
  - [Ephemeris Files](https://github.com/swisseph-js/swisseph/blob/main/docs/guides/ephemeris-files.md) - Understanding ephemeris files

## Troubleshooting

**"Module did not self-register" or platform errors**
- The package includes prebuilt binaries for common platforms
- If your platform isn't supported, the package will try to build from source
- Install C++ build tools if needed (see "Building from source" above)
- Try rebuilding: `npm rebuild @swisseph/node`

**Build fails with "node-gyp rebuild failed"**
- Install C++ build tools (see "Building from source" section above)
- On macOS: ensure Xcode Command Line Tools are installed
- On Windows: ensure Visual Studio Build Tools are installed

**"Cannot find ephemeris files"**
- Files are bundled with the package. Check `node_modules/@swisseph/node/ephemeris/` exists
- If using custom files, verify path in `setEphemerisPath()`

## License

AGPL-3.0 (same as Swiss Ephemeris)

## Links

- [GitHub Repository](https://github.com/swisseph-js/swisseph)
- [Swiss Ephemeris Documentation](https://www.astro.com/swisseph/)
- [@swisseph/browser](../browser/) - WebAssembly version for browsers
- [@swisseph/core](../core/) - Shared TypeScript types
