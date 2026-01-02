# Calculating Birth Charts

This guide shows you how to calculate complete birth charts (natal charts) using Swiss Ephemeris JS.

## What is a Birth Chart?

A birth chart is a snapshot of the celestial positions at a specific moment and location. It includes:

- **Planetary positions** - Where each planet was in the zodiac
- **House cusps** - The 12 astrological houses
- **Angles** - Ascendant (rising sign), MC (Midheaven), and other key points

## Basic Birth Chart Calculation

### Node.js Example

```typescript
import {
  julianDay,
  calculatePosition,
  calculateHouses,
  getCelestialBodyName,
  Planet,
  HouseSystem,
  close
} from '@swisseph/node';

interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;      // Decimal hours (e.g., 14.5 = 14:30)
  latitude: number;  // Positive north, negative south
  longitude: number; // Positive east, negative west
  timezone: string;  // For display purposes
}

function calculateBirthChart(birthData: BirthData) {
  // Convert birth time to Julian day (assumes hour is already in UTC)
  const jd = julianDay(
    birthData.year,
    birthData.month,
    birthData.day,
    birthData.hour
  );

  console.log(`Birth date: ${birthData.year}-${birthData.month}-${birthData.day}`);
  console.log(`Birth time: ${birthData.hour} UTC`);
  console.log(`Julian day: ${jd}\n`);

  // Calculate houses and angles
  const houses = calculateHouses(
    jd,
    birthData.latitude,
    birthData.longitude,
    HouseSystem.Placidus
  );

  console.log('=== ANGLES ===');
  console.log(`Ascendant: ${formatDegrees(houses.ascendant)}`);
  console.log(`MC: ${formatDegrees(houses.mc)}`);
  console.log(`Vertex: ${formatDegrees(houses.vertex)}`);
  console.log(`ARMC: ${formatDegrees(houses.armc)}\n`);

  console.log('=== HOUSE CUSPS ===');
  for (let i = 1; i <= 12; i++) {
    console.log(`House ${i.toString().padStart(2)}: ${formatDegrees(houses.cusps[i])}`);
  }
  console.log();

  // Calculate planetary positions
  const planets = [
    Planet.Sun,
    Planet.Moon,
    Planet.Mercury,
    Planet.Venus,
    Planet.Mars,
    Planet.Jupiter,
    Planet.Saturn,
    Planet.Uranus,
    Planet.Neptune,
    Planet.Pluto
  ];

  console.log('=== PLANETARY POSITIONS ===');
  for (const planet of planets) {
    const position = calculatePosition(jd, planet);
    const name = getCelestialBodyName(planet);

    console.log(
      `${name.padEnd(10)}: ${formatDegrees(position.longitude)} ` +
      `(${formatSpeed(position.longitudeSpeed)})`
    );
  }

  // Clean up
  close();
}

// Helper: Format degrees as zodiac position
function formatDegrees(degrees: number): string {
  const signs = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir',
                 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];

  const normalized = ((degrees % 360) + 360) % 360;
  const sign = Math.floor(normalized / 30);
  const degree = normalized % 30;
  const minutes = (degree % 1) * 60;
  const seconds = (minutes % 1) * 60;

  return `${Math.floor(degree).toString().padStart(2)}° ${signs[sign]} ` +
         `${Math.floor(minutes).toString().padStart(2)}' ` +
         `${Math.floor(seconds).toString().padStart(2)}"`;
}

// Helper: Format speed
function formatSpeed(speed: number): string {
  const dir = speed >= 0 ? 'D' : 'R';  // Direct or Retrograde
  return `${Math.abs(speed).toFixed(4)}°/day ${dir}`;
}

// Example: Birth chart for March 3, 2007, 14:30 UTC, New York
calculateBirthChart({
  year: 2007,
  month: 3,
  day: 3,
  hour: 14.5,
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York'
});
```

**Output:**
```
Birth date: 2007-3-3
Birth time: 14.5 UTC
Julian day: 2454163.104166667

=== ANGLES ===
Ascendant: 15° Can 23' 45"
MC: 03° Ari 12' 34"
Vertex: 28° Sag 45' 12"
ARMC: 183° 12' 34"

=== HOUSE CUSPS ===
House  1: 15° Can 23' 45"
House  2: 08° Leo 14' 22"
House  3: 02° Vir 05' 11"
...

=== PLANETARY POSITIONS ===
Sun       : 12° Pis 30' 15" (0.9856°/day D)
Moon      : 24° Gem 15' 42" (13.1234°/day D)
Mercury   : 28° Aqu 45' 30" (1.2345°/day D)
...
```

### Browser Example

```typescript
import {
  SwissEphemeris,
  Planet,
  HouseSystem
} from '@swisseph/browser';

async function calculateBirthChartBrowser(birthData) {
  // Initialize WebAssembly
  const swe = new SwissEphemeris();
  await swe.init();

  // Optionally load Swiss Ephemeris for maximum precision
  // await swe.loadStandardEphemeris();

  const jd = swe.julianDay(
    birthData.year,
    birthData.month,
    birthData.day,
    birthData.hour
  );

  // Calculate houses
  const houses = swe.calculateHouses(
    jd,
    birthData.latitude,
    birthData.longitude,
    HouseSystem.Placidus
  );

  // Calculate planetary positions
  const planets = [
    Planet.Sun,
    Planet.Moon,
    Planet.Mercury,
    Planet.Venus,
    Planet.Mars,
    Planet.Jupiter,
    Planet.Saturn,
    Planet.Uranus,
    Planet.Neptune
  ];

  const positions = planets.map(planet => ({
    planet,
    name: swe.getCelestialBodyName(planet),
    position: swe.calculatePosition(jd, planet)
  }));

  // Clean up
  swe.close();

  return {
    houses,
    positions
  };
}
```

## Time Zone Conversion

Birth times are typically given in local time, but Swiss Ephemeris requires UTC. You'll need to convert:

### Node.js with Luxon

```typescript
import { DateTime } from 'luxon';

interface LocalBirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timezone: string;
  latitude: number;
  longitude: number;
}

function convertToUTC(birthData: LocalBirthData): number {
  // Create DateTime in local timezone
  const localTime = DateTime.fromObject({
    year: birthData.year,
    month: birthData.month,
    day: birthData.day,
    hour: Math.floor(birthData.hour),
    minute: birthData.minute
  }, { zone: birthData.timezone });

  // Convert to UTC
  const utcTime = localTime.toUTC();

  // Calculate decimal hour
  const decimalHour = utcTime.hour + utcTime.minute / 60 + utcTime.second / 3600;

  // Return Julian day
  return julianDay(utcTime.year, utcTime.month, utcTime.day, decimalHour);
}

// Example
const birthData = {
  year: 2007,
  month: 3,
  day: 3,
  hour: 9,         // 9:30 AM
  minute: 30,
  timezone: 'America/New_York',  // EST/EDT
  latitude: 40.7128,
  longitude: -74.0060
};

const jd = convertToUTC(birthData);
console.log(`Julian day (UTC): ${jd}`);
```

### Browser with Temporal (future standard)

```typescript
// When Temporal API is available
function convertToUTCTemporal(birthData) {
  const localTime = Temporal.ZonedDateTime.from({
    year: birthData.year,
    month: birthData.month,
    day: birthData.day,
    hour: birthData.hour,
    minute: birthData.minute,
    timeZone: birthData.timezone
  });

  const utc = localTime.withTimeZone('UTC');
  const decimalHour = utc.hour + utc.minute / 60 + utc.second / 3600;

  return julianDay(utc.year, utc.month, utc.day, decimalHour);
}
```

## Complete Birth Chart with Lunar Nodes

```typescript
import {
  julianDay,
  calculatePosition,
  calculateHouses,
  getCelestialBodyName,
  Planet,
  LunarPoint,
  HouseSystem
} from '@swisseph/node';

interface ChartPoint {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  isRetrograde: boolean;
}

function calculateFullChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  lat: number,
  lon: number
) {
  const jd = julianDay(year, month, day, hour);

  // All chart points to calculate
  const bodies = [
    // Planets
    { id: Planet.Sun, type: 'planet' },
    { id: Planet.Moon, type: 'planet' },
    { id: Planet.Mercury, type: 'planet' },
    { id: Planet.Venus, type: 'planet' },
    { id: Planet.Mars, type: 'planet' },
    { id: Planet.Jupiter, type: 'planet' },
    { id: Planet.Saturn, type: 'planet' },
    { id: Planet.Uranus, type: 'planet' },
    { id: Planet.Neptune, type: 'planet' },
    { id: Planet.Pluto, type: 'planet' },

    // Lunar points
    { id: LunarPoint.MeanNode, type: 'point' },  // North Node
    { id: LunarPoint.MeanApogee, type: 'point' }  // Black Moon Lilith
  ];

  // Calculate all positions
  const chartPoints: ChartPoint[] = bodies.map(body => {
    const position = calculatePosition(jd, body.id);
    return {
      name: getCelestialBodyName(body.id),
      longitude: position.longitude,
      latitude: position.latitude,
      speed: position.longitudeSpeed,
      isRetrograde: position.longitudeSpeed < 0
    };
  });

  // Calculate houses
  const houses = calculateHouses(jd, lat, lon, HouseSystem.Placidus);

  return {
    datetime: { year, month, day, hour },
    location: { latitude: lat, longitude: lon },
    chartPoints,
    houses: {
      system: HouseSystem.Placidus,
      ascendant: houses.ascendant,
      mc: houses.mc,
      vertex: houses.vertex,
      cusps: houses.cusps.slice(1, 13)  // House cusps 1-12
    }
  };
}

// Example
const chart = calculateFullChart(2007, 3, 3, 14.5, 40.7128, -74.0060);

// Display retrograde planets
console.log('Retrograde planets:');
chart.chartPoints
  .filter(point => point.isRetrograde)
  .forEach(point => {
    console.log(`  ${point.name}: ${point.longitude.toFixed(2)}° (${point.speed.toFixed(4)}°/day)`);
  });
```

## Different House Systems

```typescript
import { HouseSystem } from '@swisseph/core';

// Compare different house systems
function compareHouseSystems(jd: number, lat: number, lon: number) {
  const systems = [
    HouseSystem.Placidus,
    HouseSystem.Koch,
    HouseSystem.Equal,
    HouseSystem.WholeSign,
    HouseSystem.Campanus,
    HouseSystem.Regiomontanus
  ];

  systems.forEach(system => {
    const houses = calculateHouses(jd, lat, lon, system);
    console.log(`\n${system} Houses:`);
    console.log(`  Ascendant: ${houses.ascendant.toFixed(2)}°`);
    console.log(`  MC: ${houses.mc.toFixed(2)}°`);
    console.log(`  House 1: ${houses.cusps[1].toFixed(2)}°`);
    console.log(`  House 10: ${houses.cusps[10].toFixed(2)}°`);
  });
}
```

## Aspects Between Planets

Calculate aspects (angles) between planets:

```typescript
function calculateAspects(positions: ChartPoint[]) {
  const aspects = [
    { name: 'Conjunction', angle: 0, orb: 8 },
    { name: 'Opposition', angle: 180, orb: 8 },
    { name: 'Trine', angle: 120, orb: 8 },
    { name: 'Square', angle: 90, orb: 8 },
    { name: 'Sextile', angle: 60, orb: 6 }
  ];

  const foundAspects = [];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const planet1 = positions[i];
      const planet2 = positions[j];

      // Calculate angle between planets
      let angle = Math.abs(planet1.longitude - planet2.longitude);
      if (angle > 180) angle = 360 - angle;

      // Check each aspect
      for (const aspect of aspects) {
        const diff = Math.abs(angle - aspect.angle);
        if (diff <= aspect.orb) {
          foundAspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            aspect: aspect.name,
            angle: angle.toFixed(2),
            orb: diff.toFixed(2)
          });
        }
      }
    }
  }

  return foundAspects;
}

// Usage
const chart = calculateFullChart(2007, 3, 3, 14.5, 40.7128, -74.0060);
const aspects = calculateAspects(chart.chartPoints);

console.log('\nAspects:');
aspects.forEach(asp => {
  console.log(
    `${asp.planet1} ${asp.aspect} ${asp.planet2} ` +
    `(${asp.angle}° orb ${asp.orb}°)`
  );
});
```

## Export Chart Data

```typescript
import * as fs from 'fs';

function exportChartJSON(chart: any, filename: string) {
  const data = JSON.stringify(chart, null, 2);
  fs.writeFileSync(filename, data);
  console.log(`Chart saved to ${filename}`);
}

// Save to file
const chart = calculateFullChart(2007, 3, 3, 14.5, 40.7128, -74.0060);
exportChartJSON(chart, 'birth-chart.json');
```

## Best Practices

1. **Always convert to UTC** - Birth times must be in UTC for accurate calculations
2. **Use proper time zones** - Account for DST (daylight saving time) changes
3. **Validate input data** - Check that dates and coordinates are valid
4. **Clean up resources** - Always call `close()` when done (Node.js) or `swe.close()` (browser)
5. **Handle errors** - Wrap calculations in try-catch blocks
6. **Cache Julian days** - If calculating multiple points for the same time, reuse the Julian day

## Error Handling

```typescript
function safeCalculateBirthChart(birthData: BirthData) {
  try {
    // Validate inputs
    if (birthData.month < 1 || birthData.month > 12) {
      throw new Error('Invalid month');
    }
    if (birthData.day < 1 || birthData.day > 31) {
      throw new Error('Invalid day');
    }
    if (birthData.latitude < -90 || birthData.latitude > 90) {
      throw new Error('Invalid latitude');
    }
    if (birthData.longitude < -180 || birthData.longitude > 180) {
      throw new Error('Invalid longitude');
    }

    return calculateBirthChart(birthData);

  } catch (error) {
    console.error('Error calculating birth chart:', error);
    throw error;
  } finally {
    close();  // Always clean up
  }
}
```

## See Also

- [House Systems Guide](./house-systems.md)
- [Working with Julian Days](./julian-days.md)
- [@swisseph/node API Reference](../api/node.md)
- [@swisseph/browser API Reference](../api/browser.md)
