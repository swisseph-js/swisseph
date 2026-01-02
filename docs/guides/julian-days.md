# Working with Julian Days

This guide explains Julian Day numbers and how to work with them in Swiss Ephemeris JS.

## What is a Julian Day?

A Julian Day (JD) is a continuous count of days since noon Universal Time on January 1, 4713 BCE (Julian calendar). It's the standard time system used by astronomers and Swiss Ephemeris.

### Why Julian Days?

- **No time zones** - Always in Universal Time
- **No calendar conversions** - Continuous count across calendar changes
- **Simple arithmetic** - Easy to add/subtract days
- **Precision** - Includes fractional days for time of day

## Converting to Julian Days

### Basic Conversion

```typescript
import { julianDay } from '@swisseph/node';

// Date only (defaults to midnight UTC)
const jd = julianDay(2007, 3, 3);
console.log(jd);  // 2454162.5

// Date with time (14:30 UTC)
const jdWithTime = julianDay(2007, 3, 3, 14.5);
console.log(jdWithTime);  // 2454163.104166667
```

### Understanding the Hour Parameter

The hour parameter is a **decimal** representing hours since midnight:

```typescript
// Midnight (00:00)
julianDay(2007, 3, 3, 0);

// 6:00 AM
julianDay(2007, 3, 3, 6);

// 12:00 PM (noon)
julianDay(2007, 3, 3, 12);

// 6:30 PM (18:30)
julianDay(2007, 3, 3, 18.5);

// 11:59:59 PM
julianDay(2007, 3, 3, 23 + 59/60 + 59/3600);
```

### Converting Time to Decimal Hours

```typescript
function timeToDecimalHours(
  hours: number,
  minutes: number,
  seconds: number = 0
): number {
  return hours + minutes / 60 + seconds / 3600;
}

// 14:30:00 → 14.5
const decimal1 = timeToDecimalHours(14, 30);
console.log(decimal1);  // 14.5

// 9:15:30 → 9.258333...
const decimal2 = timeToDecimalHours(9, 15, 30);
console.log(decimal2);  // 9.258333333333333

// Use in julianDay
const jd = julianDay(2007, 3, 3, timeToDecimalHours(14, 30));
```

## Converting from Julian Days

### Basic Conversion

```typescript
import { julianDayToDate } from '@swisseph/node';

const jd = 2454162.5;
const date = julianDayToDate(jd);

console.log(date.year);   // 2007
console.log(date.month);  // 3
console.log(date.day);    // 3
console.log(date.hour);   // 0.0
console.log(date.toString());  // "2007-03-03 0.000000 hours (Gregorian)"
```

### Extracting Time Components

```typescript
function extractTimeFromJulianDate(jd: number) {
  const date = julianDayToDate(jd);

  const hours = Math.floor(date.hour);
  const minutes = Math.floor((date.hour - hours) * 60);
  const seconds = Math.floor(((date.hour - hours) * 60 - minutes) * 60);

  return {
    year: date.year,
    month: date.month,
    day: date.day,
    hours,
    minutes,
    seconds
  };
}

const jd = julianDay(2007, 3, 3, 14.5);
const time = extractTimeFromJulianDate(jd);
console.log(`${time.year}-${time.month}-${time.day} ${time.hours}:${time.minutes}:${time.seconds}`);
// Output: "2007-3-3 14:30:0"
```

## Calendar Types

### Gregorian vs Julian Calendar

The Gregorian calendar was adopted on October 15, 1582, replacing the Julian calendar:

```typescript
import { julianDay, CalendarType } from '@swisseph/node';

// October 4, 1582 (last day of Julian calendar)
const lastJulian = julianDay(1582, 10, 4, 0, CalendarType.Julian);

// October 15, 1582 (first day of Gregorian calendar)
const firstGregorian = julianDay(1582, 10, 15, 0, CalendarType.Gregorian);

// These are consecutive days
console.log(firstGregorian - lastJulian);  // 1.0
```

### When to Use Which Calendar

```typescript
function autoSelectCalendar(year: number, month: number, day: number): CalendarType {
  // Before October 15, 1582: use Julian
  if (year < 1582) {
    return CalendarType.Julian;
  }

  if (year === 1582) {
    if (month < 10 || (month === 10 && day < 15)) {
      return CalendarType.Julian;
    }
  }

  // October 15, 1582 and after: use Gregorian
  return CalendarType.Gregorian;
}

// Example
const calType = autoSelectCalendar(1500, 6, 15);
const jd = julianDay(1500, 6, 15, 0, calType);
```

**Note:** Most modern applications use Gregorian calendar exclusively (the default).

## Julian Day Arithmetic

### Adding/Subtracting Days

```typescript
import { julianDay, julianDayToDate } from '@swisseph/node';

const jd = julianDay(2007, 3, 3);

// Add 10 days
const tenDaysLater = jd + 10;
console.log(julianDayToDate(tenDaysLater).toString());
// "2007-03-13 ..."

// Subtract 5 days
const fiveDaysBefore = jd - 5;
console.log(julianDayToDate(fiveDaysBefore).toString());
// "2007-02-26 ..."

// Add half a day (12 hours)
const halfDayLater = jd + 0.5;
console.log(julianDayToDate(halfDayLater).toString());
// "2007-03-03 12.000000 hours ..."
```

### Calculating Days Between Dates

```typescript
function daysBetween(
  year1: number, month1: number, day1: number,
  year2: number, month2: number, day2: number
): number {
  const jd1 = julianDay(year1, month1, day1);
  const jd2 = julianDay(year2, month2, day2);

  return Math.abs(jd2 - jd1);
}

// Days between January 1, 2000 and January 1, 2001
const days = daysBetween(2000, 1, 1, 2001, 1, 1);
console.log(days);  // 366 (2000 was a leap year)

// Days between March 3, 2007 and December 25, 2007
const days2 = daysBetween(2007, 3, 3, 2007, 12, 25);
console.log(days2);  // 297
```

### Leap Years

Julian Day arithmetic automatically handles leap years:

```typescript
// February 28, 2000 + 1 day
const jd1 = julianDay(2000, 2, 28) + 1;
console.log(julianDayToDate(jd1).toString());
// "2000-02-29 ..." (leap day!)

// February 28, 2001 + 1 day
const jd2 = julianDay(2001, 2, 28) + 1;
console.log(julianDayToDate(jd2).toString());
// "2001-03-01 ..." (not a leap year)
```

## Time Precision

### Understanding Decimal Days

One Julian Day = 24 hours:

```typescript
// 1 day = 1.0
// 12 hours = 0.5
// 6 hours = 0.25
// 1 hour = 1/24 ≈ 0.041666...
// 1 minute = 1/1440 ≈ 0.000694...
// 1 second = 1/86400 ≈ 0.0000115...

function timeDeltaToJulianDays(hours: number, minutes: number, seconds: number): number {
  return hours / 24 + minutes / 1440 + seconds / 86400;
}

// Add 1 hour, 30 minutes, 45 seconds
const jd = julianDay(2007, 3, 3, 12);
const delta = timeDeltaToJulianDays(1, 30, 45);
const newJd = jd + delta;

console.log(julianDayToDate(newJd).toString());
// "2007-03-03 13.512500 hours ..." (13:30:45)
```

### Precision Limits

JavaScript numbers are IEEE 754 double precision (64-bit), which gives:

```typescript
// Maximum precision for modern dates:
const jd = julianDay(2007, 3, 3, 12, 30, 45);

// Precision is about 0.02 milliseconds for dates near year 2000
// This is far more precise than needed for astronomical calculations
```

## Common Patterns

### Current Julian Day

```typescript
function nowAsJulianDay(): number {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;  // JavaScript months are 0-based
  const day = now.getUTCDate();
  const hour = now.getUTCHours() +
               now.getUTCMinutes() / 60 +
               now.getUTCSeconds() / 3600 +
               now.getUTCMilliseconds() / 3600000;

  return julianDay(year, month, day, hour);
}

const jd = nowAsJulianDay();
console.log(`Current Julian Day: ${jd}`);
```

### Iterating Over Date Range

```typescript
function processDailyPositions(startYear: number, endYear: number) {
  const startJd = julianDay(startYear, 1, 1);
  const endJd = julianDay(endYear, 12, 31);

  // Process each day
  for (let jd = startJd; jd <= endJd; jd += 1) {
    const date = julianDayToDate(jd);
    const sun = calculatePosition(jd, Planet.Sun);

    console.log(
      `${date.year}-${date.month}-${date.day}: Sun at ${sun.longitude.toFixed(2)}°`
    );
  }
}

// Process every day in 2007
processDailyPositions(2007, 2007);
```

### Finding Specific Events

```typescript
// Find first day of month when Sun enters Aries (Spring Equinox approximation)
function findSunInAries(year: number): number {
  // Start March 15 (approximate)
  let jd = julianDay(year, 3, 15);

  // Check each day
  for (let i = 0; i < 15; i++) {
    const sun = calculatePosition(jd, Planet.Sun);

    // Check if Sun longitude is in Aries (0-30°)
    if (sun.longitude >= 0 && sun.longitude < 30) {
      return jd;
    }

    jd += 1;
  }

  return jd;  // Fallback
}

const equinoxJd = findSunInAries(2007);
console.log(`Spring Equinox ~${julianDayToDate(equinoxJd).toString()}`);
```

## Time Zone Conversion (with Luxon)

```typescript
import { DateTime } from 'luxon';
import { julianDay, julianDayToDate } from '@swisseph/node';

// Local time → Julian Day
function localTimeToJulianDay(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone: string
): number {
  const local = DateTime.fromObject({
    year, month, day, hour, minute
  }, { zone: timezone });

  const utc = local.toUTC();
  const decimalHour = utc.hour + utc.minute / 60 + utc.second / 3600;

  return julianDay(utc.year, utc.month, utc.day, decimalHour);
}

// Julian Day → Local time
function julianDayToLocalTime(jd: number, timezone: string) {
  const date = julianDayToDate(jd);

  const utc = DateTime.fromObject({
    year: date.year,
    month: date.month,
    day: date.day,
    hour: Math.floor(date.hour),
    minute: Math.floor((date.hour % 1) * 60)
  }, { zone: 'UTC' });

  return utc.setZone(timezone);
}

// Example
const jd = localTimeToJulianDay(2007, 3, 3, 9, 30, 'America/New_York');
console.log(`Julian Day: ${jd}`);

const localTime = julianDayToLocalTime(jd, 'America/New_York');
console.log(`Local time: ${localTime.toFormat('yyyy-MM-dd HH:mm:ss ZZZZ')}`);
```

## Caching Julian Days

If you need to calculate multiple positions for the same time, cache the Julian Day:

```typescript
import { julianDay, calculatePosition, calculateHouses } from '@swisseph/node';

function calculateBirthChart(year, month, day, hour, lat, lon) {
  // Calculate once
  const jd = julianDay(year, month, day, hour);

  // Reuse for all calculations
  const sun = calculatePosition(jd, Planet.Sun);
  const moon = calculatePosition(jd, Planet.Moon);
  const mercury = calculatePosition(jd, Planet.Mercury);
  const houses = calculateHouses(jd, lat, lon, HouseSystem.Placidus);

  // ... etc
}
```

## Special Julian Day Values

```typescript
// J2000.0 epoch (January 1, 2000, 12:00 TT)
const J2000 = 2451545.0;

// Current century begins
const century21Start = julianDay(2000, 1, 1);  // 2451544.5

// Unix epoch (January 1, 1970, 00:00 UTC)
const unixEpoch = julianDay(1970, 1, 1);  // 2440587.5

// Calendar change (October 15, 1582)
const gregorianStart = julianDay(1582, 10, 15, 0, CalendarType.Gregorian);
```

## Best Practices

1. **Always use UTC** - Julian Days are always in Universal Time
2. **Cache calculations** - Don't recalculate the same Julian Day multiple times
3. **Use decimal hours** - More precise than separate hour/minute/second
4. **Handle time zones carefully** - Convert to UTC before creating Julian Day
5. **Use appropriate calendar** - Julian for historical dates, Gregorian for modern

## Troubleshooting

### Off by 12 Hours

Julian Days start at **noon** (12:00 UTC), not midnight:

```typescript
// January 1, 2000, 00:00 (midnight)
const jd1 = julianDay(2000, 1, 1, 0);
console.log(jd1);  // 2451544.5 (0.5 = midnight)

// January 1, 2000, 12:00 (noon)
const jd2 = julianDay(2000, 1, 1, 12);
console.log(jd2);  // 2451545.0 (whole number = noon)
```

### Time Zone Issues

Always convert to UTC before calculating Julian Day:

```typescript
// ❌ WRONG - using local time directly
const jdWrong = julianDay(2007, 3, 3, 14.5);  // What timezone is this?

// ✅ CORRECT - convert to UTC first
const localDT = DateTime.fromObject({
  year: 2007, month: 3, day: 3, hour: 14, minute: 30
}, { zone: 'America/New_York' });

const utcDT = localDT.toUTC();
const jdCorrect = julianDay(
  utcDT.year,
  utcDT.month,
  utcDT.day,
  utcDT.hour + utcDT.minute / 60
);
```

## See Also

- [Birth Charts Guide](./birth-charts.md)
- [Eclipse Calculations](./eclipses.md)
- [@swisseph/node API Reference](../api/node.md)
- [@swisseph/browser API Reference](../api/browser.md)
