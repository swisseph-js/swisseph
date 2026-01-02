# House Systems Guide

This guide explains astrological house systems and how to use them with Swiss Ephemeris JS.

## What are Astrological Houses?

Astrological houses divide the sky into 12 sections based on the observer's location and time. Different house systems use different mathematical methods to calculate these divisions.

## Available House Systems

Swiss Ephemeris supports 14+ house systems:

### Most Common Systems

#### Placidus (HouseSystem.Placidus)
- **Most widely used** in modern Western astrology
- Based on time divisions
- Unequal house sizes
- Problems near polar circles (houses can be very large or small)

```typescript
import { calculateHouses, HouseSystem } from '@swisseph/node';

const houses = calculateHouses(jd, latitude, longitude, HouseSystem.Placidus);
```

#### Koch (HouseSystem.Koch)
- Popular in Europe
- Based on birthplace meridian divisions
- Unequal house sizes
- Also problematic near poles

```typescript
const houses = calculateHouses(jd, lat, lon, HouseSystem.Koch);
```

#### Whole Sign (HouseSystem.WholeSign)
- **Ancient system**, regaining popularity
- Each house = one zodiac sign (30°)
- Always equal house sizes
- Simple and works everywhere
- Ascendant always in 1st house but not necessarily at cusp

```typescript
const houses = calculateHouses(jd, lat, lon, HouseSystem.WholeSign);
```

#### Equal (HouseSystem.Equal)
- Equal 30° houses starting from Ascendant
- Works at all latitudes
- Ascendant = 1st house cusp exactly
- MC may not be at 10th house cusp

```typescript
const houses = calculateHouses(jd, lat, lon, HouseSystem.Equal);
```

### Other Systems

#### Campanus (HouseSystem.Campanus)
- Based on prime vertical divisions
- Unequal houses
- Works well at high latitudes

```typescript
const houses = calculateHouses(jd, lat, lon, HouseSystem.Campanus);
```

#### Regiomontanus (HouseSystem.Regiomontanus)
- Medieval system
- Based on celestial equator divisions
- Unequal houses

```typescript
const houses = calculateHouses(jd, lat, lon, HouseSystem.Regiomontanus);
```

#### Porphyrius (HouseSystem.Porphyrius)
- Simple space-based system
- Divides quadrants equally
- Unequal houses

```typescript
const houses = calculateHouses(jd, lat, lon, HouseSystem.Porphyrius);
```

#### Meridian/Axial Rotation (HouseSystem.Meridian)
- Based on Earth's rotation
- Equal houses in time

```typescript
const houses = calculateHouses(jd, lat, lon, HouseSystem.Meridian);
```

#### Alcabitus (HouseSystem.Alcabitus)
- Medieval Arabic system
- Based on ecliptic divisions

```typescript
const houses = calculateHouses(jd, lat, lon, HouseSystem.Alcabitus);
```

#### Morinus (HouseSystem.Morinus)
- Based on celestial equator
- Equal 30° houses
- Works everywhere

```typescript
const houses = calculateHouses(jd, lat, lon, HouseSystem.Morinus);
```

#### Vehlow Equal (HouseSystem.VehlowEqual)
- Equal houses with Ascendant in middle of 1st house
- Not at cusp

```typescript
const houses = calculateHouses(jd, lat, lon, HouseSystem.VehlowEqual);
```

#### Azimuthal/Horizontal (HouseSystem.Azimuthal)
- Based on horizon system
- Specialized use

```typescript
const houses = calculateHouses(jd, lat, lon, HouseSystem.Azimuthal);
```

#### Polich/Page Topocentric (HouseSystem.PolichPage)
- Modern time-based system
- Similar to Placidus

```typescript
const houses = calculateHouses(jd, lat, lon, HouseSystem.PolichPage);
```

## Comparing House Systems

```typescript
import {
  julianDay,
  calculateHouses,
  HouseSystem
} from '@swisseph/node';

function compareHouseSystems(
  year: number,
  month: number,
  day: number,
  hour: number,
  latitude: number,
  longitude: number
) {
  const jd = julianDay(year, month, day, hour);

  const systems = [
    { name: 'Placidus', system: HouseSystem.Placidus },
    { name: 'Koch', system: HouseSystem.Koch },
    { name: 'Whole Sign', system: HouseSystem.WholeSign },
    { name: 'Equal', system: HouseSystem.Equal },
    { name: 'Campanus', system: HouseSystem.Campanus },
    { name: 'Regiomontanus', system: HouseSystem.Regiomontanus }
  ];

  console.log(`Comparison for: ${latitude}°, ${longitude}°\n`);

  systems.forEach(({ name, system }) => {
    const houses = calculateHouses(jd, latitude, longitude, system);

    console.log(`\n=== ${name} ===`);
    console.log(`Ascendant: ${formatDegrees(houses.ascendant)}`);
    console.log(`MC:        ${formatDegrees(houses.mc)}`);

    console.log('\nHouse Cusps:');
    for (let i = 1; i <= 12; i++) {
      console.log(`  ${i.toString().padStart(2)}: ${formatDegrees(houses.cusps[i])}`);
    }
  });
}

function formatDegrees(deg: number): string {
  const signs = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir',
                 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
  const normalized = ((deg % 360) + 360) % 360;
  const sign = Math.floor(normalized / 30);
  const degree = normalized % 30;

  return `${Math.floor(degree).toString().padStart(2)}° ${signs[sign]}`;
}

// Compare systems for New York
compareHouseSystems(2007, 3, 3, 14.5, 40.7128, -74.0060);
```

## Understanding HouseData

The `calculateHouses()` function returns a `HouseData` object:

```typescript
interface HouseData {
  cusps: number[];          // House cusps [0-12], index 0 unused
  ascendant: number;        // Ascendant (rising sign)
  mc: number;               // Medium Coeli (Midheaven)
  armc: number;             // Sidereal time
  vertex: number;           // Vertex
  equatorialAscendant: number;
  coAscendant1: number;     // Koch co-ascendant
  coAscendant2: number;     // Munkasey co-ascendant
  polarAscendant: number;   // Munkasey polar ascendant
  houseSystem: HouseSystem; // System used
}
```

### Using House Data

```typescript
const houses = calculateHouses(jd, lat, lon, HouseSystem.Placidus);

// Get Ascendant
console.log(`Ascendant: ${houses.ascendant}°`);

// Get MC (10th house cusp in most systems)
console.log(`MC: ${houses.mc}°`);

// Get house cusps (1-12)
for (let i = 1; i <= 12; i++) {
  console.log(`House ${i}: ${houses.cusps[i]}°`);
}

// Get Vertex (important point in relationship astrology)
console.log(`Vertex: ${houses.vertex}°`);

// Get Descendant (opposite of Ascendant)
const descendant = (houses.ascendant + 180) % 360;
console.log(`Descendant: ${descendant}°`);

// Get IC (opposite of MC)
const ic = (houses.mc + 180) % 360;
console.log(`IC: ${ic}°`);
```

## Determining Which House a Planet is In

```typescript
import { calculatePosition, Planet } from '@swisseph/node';

function getPlanetHouse(
  planetLongitude: number,
  houses: HouseData
): number {
  // Normalize longitude to 0-360
  const lon = ((planetLongitude % 360) + 360) % 360;

  // Check each house
  for (let i = 1; i <= 12; i++) {
    const thisHouse = houses.cusps[i];
    const nextHouse = i === 12 ? houses.cusps[1] : houses.cusps[i + 1];

    // Handle wraparound at 0°
    if (nextHouse < thisHouse) {
      if (lon >= thisHouse || lon < nextHouse) {
        return i;
      }
    } else {
      if (lon >= thisHouse && lon < nextHouse) {
        return i;
      }
    }
  }

  return 1; // Fallback
}

// Example usage
const jd = julianDay(2007, 3, 3, 14.5);
const houses = calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);
const sun = calculatePosition(jd, Planet.Sun);

const sunHouse = getPlanetHouse(sun.longitude, houses);
console.log(`Sun is in house ${sunHouse}`);
```

## High Latitude Considerations

Some house systems (Placidus, Koch) have problems near polar circles:

```typescript
function checkHighLatitude(latitude: number, system: HouseSystem): boolean {
  // Placidus and Koch problematic above ~66° latitude
  if (
    (system === HouseSystem.Placidus || system === HouseSystem.Koch) &&
    Math.abs(latitude) > 66
  ) {
    console.warn(
      `Warning: ${system} houses may be unreliable at ${latitude}° latitude. ` +
      `Consider using Equal, Whole Sign, or Campanus instead.`
    );
    return true;
  }
  return false;
}

// Example
function safeCalculateHouses(
  jd: number,
  lat: number,
  lon: number,
  preferredSystem: HouseSystem
): HouseData {
  let system = preferredSystem;

  // Switch to safer system at high latitudes
  if (checkHighLatitude(lat, preferredSystem)) {
    system = HouseSystem.Equal;
    console.log(`Using ${system} instead for reliability`);
  }

  return calculateHouses(jd, lat, lon, system);
}
```

## Choosing a House System

### For General Use
- **Placidus** - Most popular, industry standard
- **Whole Sign** - Traditional, gaining popularity, works everywhere

### For High Latitudes (> 60°)
- **Equal** - Always works, simple
- **Whole Sign** - Traditional, reliable
- **Campanus** - Works well at high latitudes

### For Research
Compare multiple systems to see if results hold across systems.

### Example: Auto-Select System

```typescript
function autoSelectHouseSystem(latitude: number): HouseSystem {
  if (Math.abs(latitude) > 66) {
    // High latitude: use Whole Sign
    return HouseSystem.WholeSign;
  } else if (Math.abs(latitude) > 60) {
    // Moderate high latitude: use Equal
    return HouseSystem.Equal;
  } else {
    // Normal latitude: use Placidus
    return HouseSystem.Placidus;
  }
}

// Usage
const system = autoSelectHouseSystem(latitude);
const houses = calculateHouses(jd, latitude, longitude, system);
console.log(`Using ${houses.houseSystem} house system`);
```

## House Cusps vs House Positions

### House Cusps
- The **starting point** of each house
- Returned in `houses.cusps[]` array

### House Position
- **Where a planet falls** within the houses
- Calculated by comparing planet longitude to house cusps

```typescript
function analyzePlanetInHouse(
  planetName: string,
  planetLongitude: number,
  houses: HouseData
) {
  const house = getPlanetHouse(planetLongitude, houses);
  const cuspOfHouse = houses.cusps[house];

  // How far into the house (0-30°, approximately)
  let distanceFromCusp = planetLongitude - cuspOfHouse;
  if (distanceFromCusp < 0) distanceFromCusp += 360;

  console.log(`${planetName}:`);
  console.log(`  In house ${house}`);
  console.log(`  House cusp: ${formatDegrees(cuspOfHouse)}`);
  console.log(`  Planet: ${formatDegrees(planetLongitude)}`);
  console.log(`  Distance from cusp: ${distanceFromCusp.toFixed(2)}°`);
}
```

## The Four Angles

The four most important points in a chart:

```typescript
function getAngles(houses: HouseData) {
  return {
    ascendant: houses.ascendant,
    descendant: (houses.ascendant + 180) % 360,
    mc: houses.mc,
    ic: (houses.mc + 180) % 360
  };
}

function formatAngles(houses: HouseData) {
  const angles = getAngles(houses);

  console.log('=== The Four Angles ===');
  console.log(`Ascendant (ASC/1st):  ${formatDegrees(angles.ascendant)}`);
  console.log(`Descendant (DSC/7th): ${formatDegrees(angles.descendant)}`);
  console.log(`MC (Medium Coeli/10th): ${formatDegrees(angles.mc)}`);
  console.log(`IC (Imum Coeli/4th):    ${formatDegrees(angles.ic)}`);
}
```

## Angular Houses

Planets in angular houses (1, 4, 7, 10) are considered more prominent:

```typescript
function isAngular(house: number): boolean {
  return [1, 4, 7, 10].includes(house);
}

function analyzeAngularPlanets(positions: any[], houses: HouseData) {
  console.log('=== Angular Planets ===');

  positions.forEach(({ name, longitude }) => {
    const house = getPlanetHouse(longitude, houses);
    if (isAngular(house)) {
      console.log(`${name} in house ${house} (Angular)`);
    }
  });
}
```

## Complete Example: Multi-System Analysis

```typescript
import {
  julianDay,
  calculatePosition,
  calculateHouses,
  Planet,
  HouseSystem
} from '@swisseph/node';

function multiSystemAnalysis(
  year: number,
  month: number,
  day: number,
  hour: number,
  lat: number,
  lon: number
) {
  const jd = julianDay(year, month, day, hour);
  const sun = calculatePosition(jd, Planet.Sun);

  const systems = [
    HouseSystem.Placidus,
    HouseSystem.WholeSign,
    HouseSystem.Equal,
    HouseSystem.Koch
  ];

  console.log(`Sun at ${formatDegrees(sun.longitude)}\n`);

  systems.forEach(system => {
    const houses = calculateHouses(jd, lat, lon, system);
    const house = getPlanetHouse(sun.longitude, houses);

    console.log(`${system} Houses:`);
    console.log(`  Ascendant: ${formatDegrees(houses.ascendant)}`);
    console.log(`  Sun in house: ${house}`);
    console.log(`  House ${house} cusp: ${formatDegrees(houses.cusps[house])}\n`);
  });
}

multiSystemAnalysis(2007, 3, 3, 14.5, 40.7128, -74.0060);
```

## Best Practices

1. **Choose one system** and stick with it for consistency
2. **Document your choice** - Always specify which system you use
3. **Consider latitude** - Some systems don't work well at extreme latitudes
4. **Understand differences** - Know how systems differ before interpreting
5. **Use Whole Sign or Equal** at high latitudes for reliability

## See Also

- [Birth Charts Guide](./birth-charts.md)
- [@swisseph/node API Reference](../api/node.md)
- [@swisseph/core API Reference](../api/core.md)
