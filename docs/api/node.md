# @swisseph/node API Reference

Complete API reference for the Node.js package.

## Installation

```bash
npm install @swisseph/node
```

## Import

```typescript
import {
  // Date conversions
  julianDay,
  julianDayToDate,

  // Calculations
  calculatePosition,
  calculateHouses,
  findNextLunarEclipse,
  findNextSolarEclipse,

  // Utilities
  getCelestialBodyName,
  setEphemerisPath,
  close,

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
} from '@swisseph/node';
```

---

## Date Conversions

### julianDay()

Convert calendar date to Julian day number.

```typescript
function julianDay(
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
const jd = julianDay(2007, 3, 3);
console.log(jd); // 2454162.5

const jdWithTime = julianDay(2007, 3, 3, 14.5); // 14:30 UTC
console.log(jdWithTime); // 2454163.104166667
```

### julianDayToDate()

Convert Julian day number to calendar date.

```typescript
function julianDayToDate(
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
const date = julianDayToDate(2454162.5);
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
function calculatePosition(
  julianDay: number,
  body: CelestialBody,
  flags?: CalculationFlagInput
): PlanetaryPosition
```

**Parameters:**
- `julianDay` - Julian day number in Universal Time
- `body` - Celestial body (use `Planet`, `Asteroid`, or `LunarPoint` enums)
- `flags` - Calculation flags, default: `CalculationFlag.SwissEphemeris | CalculationFlag.Speed`

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
const sun = calculatePosition(jd, Planet.Sun);
console.log(`Sun longitude: ${sun.longitude}°`);
console.log(`Sun latitude: ${sun.latitude}°`);
console.log(`Sun distance: ${sun.distance} AU`);
console.log(`Sun speed: ${sun.longitudeSpeed}°/day`);

// With specific flags
const moon = calculatePosition(
  jd,
  Planet.Moon,
  CalculationFlag.SwissEphemeris | CalculationFlag.Speed | CalculationFlag.Equatorial
);
```

**Supported bodies:**

Planets:
- `Planet.Sun`, `Planet.Moon`, `Planet.Mercury`, `Planet.Venus`, `Planet.Mars`
- `Planet.Jupiter`, `Planet.Saturn`, `Planet.Uranus`, `Planet.Neptune`, `Planet.Pluto`

Asteroids (requires asteroid ephemeris files):
- `Asteroid.Chiron`, `Asteroid.Pholus`, `Asteroid.Ceres`
- `Asteroid.Pallas`, `Asteroid.Juno`, `Asteroid.Vesta`

Lunar points:
- `LunarPoint.MeanNode`, `LunarPoint.TrueNode`
- `LunarPoint.MeanApogee` (Black Moon Lilith), `LunarPoint.OscuApogee`

---

## House Calculations

### calculateHouses()

Calculate house cusps and angles.

```typescript
function calculateHouses(
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
// New York coordinates
const houses = calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);

console.log(`Ascendant: ${houses.ascendant}°`);
console.log(`MC: ${houses.mc}°`);

for (let i = 1; i <= 12; i++) {
  console.log(`House ${i}: ${houses.cusps[i]}°`);
}
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
function findNextLunarEclipse(
  startJulianDay: number,
  flags?: CalculationFlagInput,
  eclipseType?: EclipseTypeFlagInput,
  backward?: boolean
): LunarEclipse
```

**Parameters:**
- `startJulianDay` - Julian day to start search from
- `flags` - Calculation flags, default: `CalculationFlag.SwissEphemeris`
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
const jd = julianDay(2025, 1, 1);
const eclipse = findNextLunarEclipse(jd);

const eclipseDate = julianDayToDate(eclipse.maximum);
console.log(`Next lunar eclipse: ${eclipseDate.toString()}`);
console.log(`Is total: ${eclipse.isTotal()}`);
console.log(`Totality duration: ${eclipse.getTotalityDuration()} hours`);
console.log(`Partial duration: ${eclipse.getPartialDuration()} hours`);

// Find previous eclipse
const prevEclipse = findNextLunarEclipse(jd, undefined, 0, true);
```

### findNextSolarEclipse()

Find the next solar eclipse visible anywhere on Earth.

```typescript
function findNextSolarEclipse(
  startJulianDay: number,
  flags?: CalculationFlagInput,
  eclipseType?: EclipseTypeFlagInput,
  backward?: boolean
): SolarEclipse
```

**Parameters:**
- `startJulianDay` - Julian day to start search from
- `flags` - Calculation flags, default: `CalculationFlag.SwissEphemeris`
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
const jd = julianDay(2025, 1, 1);
const eclipse = findNextSolarEclipse(jd);

const eclipseDate = julianDayToDate(eclipse.maximum);
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
function getCelestialBodyName(body: CelestialBody): string
```

**Parameters:**
- `body` - Celestial body identifier

**Returns:** Name as string

**Example:**
```typescript
const name = getCelestialBodyName(Planet.Mars);
console.log(name); // "Mars"

const sunName = getCelestialBodyName(Planet.Sun);
console.log(sunName); // "Sun"
```

### setEphemerisPath()

Set directory path for custom ephemeris files.

```typescript
function setEphemerisPath(path?: string | null): void
```

**Parameters:**
- `path` - Directory path containing ephemeris files, or `null`/`undefined` to use bundled files

**Example:**
```typescript
// Use custom ephemeris files
setEphemerisPath('/path/to/custom/ephemeris');

// Revert to bundled files
setEphemerisPath(null);
```

**Note:** By default, bundled ephemeris files are auto-loaded. Only use this if you need custom files.

### close()

Close Swiss Ephemeris and free resources.

```typescript
function close(): void
```

**Example:**
```typescript
// After all calculations are done
close();
```

**Note:** Always call this when done to free allocated resources.

---

## Enums

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
  MoshierEphemeris = 4,    // Use Moshier ephemeris
  Speed = 256,             // Calculate speed (velocity)
  Equatorial = 2048,       // Equatorial coordinates
  Heliocentric = 8,        // Heliocentric positions
  TruePositions = 16,      // True/geometric positions (not apparent)
  // ... and more
}
```

Flags can be combined with bitwise OR:
```typescript
const flags = CalculationFlag.SwissEphemeris | CalculationFlag.Speed | CalculationFlag.Equatorial;
```

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

Functions throw errors when calculations fail. Always use try-catch:

```typescript
try {
  const position = calculatePosition(jd, Planet.Sun);
  console.log(position);
} catch (error) {
  console.error('Calculation failed:', error);
}
```

---

## Best Practices

1. **Always call `close()`** when done to free resources
2. **Use TypeScript enums** instead of magic numbers
3. **Cache Julian day calculations** if using the same date multiple times
4. **Use bundled ephemeris files** (default) unless you have specific needs
5. **Combine calculation flags** with bitwise OR for efficiency

---

## See Also

- [Getting Started Guide](../getting-started.md)
- [@swisseph/browser API](./browser.md)
- [@swisseph/core API](./core.md)
- [Birth Charts Guide](../guides/birth-charts.md)
