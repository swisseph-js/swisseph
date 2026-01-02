# @swisseph/browser API Reference

Complete API reference for the browser package (WebAssembly version).

## Installation

```bash
npm install @swisseph/browser
```

## Import

```typescript
import {
  SwissEphemeris,

  // Enums
  Planet,
  Asteroid,
  LunarPoint,
  HouseSystem,
  CalculationFlag,
  CalendarType,

  // Types
  PlanetaryPosition,
  HouseData,
  LunarEclipse,
  SolarEclipse,
  DateTime
} from '@swisseph/browser';
```

---

## SwissEphemeris Class

The main class for all astronomical calculations in the browser.

### Constructor

```typescript
new SwissEphemeris()
```

Creates a new SwissEphemeris instance. You must call `init()` before using any calculation methods.

**Example:**
```typescript
const swe = new SwissEphemeris();
await swe.init();
```

---

## Initialization

### init()

Initialize the WebAssembly module.

```typescript
async init(): Promise<void>
```

**Returns:** Promise that resolves when WASM module is loaded and ready

**Example:**
```typescript
const swe = new SwissEphemeris();
await swe.init();

// Now ready to use
const jd = swe.julianDay(2007, 3, 3);
```

**Notes:**
- This must be called before any other methods
- The WASM file is automatically loaded from the same directory as the JavaScript bundle
- Works out-of-the-box with all modern bundlers (Vite, Webpack, Rollup, etc.)
- By default, uses built-in Moshier ephemeris

---

## Loading Swiss Ephemeris Files

### loadStandardEphemeris()

Load standard Swiss Ephemeris files from jsDelivr CDN for maximum precision.

```typescript
async loadStandardEphemeris(): Promise<void>
```

**Returns:** Promise that resolves when files are loaded into WASM filesystem

**Example:**
```typescript
const swe = new SwissEphemeris();
await swe.init();

// Load Swiss Ephemeris from CDN
await swe.loadStandardEphemeris();

// Now use with SwissEphemeris flag for maximum precision
const sun = swe.calculatePosition(jd, Planet.Sun, CalculationFlag.SwissEphemeris);
```

**Files loaded:**
- `sepl_18.se1` - Planetary positions (planets, Moon, main asteroids)
- `semo_18.se1` - Moon positions

**Source:** https://cdn.jsdelivr.net/npm/@swisseph/ephemeris/

**Size:** ~2MB total download

### loadEphemerisFiles()

Load custom ephemeris files from specified URLs.

```typescript
async loadEphemerisFiles(files: Array<{
  name: string;
  url: string;
}>): Promise<void>
```

**Parameters:**
- `files` - Array of file objects with `name` (filename) and `url` (download URL)

**Returns:** Promise that resolves when all files are loaded

**Example:**
```typescript
await swe.loadEphemerisFiles([
  {
    name: 'sepl_18.se1',
    url: 'https://your-cdn.com/ephemeris/sepl_18.se1'
  },
  {
    name: 'semo_18.se1',
    url: 'https://your-cdn.com/ephemeris/semo_18.se1'
  },
  {
    name: 'seas_18.se1',
    url: 'https://your-cdn.com/ephemeris/seas_18.se1'
  }
]);
```

**Use case:** Self-hosting ephemeris files or using custom/extended ephemeris data.

---

## Date Conversions

### julianDay()

Convert calendar date to Julian day number.

```typescript
julianDay(
  year: number,
  month: number,
  day: number,
  hour?: number,
  calendarType?: CalendarType
): number
```

**Parameters:**
- `year` - Year (negative for BCE)
- `month` - Month (1-12)
- `day` - Day (1-31)
- `hour` - Hour as decimal (0.0-23.999...), default: 0
- `calendarType` - `CalendarType.Gregorian` or `CalendarType.Julian`, default: Gregorian

**Returns:** Julian day number

**Example:**
```typescript
const swe = new SwissEphemeris();
await swe.init();

const jd = swe.julianDay(2007, 3, 3);
console.log(jd); // 2454162.5

const jdWithTime = swe.julianDay(2007, 3, 3, 14.5); // 14:30 UTC
console.log(jdWithTime); // 2454163.104166667
```

### julianDayToDate()

Convert Julian day number to calendar date.

```typescript
julianDayToDate(
  jd: number,
  calendarType?: CalendarType
): DateTime
```

**Parameters:**
- `jd` - Julian day number
- `calendarType` - `CalendarType.Gregorian` or `CalendarType.Julian`, default: Gregorian

**Returns:** DateTime object with properties:
- `year: number`
- `month: number`
- `day: number`
- `hour: number`
- `calendarType: CalendarType`
- `toString(): string` - Human-readable date string

**Example:**
```typescript
const date = swe.julianDayToDate(2454162.5);
console.log(date.year);  // 2007
console.log(date.month); // 3
console.log(date.day);   // 3
console.log(date.hour);  // 0.0
console.log(date.toString()); // "2007-03-03 00:00:00 (Gregorian)"
```

---

## Planetary Calculations

### calculatePosition()

Calculate planetary positions.

```typescript
calculatePosition(
  julianDay: number,
  body: CelestialBody,
  flags?: CalculationFlagInput
): PlanetaryPosition
```

**Parameters:**
- `julianDay` - Julian day number in Universal Time
- `body` - Celestial body (use `Planet`, `Asteroid`, or `LunarPoint` enums)
- `flags` - Calculation flags, default: `CalculationFlag.MoshierEphemeris | CalculationFlag.Speed`

**Returns:** PlanetaryPosition object with properties:
- `longitude: number` - Ecliptic longitude in degrees
- `latitude: number` - Ecliptic latitude in degrees
- `distance: number` - Distance in AU
- `longitudeSpeed: number` - Longitude speed in degrees/day
- `latitudeSpeed: number` - Latitude speed in degrees/day
- `distanceSpeed: number` - Distance speed in AU/day
- `flags: number` - Calculation flags used

**Example:**
```typescript
const swe = new SwissEphemeris();
await swe.init();

const jd = swe.julianDay(2007, 3, 3);

// Using Moshier (default, built-in)
const sun = swe.calculatePosition(jd, Planet.Sun);
console.log(`Sun longitude: ${sun.longitude}°`);

// Using Swiss Ephemeris (requires loading files first)
await swe.loadStandardEphemeris();
const moon = swe.calculatePosition(
  jd,
  Planet.Moon,
  CalculationFlag.SwissEphemeris | CalculationFlag.Speed
);
console.log(`Moon longitude: ${moon.longitude}°`);

// With equatorial coordinates
const mars = swe.calculatePosition(
  jd,
  Planet.Mars,
  CalculationFlag.MoshierEphemeris | CalculationFlag.Equatorial
);
```

**Supported bodies:**

Planets (both Moshier and Swiss Ephemeris):
- `Planet.Sun`, `Planet.Moon`, `Planet.Mercury`, `Planet.Venus`, `Planet.Mars`
- `Planet.Jupiter`, `Planet.Saturn`, `Planet.Uranus`, `Planet.Neptune`, `Planet.Pluto`

Asteroids (Swiss Ephemeris only, requires loading files):
- `Asteroid.Chiron`, `Asteroid.Pholus`, `Asteroid.Ceres`
- `Asteroid.Pallas`, `Asteroid.Juno`, `Asteroid.Vesta`

Lunar points (both ephemeris types):
- `LunarPoint.MeanNode`, `LunarPoint.TrueNode`
- `LunarPoint.MeanApogee` (Black Moon Lilith), `LunarPoint.OscuApogee`

---

## House Calculations

### calculateHouses()

Calculate house cusps and angles.

```typescript
calculateHouses(
  julianDay: number,
  latitude: number,
  longitude: number,
  houseSystem?: HouseSystem
): HouseData
```

**Parameters:**
- `julianDay` - Julian day number in Universal Time
- `latitude` - Geographic latitude (positive = north, negative = south)
- `longitude` - Geographic longitude (positive = east, negative = west)
- `houseSystem` - House system to use, default: `HouseSystem.Placidus`

**Returns:** HouseData object with properties:
- `cusps: number[]` - Array of 13 house cusps (index 0 unused, 1-12 for houses)
- `ascendant: number` - Ascendant degree
- `mc: number` - Medium Coeli (Midheaven)
- `armc: number` - Sidereal time
- `vertex: number` - Vertex
- `equatorialAscendant: number`
- `coAscendant1: number` (Walter Koch)
- `coAscendant2: number` (Michael Munkasey)
- `polarAscendant: number` (M. Munkasey)
- `houseSystem: HouseSystem` - House system used

**Example:**
```typescript
const swe = new SwissEphemeris();
await swe.init();

const jd = swe.julianDay(2007, 3, 3);

// New York coordinates
const houses = swe.calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);

console.log(`Ascendant: ${houses.ascendant}°`);
console.log(`MC: ${houses.mc}°`);

for (let i = 1; i <= 12; i++) {
  console.log(`House ${i}: ${houses.cusps[i]}°`);
}

// Try different house systems
const wholeSigns = swe.calculateHouses(jd, 40.7128, -74.0060, HouseSystem.WholeSign);
const equal = swe.calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Equal);
```

**Available house systems:**
- `HouseSystem.Placidus` - Placidus (most common in Western astrology)
- `HouseSystem.Koch` - Koch
- `HouseSystem.Equal` - Equal houses from Ascendant
- `HouseSystem.WholeSign` - Whole sign houses
- `HouseSystem.Campanus` - Campanus
- `HouseSystem.Regiomontanus` - Regiomontanus
- `HouseSystem.Porphyrius` - Porphyrius
- `HouseSystem.Meridian` - Axial rotation (Meridian)
- `HouseSystem.Alcabitus` - Alcabitius
- `HouseSystem.Morinus` - Morinus
- `HouseSystem.Vehlow` - Vehlow equal (Asc. in middle of house 1)

---

## Eclipse Calculations

### findNextLunarEclipse()

Find the next lunar eclipse.

```typescript
findNextLunarEclipse(
  startJulianDay: number,
  flags?: CalculationFlagInput,
  eclipseType?: EclipseTypeFlagInput,
  backward?: boolean
): LunarEclipse
```

**Parameters:**
- `startJulianDay` - Julian day to start search from
- `flags` - Calculation flags, default: `CalculationFlag.MoshierEphemeris`
- `eclipseType` - Filter by eclipse type, default: 0 (all types)
- `backward` - Search backward in time, default: false

**Returns:** LunarEclipse object with properties:
- `maximum: number` - JD of maximum eclipse
- `partialBegin: number` - JD of partial phase beginning
- `partialEnd: number` - JD of partial phase end
- `totalBegin: number` - JD of totality beginning (0 if not total)
- `totalEnd: number` - JD of totality end (0 if not total)
- `penumbralBegin: number` - JD of penumbral phase beginning
- `penumbralEnd: number` - JD of penumbral phase end
- `eclipseType: number` - Eclipse type flags
- `isTotal(): boolean` - True if total eclipse
- `isPartial(): boolean` - True if partial eclipse
- `isPenumbral(): boolean` - True if penumbral only
- `getTotalityDuration(): number` - Duration of totality in hours
- `getPartialDuration(): number` - Duration of partial phase in hours

**Example:**
```typescript
const swe = new SwissEphemeris();
await swe.init();

const jd = swe.julianDay(2025, 1, 1);
const eclipse = swe.findNextLunarEclipse(jd);

const eclipseDate = swe.julianDayToDate(eclipse.maximum);
console.log(`Next lunar eclipse: ${eclipseDate.toString()}`);
console.log(`Is total: ${eclipse.isTotal()}`);
console.log(`Totality duration: ${eclipse.getTotalityDuration()} hours`);
console.log(`Partial duration: ${eclipse.getPartialDuration()} hours`);

// Find previous eclipse
const prevEclipse = swe.findNextLunarEclipse(jd, undefined, 0, true);
```

### findNextSolarEclipse()

Find the next solar eclipse visible anywhere on Earth.

```typescript
findNextSolarEclipse(
  startJulianDay: number,
  flags?: CalculationFlagInput,
  eclipseType?: EclipseTypeFlagInput,
  backward?: boolean
): SolarEclipse
```

**Parameters:**
- `startJulianDay` - Julian day to start search from
- `flags` - Calculation flags, default: `CalculationFlag.MoshierEphemeris`
- `eclipseType` - Filter by eclipse type, default: 0 (all types)
- `backward` - Search backward in time, default: false

**Returns:** SolarEclipse object with properties:
- `maximum: number` - JD of maximum eclipse
- `partialBegin: number` - JD of partial phase beginning
- `partialEnd: number` - JD of partial phase end
- `centralBegin: number` - JD of central phase beginning
- `centralEnd: number` - JD of central phase end
- `centerLineBegin: number` - JD of center line beginning
- `centerLineEnd: number` - JD of center line end
- `eclipseType: number` - Eclipse type flags
- `isTotal(): boolean` - True if total eclipse
- `isAnnular(): boolean` - True if annular eclipse
- `isPartial(): boolean` - True if partial eclipse
- `isCentral(): boolean` - True if central (total or annular)

**Example:**
```typescript
const swe = new SwissEphemeris();
await swe.init();

const jd = swe.julianDay(2025, 1, 1);
const eclipse = swe.findNextSolarEclipse(jd);

const eclipseDate = swe.julianDayToDate(eclipse.maximum);
console.log(`Next solar eclipse: ${eclipseDate.toString()}`);
console.log(`Is total: ${eclipse.isTotal()}`);
console.log(`Is annular: ${eclipse.isAnnular()}`);
console.log(`Is central: ${eclipse.isCentral()}`);
```

---

## Utility Functions

### getCelestialBodyName()

Get the name of a celestial body.

```typescript
getCelestialBodyName(body: CelestialBody): string
```

**Parameters:**
- `body` - Celestial body identifier

**Returns:** Name as string

**Example:**
```typescript
const swe = new SwissEphemeris();
await swe.init();

const name = swe.getCelestialBodyName(Planet.Mars);
console.log(name); // "Mars"

const sunName = swe.getCelestialBodyName(Planet.Sun);
console.log(sunName); // "Sun"
```

### close()

Close Swiss Ephemeris and free resources.

```typescript
close(): void
```

**Example:**
```typescript
const swe = new SwissEphemeris();
await swe.init();

// ... perform calculations

// Clean up when done
swe.close();
```

**Note:** Always call this when done to free allocated WASM memory.

---

## Enums

All enums are shared with `@swisseph/node` and defined in `@swisseph/core`.

### Planet

```typescript
enum Planet {
  Sun = 0,
  Moon = 1,
  Mercury = 2,
  Venus = 3,
  Mars = 4,
  Jupiter = 5,
  Saturn = 6,
  Uranus = 7,
  Neptune = 8,
  Pluto = 9
}
```

### Asteroid

```typescript
enum Asteroid {
  Chiron = 15,
  Pholus = 16,
  Ceres = 17,
  Pallas = 18,
  Juno = 19,
  Vesta = 20
}
```

**Note:** Asteroids require loading Swiss Ephemeris files with `loadStandardEphemeris()`.

### LunarPoint

```typescript
enum LunarPoint {
  MeanNode = 10,      // Mean Lunar Node
  TrueNode = 11,      // True Lunar Node
  MeanApogee = 12,    // Mean Apogee (Black Moon Lilith)
  OscuApogee = 13     // Osculating Apogee
}
```

### HouseSystem

```typescript
enum HouseSystem {
  Placidus = 'P',
  Koch = 'K',
  Porphyrius = 'O',
  Regiomontanus = 'R',
  Campanus = 'C',
  Equal = 'A',
  VehlowEqual = 'V',
  WholeSign = 'W',
  Meridian = 'X',
  // ... and more
}
```

### CalculationFlag

```typescript
enum CalculationFlag {
  SwissEphemeris = 2,      // Use Swiss Ephemeris files
  MoshierEphemeris = 4,    // Use Moshier ephemeris (default)
  Speed = 256,             // Calculate speed (velocity)
  Equatorial = 2048,       // Equatorial coordinates
  Heliocentric = 8,        // Heliocentric positions
  TruePositions = 16,      // True/geometric positions (not apparent)
  // ... and more
}
```

Flags can be combined with bitwise OR:
```typescript
const flags = CalculationFlag.MoshierEphemeris | CalculationFlag.Speed | CalculationFlag.Equatorial;
```

**Important:** By default, browser uses `MoshierEphemeris`. Use `SwissEphemeris` only after calling `loadStandardEphemeris()`.

### CalendarType

```typescript
enum CalendarType {
  Gregorian = 1,
  Julian = 0
}
```

---

## Types

See [@swisseph/core API Reference](./core.md) for detailed type definitions.

---

## Error Handling

Methods throw errors when calculations fail. Always use try-catch:

```typescript
const swe = new SwissEphemeris();
await swe.init();

try {
  const position = swe.calculatePosition(jd, Planet.Sun);
  console.log(position);
} catch (error) {
  console.error('Calculation failed:', error);
}
```

---

## Best Practices

1. **Always call `init()`** before any calculations
2. **Call `close()`** when done to free WASM memory
3. **Use TypeScript enums** instead of magic numbers
4. **Cache Julian day calculations** if using the same date multiple times
5. **Choose the right ephemeris:**
   - Use Moshier (default) for offline, small bundle size, sub-arcsecond accuracy
   - Load Swiss Ephemeris for maximum precision or asteroid calculations
6. **Combine calculation flags** with bitwise OR for efficiency

---

## Complete Example

```typescript
import {
  SwissEphemeris,
  Planet,
  HouseSystem,
  CalculationFlag
} from '@swisseph/browser';

async function calculateBirthChart() {
  // Initialize
  const swe = new SwissEphemeris();
  await swe.init();

  try {
    // Birth data: March 3, 2007, 14:30 UTC, New York
    const jd = swe.julianDay(2007, 3, 3, 14.5);

    // Calculate houses
    const houses = swe.calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);
    console.log(`Ascendant: ${houses.ascendant.toFixed(2)}°`);
    console.log(`MC: ${houses.mc.toFixed(2)}°`);

    // Calculate planetary positions (using Moshier)
    const planets = [
      Planet.Sun, Planet.Moon, Planet.Mercury,
      Planet.Venus, Planet.Mars, Planet.Jupiter,
      Planet.Saturn, Planet.Uranus, Planet.Neptune
    ];

    for (const planet of planets) {
      const pos = swe.calculatePosition(jd, planet);
      const name = swe.getCelestialBodyName(planet);
      console.log(`${name}: ${pos.longitude.toFixed(2)}° (${pos.longitudeSpeed.toFixed(4)}°/day)`);
    }

    // Optional: Load Swiss Ephemeris for maximum precision
    await swe.loadStandardEphemeris();
    const sunPrecise = swe.calculatePosition(
      jd,
      Planet.Sun,
      CalculationFlag.SwissEphemeris | CalculationFlag.Speed
    );
    console.log(`Sun (precise): ${sunPrecise.longitude}°`);

  } catch (error) {
    console.error('Calculation error:', error);
  } finally {
    // Clean up
    swe.close();
  }
}

calculateBirthChart();
```

---

## Ephemeris Comparison

| Feature | Moshier (Default) | Swiss Ephemeris (Optional) |
|---------|-------------------|----------------------------|
| **Setup** | Built-in, no loading needed | Requires `loadStandardEphemeris()` |
| **Bundle size** | ~250KB gzipped | +2MB download |
| **Accuracy** | Sub-arcsecond | JPL-level precision |
| **Planets** | All major planets | All major planets |
| **Asteroids** | No | Yes (Chiron, Ceres, etc.) |
| **Offline** | Yes | After initial download |
| **Date range** | 3000 BC - 3000 AD | 13201 BC - 17191 AD |

---

## See Also

- [Getting Started Guide](../getting-started.md)
- [@swisseph/node API](./node.md)
- [@swisseph/core API](./core.md)
- [Birth Charts Guide](../guides/birth-charts.md)
