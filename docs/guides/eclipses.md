# Eclipse Calculations

This guide shows you how to find and analyze solar and lunar eclipses using Swiss Ephemeris JS.

## Overview

Swiss Ephemeris can calculate:
- **Lunar eclipses** - When Earth's shadow falls on the Moon
- **Solar eclipses** - When the Moon's shadow falls on Earth
- Eclipse timing, type, and characteristics

## Finding the Next Lunar Eclipse

### Basic Example

```typescript
import {
  julianDay,
  julianDayToDate,
  findNextLunarEclipse,
  close
} from '@swisseph/node';

// Find next lunar eclipse after January 1, 2025
const startJd = julianDay(2025, 1, 1);
const eclipse = findNextLunarEclipse(startJd);

const eclipseDate = julianDayToDate(eclipse.maximum);

console.log(`Next lunar eclipse: ${eclipseDate.toString()}`);
console.log(`Type: ${eclipse.isTotal() ? 'Total' : eclipse.isPartial() ? 'Partial' : 'Penumbral'}`);

if (eclipse.isTotal()) {
  console.log(`Totality duration: ${eclipse.getTotalityDuration().toFixed(2)} hours`);
}

console.log(`Partial duration: ${eclipse.getPartialDuration().toFixed(2)} hours`);
console.log(`Total duration: ${eclipse.getTotalDuration().toFixed(2)} hours`);

// Display all eclipse phases
console.log('\n=== Eclipse Phases ===');
console.log(`Penumbral begins: ${julianDayToDate(eclipse.penumbralBegin).toString()}`);
console.log(`Partial begins:   ${julianDayToDate(eclipse.partialBegin).toString()}`);

if (eclipse.isTotal()) {
  console.log(`Total begins:     ${julianDayToDate(eclipse.totalBegin).toString()}`);
  console.log(`Maximum:          ${julianDayToDate(eclipse.maximum).toString()}`);
  console.log(`Total ends:       ${julianDayToDate(eclipse.totalEnd).toString()}`);
}

console.log(`Partial ends:     ${julianDayToDate(eclipse.partialEnd).toString()}`);
console.log(`Penumbral ends:   ${julianDayToDate(eclipse.penumbralEnd).toString()}`);

close();
```

### Browser Example

```typescript
import { SwissEphemeris } from '@swisseph/browser';

async function findLunarEclipse() {
  const swe = new SwissEphemeris();
  await swe.init();

  const startJd = swe.julianDay(2025, 1, 1);
  const eclipse = swe.findNextLunarEclipse(startJd);

  const eclipseDate = swe.julianDayToDate(eclipse.maximum);

  const result = {
    date: eclipseDate.toString(),
    type: eclipse.isTotal() ? 'Total' :
          eclipse.isPartial() ? 'Partial' : 'Penumbral',
    duration: {
      totality: eclipse.getTotalityDuration(),
      partial: eclipse.getPartialDuration(),
      total: eclipse.getTotalDuration()
    }
  };

  swe.close();
  return result;
}
```

## Finding the Next Solar Eclipse

### Basic Example

```typescript
import {
  julianDay,
  julianDayToDate,
  findNextSolarEclipse
} from '@swisseph/node';

const startJd = julianDay(2025, 1, 1);
const eclipse = findNextSolarEclipse(startJd);

const eclipseDate = julianDayToDate(eclipse.maximum);

console.log(`Next solar eclipse: ${eclipseDate.toString()}`);

// Determine eclipse type
if (eclipse.isTotal()) {
  console.log('Type: Total');
} else if (eclipse.isAnnular()) {
  console.log('Type: Annular');
} else if (eclipse.isHybrid()) {
  console.log('Type: Hybrid (Annular-Total)');
} else if (eclipse.isPartial()) {
  console.log('Type: Partial');
}

console.log(`Central: ${eclipse.isCentral() ? 'Yes' : 'No'}`);

// Display eclipse phases
console.log('\n=== Eclipse Phases ===');
console.log(`Partial begins: ${julianDayToDate(eclipse.partialBegin).toString()}`);

if (eclipse.isCentral()) {
  console.log(`Central begins: ${julianDayToDate(eclipse.centralBegin).toString()}`);
  console.log(`Maximum:        ${julianDayToDate(eclipse.maximum).toString()}`);
  console.log(`Central ends:   ${julianDayToDate(eclipse.centralEnd).toString()}`);
}

console.log(`Partial ends:   ${julianDayToDate(eclipse.partialEnd).toString()}`);
```

## Finding Previous Eclipses

Use the `backward` parameter to search backward in time:

```typescript
import { julianDay, findNextLunarEclipse } from '@swisseph/node';

const now = julianDay(2025, 1, 1);

// Find previous lunar eclipse
const prevEclipse = findNextLunarEclipse(now, undefined, 0, true);
console.log(`Previous eclipse: ${julianDayToDate(prevEclipse.maximum).toString()}`);

// Find previous solar eclipse
const prevSolar = findNextSolarEclipse(now, undefined, 0, true);
console.log(`Previous solar: ${julianDayToDate(prevSolar.maximum).toString()}`);
```

## Filtering by Eclipse Type

Use eclipse type flags to filter results:

```typescript
import {
  findNextLunarEclipse,
  findNextSolarEclipse,
  EclipseType
} from '@swisseph/node';

// Find only total lunar eclipses
const totalLunar = findNextLunarEclipse(
  startJd,
  undefined,
  EclipseType.Total
);

// Find only total or partial lunar eclipses (no penumbral)
const visibleLunar = findNextLunarEclipse(
  startJd,
  undefined,
  EclipseType.Total | EclipseType.Partial
);

// Find only total solar eclipses
const totalSolar = findNextSolarEclipse(
  startJd,
  undefined,
  EclipseType.Total
);

// Find only annular solar eclipses
const annularSolar = findNextSolarEclipse(
  startJd,
  undefined,
  EclipseType.Annular
);
```

### Using Flag Builders

```typescript
import { EclipseTypeFlags, EclipseType } from '@swisseph/core';

// Build complex filters
const filter = EclipseTypeFlags.from(
  EclipseType.Total,
  EclipseType.Partial
);

const eclipse = findNextLunarEclipse(
  startJd,
  undefined,
  filter.toNumber()
);

// Use presets
const totalOnly = EclipseTypeFlags.totalOnly;
const eclipse2 = findNextLunarEclipse(
  startJd,
  undefined,
  totalOnly.toNumber()
);
```

## Finding All Eclipses in a Range

```typescript
import { julianDay, findNextLunarEclipse, findNextSolarEclipse } from '@swisseph/node';

function findAllEclipsesInRange(
  startYear: number,
  endYear: number
) {
  const startJd = julianDay(startYear, 1, 1);
  const endJd = julianDay(endYear, 12, 31);

  const lunarEclipses = [];
  const solarEclipses = [];

  // Find all lunar eclipses
  let currentJd = startJd;
  while (currentJd < endJd) {
    const eclipse = findNextLunarEclipse(currentJd);
    if (eclipse.maximum >= endJd) break;

    lunarEclipses.push({
      date: julianDayToDate(eclipse.maximum),
      type: eclipse.isTotal() ? 'Total' :
            eclipse.isPartial() ? 'Partial' : 'Penumbral',
      duration: eclipse.getTotalityDuration()
    });

    // Search for next eclipse after this one
    currentJd = eclipse.maximum + 1;
  }

  // Find all solar eclipses
  currentJd = startJd;
  while (currentJd < endJd) {
    const eclipse = findNextSolarEclipse(currentJd);
    if (eclipse.maximum >= endJd) break;

    solarEclipses.push({
      date: julianDayToDate(eclipse.maximum),
      type: eclipse.isTotal() ? 'Total' :
            eclipse.isAnnular() ? 'Annular' :
            eclipse.isHybrid() ? 'Hybrid' : 'Partial',
      central: eclipse.isCentral()
    });

    currentJd = eclipse.maximum + 1;
  }

  return { lunarEclipses, solarEclipses };
}

// Find all eclipses in 2025
const eclipses = findAllEclipsesInRange(2025, 2026);

console.log('\n=== Lunar Eclipses in 2025 ===');
eclipses.lunarEclipses.forEach(eclipse => {
  console.log(`${eclipse.date.toString()} - ${eclipse.type}`);
  if (eclipse.duration > 0) {
    console.log(`  Duration: ${eclipse.duration.toFixed(2)} hours`);
  }
});

console.log('\n=== Solar Eclipses in 2025 ===');
eclipses.solarEclipses.forEach(eclipse => {
  console.log(
    `${eclipse.date.toString()} - ${eclipse.type} ` +
    `(${eclipse.central ? 'Central' : 'Non-central'})`
  );
});
```

## Eclipse Statistics

Calculate statistics for eclipses in a century:

```typescript
function eclipseStatistics(startYear: number, endYear: number) {
  const startJd = julianDay(startYear, 1, 1);
  const endJd = julianDay(endYear, 12, 31);

  const stats = {
    lunar: {
      total: 0,
      partial: 0,
      penumbral: 0
    },
    solar: {
      total: 0,
      annular: 0,
      hybrid: 0,
      partial: 0
    }
  };

  // Count lunar eclipses
  let currentJd = startJd;
  while (currentJd < endJd) {
    const eclipse = findNextLunarEclipse(currentJd);
    if (eclipse.maximum >= endJd) break;

    if (eclipse.isTotal()) stats.lunar.total++;
    else if (eclipse.isPartial()) stats.lunar.partial++;
    else if (eclipse.isPenumbralOnly()) stats.lunar.penumbral++;

    currentJd = eclipse.maximum + 1;
  }

  // Count solar eclipses
  currentJd = startJd;
  while (currentJd < endJd) {
    const eclipse = findNextSolarEclipse(currentJd);
    if (eclipse.maximum >= endJd) break;

    if (eclipse.isTotal()) stats.solar.total++;
    else if (eclipse.isAnnular()) stats.solar.annular++;
    else if (eclipse.isHybrid()) stats.solar.hybrid++;
    else if (eclipse.isPartial()) stats.solar.partial++;

    currentJd = eclipse.maximum + 1;
  }

  return stats;
}

// Statistics for 21st century
const stats = eclipseStatistics(2000, 2100);

console.log('Eclipse Statistics (2000-2100):');
console.log('\nLunar Eclipses:');
console.log(`  Total:     ${stats.lunar.total}`);
console.log(`  Partial:   ${stats.lunar.partial}`);
console.log(`  Penumbral: ${stats.lunar.penumbral}`);

console.log('\nSolar Eclipses:');
console.log(`  Total:     ${stats.solar.total}`);
console.log(`  Annular:   ${stats.solar.annular}`);
console.log(`  Hybrid:    ${stats.solar.hybrid}`);
console.log(`  Partial:   ${stats.solar.partial}`);
```

## Eclipse Times in Different Time Zones

```typescript
import { DateTime } from 'luxon';

function formatEclipseInTimezone(
  eclipse: LunarEclipse | SolarEclipse,
  timezone: string
) {
  const maxDate = julianDayToDate(eclipse.maximum);

  // Convert to Luxon DateTime
  const dt = DateTime.fromObject({
    year: maxDate.year,
    month: maxDate.month,
    day: maxDate.day,
    hour: Math.floor(maxDate.hour),
    minute: Math.floor((maxDate.hour % 1) * 60)
  }, { zone: 'UTC' });

  // Convert to target timezone
  const local = dt.setZone(timezone);

  return {
    utc: dt.toISO(),
    local: local.toISO(),
    localFormatted: local.toFormat('yyyy-MM-dd HH:mm:ss ZZZZ')
  };
}

// Example
const eclipse = findNextLunarEclipse(julianDay(2025, 1, 1));

const newYork = formatEclipseInTimezone(eclipse, 'America/New_York');
const london = formatEclipseInTimezone(eclipse, 'Europe/London');
const tokyo = formatEclipseInTimezone(eclipse, 'Asia/Tokyo');

console.log('Eclipse Maximum Times:');
console.log(`UTC:      ${newYork.utc}`);
console.log(`New York: ${newYork.localFormatted}`);
console.log(`London:   ${london.localFormatted}`);
console.log(`Tokyo:    ${tokyo.localFormatted}`);
```

## Exporting Eclipse Data

```typescript
import * as fs from 'fs';

interface EclipseData {
  date: string;
  type: string;
  julianDay: number;
  phases: {
    penumbralBegin?: string;
    partialBegin: string;
    totalBegin?: string;
    maximum: string;
    totalEnd?: string;
    partialEnd: string;
    penumbralEnd?: string;
  };
  duration?: {
    totality?: number;
    partial: number;
    total: number;
  };
}

function exportLunarEclipse(eclipse: LunarEclipse): EclipseData {
  return {
    date: julianDayToDate(eclipse.maximum).toString(),
    type: eclipse.isTotal() ? 'Total' :
          eclipse.isPartial() ? 'Partial' : 'Penumbral',
    julianDay: eclipse.maximum,
    phases: {
      penumbralBegin: julianDayToDate(eclipse.penumbralBegin).toString(),
      partialBegin: julianDayToDate(eclipse.partialBegin).toString(),
      totalBegin: eclipse.totalBegin > 0 ?
        julianDayToDate(eclipse.totalBegin).toString() : undefined,
      maximum: julianDayToDate(eclipse.maximum).toString(),
      totalEnd: eclipse.totalEnd > 0 ?
        julianDayToDate(eclipse.totalEnd).toString() : undefined,
      partialEnd: julianDayToDate(eclipse.partialEnd).toString(),
      penumbralEnd: julianDayToDate(eclipse.penumbralEnd).toString()
    },
    duration: {
      totality: eclipse.getTotalityDuration(),
      partial: eclipse.getPartialDuration(),
      total: eclipse.getTotalDuration()
    }
  };
}

// Export all 2025 eclipses to JSON
const eclipses2025 = findAllEclipsesInRange(2025, 2026);
const exportData = {
  lunar: eclipses2025.lunarEclipses,
  solar: eclipses2025.solarEclipses
};

fs.writeFileSync(
  'eclipses-2025.json',
  JSON.stringify(exportData, null, 2)
);
```

## Precision Considerations

### Using Different Ephemeris

```typescript
import { CalculationFlag } from '@swisseph/core';

// Use Swiss Ephemeris (Node.js default, highest precision)
const eclipse1 = findNextLunarEclipse(
  startJd,
  CalculationFlag.SwissEphemeris
);

// Use Moshier ephemeris (browser default, good precision, no files needed)
const eclipse2 = findNextLunarEclipse(
  startJd,
  CalculationFlag.MoshierEphemeris
);

// Times differ by only a few seconds
const diff = Math.abs(eclipse1.maximum - eclipse2.maximum) * 24 * 3600;
console.log(`Time difference: ${diff.toFixed(2)} seconds`);
```

## Best Practices

1. **Specify time range** - Don't search indefinitely, set reasonable start/end dates
2. **Filter by type** - Use eclipse type flags to find only the eclipses you need
3. **Cache results** - If searching for multiple eclipses, cache the results
4. **Handle errors** - Wrap calculations in try-catch blocks
5. **Time zones** - Always be clear about UTC vs local time
6. **Clean up** - Call `close()` when done

## Error Handling

```typescript
function safeEclipseSearch(startYear: number, endYear: number) {
  try {
    if (endYear - startYear > 100) {
      throw new Error('Search range too large (max 100 years)');
    }

    return findAllEclipsesInRange(startYear, endYear);

  } catch (error) {
    console.error('Error finding eclipses:', error);
    throw error;
  } finally {
    close();
  }
}
```

## See Also

- [@swisseph/node API Reference](../api/node.md)
- [@swisseph/browser API Reference](../api/browser.md)
- [@swisseph/core API Reference](../api/core.md)
- [Working with Julian Days](./julian-days.md)
