# @swisseph/core API Reference

Complete type reference for the core package. This package contains shared TypeScript types, interfaces, enums, and utilities used by both `@swisseph/node` and `@swisseph/browser`.

## Installation

```bash
npm install @swisseph/core
```

Typically, you don't install this package directly. It's automatically installed as a dependency when you install `@swisseph/node` or `@swisseph/browser`.

## Import

```typescript
import {
  // Enums
  CalendarType,
  Planet,
  LunarPoint,
  Asteroid,
  FictitiousPlanet,
  HouseSystem,
  CalculationFlag,
  EclipseType,

  // Result Interfaces
  PlanetaryPosition,
  RectangularCoordinates,
  DateTime,
  ExtendedDateTime,
  HouseData,
  LunarEclipse,
  SolarEclipse,

  // Implementation Classes
  LunarEclipseImpl,
  SolarEclipseImpl,
  DateTimeImpl,

  // Flag Builders
  CalculationFlags,
  EclipseTypeFlags,

  // Utilities
  normalizeFlags,
  normalizeEclipseTypes,

  // Type Unions
  CelestialBody,
  CalculationFlagInput,
  EclipseTypeFlagInput
} from '@swisseph/core';
```

---

## Enums

### CalendarType

Calendar system type for date conversions.

```typescript
enum CalendarType {
  Julian = 0,      // Julian calendar
  Gregorian = 1    // Gregorian calendar (default for modern dates)
}
```

**Usage:**
```typescript
import { julianDay, CalendarType } from '@swisseph/node';

const jd = julianDay(1582, 10, 4, 0, CalendarType.Julian);
```

---

### Planet

Major planets and luminaries.

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
  Pluto = 9,
  Earth = 14,              // For heliocentric calculations
  EclipticNutation = -1,   // Ecliptic and nutation
  FixedStar = -10          // Fixed star (special value)
}
```

**Usage:**
```typescript
import { calculatePosition, Planet } from '@swisseph/node';

const sun = calculatePosition(jd, Planet.Sun);
const moon = calculatePosition(jd, Planet.Moon);
const mars = calculatePosition(jd, Planet.Mars);
```

---

### LunarPoint

Lunar and solar nodes and apogees.

```typescript
enum LunarPoint {
  MeanNode = 10,              // Mean lunar node (North Node)
  TrueNode = 11,              // True lunar node (osculating)
  MeanApogee = 12,            // Mean lunar apogee (Black Moon Lilith)
  OsculatingApogee = 13,      // Osculating lunar apogee
  InterpolatedApogee = 21,    // Interpolated lunar apogee
  InterpolatedPerigee = 22    // Interpolated lunar perigee
}
```

**Usage:**
```typescript
import { calculatePosition, LunarPoint } from '@swisseph/node';

const northNode = calculatePosition(jd, LunarPoint.MeanNode);
const lilith = calculatePosition(jd, LunarPoint.MeanApogee);
```

---

### Asteroid

Main belt asteroids.

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

**Note:** Asteroids require Swiss Ephemeris files. In Node.js, these are bundled. In browser, call `loadStandardEphemeris()` first.

**Usage:**
```typescript
import { calculatePosition, Asteroid, CalculationFlag } from '@swisseph/node';

const chiron = calculatePosition(jd, Asteroid.Chiron, CalculationFlag.SwissEphemeris);
const ceres = calculatePosition(jd, Asteroid.Ceres, CalculationFlag.SwissEphemeris);
```

---

### FictitiousPlanet

Fictitious planets used in Uranian astrology and other systems.

```typescript
enum FictitiousPlanet {
  // Uranian planets
  Cupido = 40,
  Hades = 41,
  Zeus = 42,
  Kronos = 43,
  Apollon = 44,
  Admetos = 45,
  Vulkanus = 46,
  Poseidon = 47,

  // Other hypothetical bodies
  Isis = 48,                 // Transatlantic
  Nibiru = 49,               // Hypothetical
  Harrington = 50,           // Hypothetical
  NeptuneLeverrier = 51,     // Neptune according to Leverrier
  NeptuneAdams = 52,         // Neptune according to Adams
  PlutoLowell = 53,          // Pluto according to Lowell
  PlutoPickering = 54,       // Pluto according to Pickering
  Vulcan = 55,               // Hypothetical planet inside Mercury's orbit
  WhiteMoon = 56,            // Selena
  Proserpina = 57,
  Waldemath = 58             // Hypothetical second moon
}
```

---

### CelestialBody (Type Union)

Union type for all celestial bodies that can be calculated.

```typescript
type CelestialBody = Planet | LunarPoint | Asteroid | FictitiousPlanet | number;
```

**Usage:**
```typescript
function calculateMultiple(jd: number, bodies: CelestialBody[]) {
  return bodies.map(body => calculatePosition(jd, body));
}

const positions = calculateMultiple(jd, [
  Planet.Sun,
  Planet.Moon,
  LunarPoint.MeanNode,
  Asteroid.Chiron
]);
```

---

### HouseSystem

Astrological house systems.

```typescript
enum HouseSystem {
  Placidus = 'P',          // Most common in modern Western astrology
  Koch = 'K',
  Porphyrius = 'O',
  Regiomontanus = 'R',
  Campanus = 'C',
  Equal = 'A',             // Equal houses from Ascendant
  VehlowEqual = 'V',       // Vehlow Equal
  WholeSign = 'W',         // Whole Sign houses
  Meridian = 'X',          // Axial rotation / Meridian
  Azimuthal = 'H',         // Azimuthal / Horizontal
  PolichPage = 'T',        // Polich/Page ("topocentric")
  Alcabitus = 'B',
  Morinus = 'M'
}
```

**Usage:**
```typescript
import { calculateHouses, HouseSystem } from '@swisseph/node';

const placidus = calculateHouses(jd, lat, lon, HouseSystem.Placidus);
const wholeSign = calculateHouses(jd, lat, lon, HouseSystem.WholeSign);
const equal = calculateHouses(jd, lat, lon, HouseSystem.Equal);
```

---

### HousePoint

House cusps and significant points (indices into the ASCMC array).

```typescript
enum HousePoint {
  Ascendant = 0,
  MC = 1,                    // Medium Coeli / Midheaven
  ARMC = 2,                  // Sidereal time
  Vertex = 3,
  EquatorialAscendant = 4,
  CoAscendant1 = 5,          // Koch
  CoAscendant2 = 6,          // Munkasey
  PolarAscendant = 7
}
```

---

### CalculationFlag

Calculation flags (bitwise). Combine using bitwise OR (`|`) operator.

```typescript
enum CalculationFlag {
  JPLEphemeris = 1,                    // Use JPL ephemeris files
  SwissEphemeris = 2,                  // Use Swiss Ephemeris files
  MoshierEphemeris = 4,                // Use Moshier ephemeris (analytical, no files)
  Heliocentric = 8,                    // Heliocentric positions
  TruePositions = 16,                  // True/geometric positions (no light-time)
  J2000 = 32,                          // J2000 coordinates
  NoNutation = 64,                     // No nutation
  Speed3 = 128,                        // High-precision speed (uses 3 positions)
  Speed = 256,                         // Calculate speed
  NoGravitationalDeflection = 512,     // No gravitational deflection
  NoAberration = 1024,                 // No aberration
  Equatorial = 2048,                   // Equatorial coordinates (RA/Dec)
  XYZ = 4096,                          // Rectangular coordinates (X/Y/Z)
  Radians = 8192,                      // Radians instead of degrees
  Barycentric = 16384,                 // Barycentric positions
  Topocentric = 32768,                 // Topocentric positions
  Sidereal = 65536,                    // Sidereal positions
  ICRS = 131072,                       // ICRS reference frame
  DpsidepsIAU1980 = 262144,            // Nutation according to IAU 1980
  JPLHorizons = 524288,                // JPL Horizons mode
  JPLHorizonsApprox = 1048576          // JPL Horizons approximation mode
}
```

**Usage:**
```typescript
import { calculatePosition, Planet, CalculationFlag } from '@swisseph/node';

// Combine flags with bitwise OR
const flags = CalculationFlag.SwissEphemeris | CalculationFlag.Speed | CalculationFlag.Equatorial;
const position = calculatePosition(jd, Planet.Sun, flags);
```

**Common combinations:**

```typescript
// Defined in the library
const CommonCalculationFlags = {
  Astrometric: CalculationFlag.NoAberration | CalculationFlag.NoGravitationalDeflection,
  DefaultSwissEphemeris: CalculationFlag.SwissEphemeris | CalculationFlag.Speed,
  DefaultMoshier: CalculationFlag.MoshierEphemeris | CalculationFlag.Speed
};
```

---

### EclipseType

Eclipse type flags (bitwise). Combine using bitwise OR (`|`) operator.

```typescript
enum EclipseType {
  Central = 1,         // Central eclipse (path crosses Earth)
  NonCentral = 2,      // Non-central eclipse
  Total = 4,           // Total eclipse
  Annular = 8,         // Annular eclipse
  Partial = 16,        // Partial eclipse
  AnnularTotal = 32,   // Annular-total (hybrid) eclipse
  Penumbral = 64       // Penumbral lunar eclipse
}
```

**Common combinations:**

```typescript
const CommonEclipseTypes = {
  AllSolar: EclipseType.Central | EclipseType.NonCentral | EclipseType.Total |
            EclipseType.Annular | EclipseType.Partial | EclipseType.AnnularTotal,
  AllLunar: EclipseType.Total | EclipseType.Partial | EclipseType.Penumbral
};
```

---

## Result Interfaces

### PlanetaryPosition

Result from `calculatePosition()`. Replaces the old tuple return from `calc_ut()`.

```typescript
interface PlanetaryPosition {
  longitude: number;         // Ecliptic longitude in degrees (or X if XYZ flag)
  latitude: number;          // Ecliptic latitude in degrees (or Y if XYZ flag)
  distance: number;          // Distance in AU (or Z if XYZ flag)
  longitudeSpeed: number;    // Longitude speed in degrees/day (or X speed)
  latitudeSpeed: number;     // Latitude speed in degrees/day (or Y speed)
  distanceSpeed: number;     // Distance speed in AU/day (or Z speed)
  flags: number;             // Return flags indicating calculation method used
}
```

**Example:**
```typescript
const sun = calculatePosition(jd, Planet.Sun);
console.log(`Sun longitude: ${sun.longitude}°`);
console.log(`Sun latitude: ${sun.latitude}°`);
console.log(`Sun distance: ${sun.distance} AU`);
console.log(`Sun speed: ${sun.longitudeSpeed}°/day`);
```

---

### RectangularCoordinates

Alternative interface for rectangular coordinates (when using `CalculationFlag.XYZ`).

```typescript
interface RectangularCoordinates {
  x: number;           // X coordinate
  y: number;           // Y coordinate
  z: number;           // Z coordinate
  xSpeed: number;      // X coordinate speed
  ySpeed: number;      // Y coordinate speed
  zSpeed: number;      // Z coordinate speed
  flags: number;       // Return flags
}
```

**Note:** Same data as `PlanetaryPosition` but with semantically appropriate names.

---

### DateTime

Date/time representation. Replaces the old tuple return from `revjul()`.

```typescript
interface DateTime {
  year: number;              // Year (negative for BCE/BC)
  month: number;             // Month (1-12)
  day: number;               // Day of month (1-31)
  hour: number;              // Hour as decimal (0.0-23.999...)
  calendarType?: CalendarType;  // Calendar type used
}
```

**Example:**
```typescript
const date = julianDayToDate(2454162.5);
console.log(`${date.year}-${date.month}-${date.day}`);  // 2007-3-3
console.log(`Hour: ${date.hour}`);  // 0.0
```

---

### ExtendedDateTime

Extended date/time with convenience methods.

```typescript
interface ExtendedDateTime extends DateTime {
  toISOString(): string;     // Convert to ISO 8601 string
  toString(): string;        // Convert to formatted string
}
```

**Implementation:** `DateTimeImpl` class

**Example:**
```typescript
const date = julianDayToDate(jd);  // Returns DateTimeImpl instance
console.log(date.toString());
// Output: "2007-03-03 0.000000 hours (Gregorian)"

console.log(date.toISOString());
// Output: "2007-03-03T00:00:00.000Z"
```

---

### HouseData

House calculation result. Replaces the old tuple return from `houses()`.

```typescript
interface HouseData {
  cusps: number[];          // House cusps (indices 1-12 for houses, 0 may be unused)
  ascendant: number;        // Ascendant in degrees
  mc: number;               // MC (Medium Coeli / Midheaven) in degrees
  armc: number;             // ARMC (sidereal time) in degrees
  vertex: number;           // Vertex in degrees
  equatorialAscendant: number;    // Equatorial Ascendant in degrees
  coAscendant1: number;     // Co-Ascendant 1 (Koch) in degrees
  coAscendant2: number;     // Co-Ascendant 2 (Munkasey) in degrees
  polarAscendant: number;   // Polar Ascendant in degrees
  houseSystem: HouseSystem; // House system used
}
```

**Example:**
```typescript
const houses = calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);
console.log(`Ascendant: ${houses.ascendant}°`);
console.log(`MC: ${houses.mc}°`);

for (let i = 1; i <= 12; i++) {
  console.log(`House ${i}: ${houses.cusps[i]}°`);
}
```

---

### LunarEclipse

Lunar eclipse event details. Replaces the old tuple return from `lun_eclipse_when()`.

```typescript
interface LunarEclipse {
  type: number;              // Eclipse type flags (bitwise combination)
  maximum: number;           // Time of maximum eclipse (Julian day)
  partialBegin: number;      // Start of partial phase (Julian day)
  partialEnd: number;        // End of partial phase (Julian day)
  totalBegin: number;        // Start of total phase (Julian day), 0 if not total
  totalEnd: number;          // End of total phase (Julian day), 0 if not total
  penumbralBegin: number;    // Start of penumbral phase (Julian day)
  penumbralEnd: number;      // End of penumbral phase (Julian day)

  // Convenience methods
  isTotal(): boolean;
  isPartial(): boolean;
  isPenumbralOnly(): boolean;
  getTotalityDuration(): number;    // Hours
  getPartialDuration(): number;     // Hours
  getTotalDuration(): number;       // Hours (entire eclipse)
}
```

**Implementation:** `LunarEclipseImpl` class

**Example:**
```typescript
const eclipse = findNextLunarEclipse(jd);

if (eclipse.isTotal()) {
  console.log(`Total lunar eclipse on ${julianDayToDate(eclipse.maximum)}`);
  console.log(`Totality lasts ${eclipse.getTotalityDuration().toFixed(2)} hours`);
} else if (eclipse.isPartial()) {
  console.log(`Partial lunar eclipse`);
}
```

---

### SolarEclipse

Solar eclipse event details. Replaces the old tuple return from `sol_eclipse_when_glob()`.

```typescript
interface SolarEclipse {
  type: number;              // Eclipse type flags (bitwise combination)
  maximum: number;           // Time of maximum eclipse (Julian day)
  partialBegin: number;      // Start of partial phase (Julian day)
  partialEnd: number;        // End of partial phase (Julian day)
  centralBegin: number;      // Start of central phase (Julian day), 0 if not central
  centralEnd: number;        // End of central phase (Julian day), 0 if not central
  centerLineBegin: number;   // Center line begins (Julian day), 0 if not central
  centerLineEnd: number;     // Center line ends (Julian day), 0 if not central

  // Convenience methods
  isTotal(): boolean;
  isAnnular(): boolean;
  isHybrid(): boolean;
  isPartial(): boolean;
  isCentral(): boolean;
  isNonCentral(): boolean;
}
```

**Implementation:** `SolarEclipseImpl` class

**Example:**
```typescript
const eclipse = findNextSolarEclipse(jd);

if (eclipse.isTotal()) {
  console.log('Total solar eclipse');
} else if (eclipse.isAnnular()) {
  console.log('Annular solar eclipse');
} else if (eclipse.isHybrid()) {
  console.log('Hybrid (annular-total) solar eclipse');
}

console.log(`Central: ${eclipse.isCentral()}`);
```

---

## Implementation Classes

These classes implement the result interfaces with convenience methods.

### LunarEclipseImpl

```typescript
class LunarEclipseImpl implements LunarEclipse {
  constructor(
    type: number,
    maximum: number,
    partialBegin: number,
    partialEnd: number,
    totalBegin: number,
    totalEnd: number,
    penumbralBegin: number,
    penumbralEnd: number
  );

  isTotal(): boolean;
  isPartial(): boolean;
  isPenumbralOnly(): boolean;
  getTotalityDuration(): number;  // Returns duration in hours
  getPartialDuration(): number;   // Returns duration in hours
  getTotalDuration(): number;     // Returns duration in hours
}
```

### SolarEclipseImpl

```typescript
class SolarEclipseImpl implements SolarEclipse {
  constructor(
    type: number,
    maximum: number,
    partialBegin: number,
    partialEnd: number,
    centralBegin: number,
    centralEnd: number,
    centerLineBegin: number,
    centerLineEnd: number
  );

  isTotal(): boolean;
  isAnnular(): boolean;
  isHybrid(): boolean;
  isPartial(): boolean;
  isCentral(): boolean;
  isNonCentral(): boolean;
}
```

### DateTimeImpl

```typescript
class DateTimeImpl implements ExtendedDateTime {
  constructor(
    year: number,
    month: number,
    day: number,
    hour: number,
    calendarType?: CalendarType
  );

  toISOString(): string;    // ISO 8601 format
  toString(): string;       // Human-readable format
}
```

**Example:**
```typescript
const date = new DateTimeImpl(2007, 3, 3, 14.5, CalendarType.Gregorian);
console.log(date.toString());
// "2007-03-03 14.500000 hours (Gregorian)"

console.log(date.toISOString());
// "2007-03-03T14:30:00.000Z"
```

---

## Flag Builder Utilities

Type-safe builders for combining bitwise flags.

### CalculationFlags

Builder class for calculation flags with method chaining.

```typescript
class CalculationFlags {
  constructor(initialFlags?: CalculationFlag | CalculationFlag[]);

  add(flag: CalculationFlag | CalculationFlag[]): this;
  remove(flag: CalculationFlag | CalculationFlag[]): this;
  has(flag: CalculationFlag): boolean;
  toNumber(): number;

  // Static factory methods
  static from(...flags: CalculationFlag[]): CalculationFlags;

  // Common presets
  static get swissEphemerisWithSpeed(): CalculationFlags;
  static get moshierWithSpeed(): CalculationFlags;
  static get astrometric(): CalculationFlags;
  static get heliocentric(): CalculationFlags;
  static get topocentric(): CalculationFlags;
  static get equatorial(): CalculationFlags;
}
```

**Usage:**
```typescript
import { CalculationFlags, CalculationFlag } from '@swisseph/core';

// Method 1: Builder pattern
const flags = new CalculationFlags()
  .add(CalculationFlag.SwissEphemeris)
  .add(CalculationFlag.Speed)
  .add(CalculationFlag.Equatorial);

// Method 2: Static factory
const flags2 = CalculationFlags.from(
  CalculationFlag.SwissEphemeris,
  CalculationFlag.Speed,
  CalculationFlag.Equatorial
);

// Method 3: Use presets
const flags3 = CalculationFlags.equatorial;

// Use with calculations
const position = calculatePosition(jd, Planet.Sun, flags.toNumber());
```

**Presets:**
- `swissEphemerisWithSpeed` - Swiss Ephemeris with speed calculation
- `moshierWithSpeed` - Moshier with speed calculation
- `astrometric` - No aberration or gravitational deflection
- `heliocentric` - Heliocentric positions
- `topocentric` - Topocentric positions
- `equatorial` - Equatorial coordinates (RA/Dec)

### EclipseTypeFlags

Builder class for eclipse type filters.

```typescript
class EclipseTypeFlags {
  constructor(initialFlags?: EclipseType | EclipseType[]);

  add(flag: EclipseType | EclipseType[]): this;
  has(flag: EclipseType): boolean;
  toNumber(): number;

  // Static factory methods
  static from(...flags: EclipseType[]): EclipseTypeFlags;

  // Common presets
  static get allSolar(): EclipseTypeFlags;
  static get allLunar(): EclipseTypeFlags;
  static get totalOnly(): EclipseTypeFlags;
  static get totalAndPartial(): EclipseTypeFlags;
}
```

**Usage:**
```typescript
import { EclipseTypeFlags, EclipseType } from '@swisseph/core';

// Only find total eclipses
const totalOnly = EclipseTypeFlags.totalOnly;
const eclipse = findNextLunarEclipse(jd, undefined, totalOnly.toNumber());

// Find total or partial (no penumbral)
const filter = EclipseTypeFlags.from(EclipseType.Total, EclipseType.Partial);
const eclipse2 = findNextLunarEclipse(jd, undefined, filter.toNumber());
```

---

## Type Unions and Utilities

### CalculationFlagInput

Type for functions that accept various flag formats.

```typescript
type CalculationFlagInput = number | CalculationFlag | CalculationFlags | CalculationFlag[];
```

**Usage:**
```typescript
// All of these are valid:
calculatePosition(jd, body, CalculationFlag.SwissEphemeris);
calculatePosition(jd, body, CalculationFlag.SwissEphemeris | CalculationFlag.Speed);
calculatePosition(jd, body, CalculationFlags.swissEphemerisWithSpeed);
calculatePosition(jd, body, [CalculationFlag.SwissEphemeris, CalculationFlag.Speed]);
calculatePosition(jd, body, 258);  // Raw number
```

### EclipseTypeFlagInput

Type for eclipse type filter input.

```typescript
type EclipseTypeFlagInput = number | EclipseType | EclipseTypeFlags | EclipseType[];
```

### normalizeFlags()

Normalize calculation flag input to a number.

```typescript
function normalizeFlags(input: CalculationFlagInput): number
```

**Example:**
```typescript
import { normalizeFlags, CalculationFlag } from '@swisseph/core';

const num1 = normalizeFlags(CalculationFlag.SwissEphemeris);  // 2
const num2 = normalizeFlags([CalculationFlag.SwissEphemeris, CalculationFlag.Speed]);  // 258
const num3 = normalizeFlags(CalculationFlags.swissEphemerisWithSpeed);  // 258
```

### normalizeEclipseTypes()

Normalize eclipse type flag input to a number.

```typescript
function normalizeEclipseTypes(input: EclipseTypeFlagInput): number
```

---

## Constants

```typescript
const AsteroidOffset = 10000;              // Offset for asteroid numbers
const PlanetaryMoonOffset = 9000;          // Offset for planetary moons
const NumberOfPlanets = 23;                 // Number of major planets
```

---

## Complete Examples

### Using Enums for Type Safety

```typescript
import {
  julianDay,
  calculatePosition,
  calculateHouses,
  Planet,
  LunarPoint,
  HouseSystem,
  CalculationFlag
} from '@swisseph/node';

const jd = julianDay(2007, 3, 3, 14.5);

// Calculate planetary positions
const sun = calculatePosition(jd, Planet.Sun);
const moon = calculatePosition(jd, Planet.Moon);
const northNode = calculatePosition(jd, LunarPoint.MeanNode);

// Calculate houses
const houses = calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);

// Use combined flags
const flags = CalculationFlag.SwissEphemeris | CalculationFlag.Speed | CalculationFlag.Equatorial;
const marsEq = calculatePosition(jd, Planet.Mars, flags);
```

### Using Flag Builders

```typescript
import { CalculationFlags, CalculationFlag } from '@swisseph/core';
import { calculatePosition, Planet } from '@swisseph/node';

// Build flags programmatically
const flags = new CalculationFlags()
  .add(CalculationFlag.SwissEphemeris)
  .add(CalculationFlag.Speed);

if (needEquatorial) {
  flags.add(CalculationFlag.Equatorial);
}

const position = calculatePosition(jd, Planet.Sun, flags.toNumber());
```

### Working with Eclipse Types

```typescript
import { findNextLunarEclipse } from '@swisseph/node';
import { EclipseTypeFlags, EclipseType } from '@swisseph/core';

const jd = julianDay(2025, 1, 1);

// Only find total or partial eclipses (no penumbral)
const filter = EclipseTypeFlags.from(EclipseType.Total, EclipseType.Partial);
const eclipse = findNextLunarEclipse(jd, undefined, filter.toNumber());

if (eclipse.isTotal()) {
  const date = julianDayToDate(eclipse.maximum);
  console.log(`Total lunar eclipse: ${date.toString()}`);
  console.log(`Duration: ${eclipse.getTotalityDuration().toFixed(2)} hours`);
}
```

---

## See Also

- [@swisseph/node API](./node.md) - Node.js package using these types
- [@swisseph/browser API](./browser.md) - Browser package using these types
- [Getting Started Guide](../getting-started.md)
