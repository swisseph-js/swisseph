# Understanding Ephemeris Files

This guide explains ephemeris files, how they work, and how to use them with Swiss Ephemeris JS.

## What are Ephemeris Files?

Ephemeris files contain pre-calculated positions of celestial bodies. Think of them as lookup tables:

- **Input:** Julian Day number
- **Output:** Precise positions of planets, Moon, asteroids, etc.

## Types of Ephemeris

Swiss Ephemeris supports three types:

### 1. Swiss Ephemeris (Highest Precision)

**Files:** `sepl_*.se1`, `semo_*.se1`, `seas_*.se1`

- **Accuracy:** Highest - based on JPL DE406/431 ephemeris
- **Date range:** 13201 BC to 17191 AD
- **Size:** ~20MB for all files, ~2MB for standard files
- **Planets:** All major planets, Moon, main asteroids
- **Requires:** External data files

**In Node.js:**
```typescript
import { calculatePosition, Planet, CalculationFlag } from '@swisseph/node';

// Automatically uses bundled Swiss Ephemeris files
const sun = calculatePosition(jd, Planet.Sun, CalculationFlag.SwissEphemeris);
```

**In Browser:**
```typescript
import { SwissEphemeris } from '@swisseph/browser';

const swe = new SwissEphemeris();
await swe.init();

// Load Swiss Ephemeris from CDN
await swe.loadStandardEphemeris();

// Now use Swiss Ephemeris
const sun = swe.calculatePosition(jd, Planet.Sun, CalculationFlag.SwissEphemeris);
```

### 2. Moshier Ephemeris (Built-in)

**Files:** None required (analytical calculations)

- **Accuracy:** Sub-arcsecond (sufficient for most applications)
- **Date range:** 3000 BC to 3000 AD
- **Size:** Built into code (~50KB)
- **Planets:** Major planets only (no asteroids)
- **Requires:** Nothing - works offline

**In Node.js:**
```typescript
const sun = calculatePosition(jd, Planet.Sun, CalculationFlag.MoshierEphemeris);
```

**In Browser:**
```typescript
// Default - no loading needed
const sun = swe.calculatePosition(jd, Planet.Sun);  // Uses Moshier by default
```

### 3. JPL Ephemeris (External)

**Files:** JPL DE files (very large)

- **Accuracy:** Research-grade precision
- **Size:** 100+ MB
- **Use case:** Scientific research only

**Not commonly used** in typical applications.

## Ephemeris File Structure

### Standard Files

The most commonly needed files:

| File | Contents | Size | Used For |
|------|----------|------|----------|
| `sepl_18.se1` | Main planets | ~900 KB | Sun, Moon, Mercury-Pluto |
| `semo_18.se1` | Moon | ~700 KB | Precise Moon positions |
| `seas_18.se1` | Asteroids | ~600 KB | Chiron, Ceres, Pallas, Juno, Vesta |

### Complete Set

For the full date range and all bodies:

| File Pattern | Contents |
|--------------|----------|
| `sepl_*.se1` | Planetary positions for different date ranges |
| `semo_*.se1` | Moon positions |
| `seas_*.se1` | Asteroid positions |
| `seplm*.se1` | Planetary moons |

Numbers indicate date coverage:
- `_18.se1` = 1800-2400 AD (most commonly used)
- `_00.se1` = 0-1600 AD
- `_06.se1` = 600 BC to 600 AD
- etc.

## Node.js: Bundled Ephemeris

### Automatic Loading

In `@swisseph/node`, ephemeris files are **bundled and auto-loaded**:

```typescript
import { calculatePosition, Planet } from '@swisseph/node';

// No setup needed! Swiss Ephemeris files are already available
const jd = julianDay(2007, 3, 3);
const sun = calculatePosition(jd, Planet.Sun);
// Automatically uses bundled Swiss Ephemeris
```

### Location

Bundled files are in `node_modules/@swisseph/node/ephemeris/`:

```bash
@swisseph/node/
├── ephemeris/
│   ├── sepl_18.se1    # Planets 1800-2400
│   ├── semo_18.se1    # Moon 1800-2400
│   └── seas_18.se1    # Asteroids 1800-2400
```

### Custom Files (Advanced)

If you need different date ranges or additional bodies:

```typescript
import { setEphemerisPath } from '@swisseph/node';

// Point to custom directory
setEphemerisPath('/path/to/custom/ephemeris');

// Revert to bundled files
setEphemerisPath(null);
```

### Asteroid Calculations

Asteroids work out of the box:

```typescript
import { calculatePosition, Asteroid, CalculationFlag } from '@swisseph/node';

const chiron = calculatePosition(jd, Asteroid.Chiron, CalculationFlag.SwissEphemeris);
const ceres = calculatePosition(jd, Asteroid.Ceres, CalculationFlag.SwissEphemeris);
```

## Browser: Loading Ephemeris

### Default: Moshier (No Files)

By default, browser uses built-in Moshier:

```typescript
import { SwissEphemeris, Planet } from '@swisseph/browser';

const swe = new SwissEphemeris();
await swe.init();

// Works immediately, no loading
const sun = swe.calculatePosition(jd, Planet.Sun);
// Uses Moshier ephemeris (built-in)
```

### Optional: Load Swiss Ephemeris

For maximum precision or asteroids:

```typescript
const swe = new SwissEphemeris();
await swe.init();

// Load standard Swiss Ephemeris files from jsDelivr CDN
await swe.loadStandardEphemeris();

console.log('Swiss Ephemeris loaded (~2MB)');

// Now use Swiss Ephemeris
import { CalculationFlag } from '@swisseph/browser';
const sun = swe.calculatePosition(jd, Planet.Sun, CalculationFlag.SwissEphemeris);

// Asteroids now available
const chiron = swe.calculatePosition(jd, Asteroid.Chiron, CalculationFlag.SwissEphemeris);
```

### Custom CDN or Self-Hosted

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

## Precision Comparison

### Accuracy

For typical astrological calculations around year 2000:

| Ephemeris | Longitude Accuracy | Good For |
|-----------|-------------------|----------|
| **Swiss Ephemeris** | ~0.001" (milliarcseconds) | Professional work, research |
| **Moshier** | ~1" (arcsecond) | General use, hobbyists |

**Note:** 1 arcsecond ≈ 1/3600 of a degree. Both are more than sufficient for astrology.

### Comparison Example

```typescript
import { julianDay, calculatePosition, Planet, CalculationFlag } from '@swisseph/node';

const jd = julianDay(2007, 3, 3, 12);

// Swiss Ephemeris
const sunSwiss = calculatePosition(jd, Planet.Sun, CalculationFlag.SwissEphemeris);

// Moshier
const sunMoshier = calculatePosition(jd, Planet.Sun, CalculationFlag.MoshierEphemeris);

// Difference (usually < 1 arcsecond for modern dates)
const diff = Math.abs(sunSwiss.longitude - sunMoshier.longitude);
console.log(`Difference: ${(diff * 3600).toFixed(6)} arcseconds`);
// Typical output: "Difference: 0.234567 arcseconds"
```

## Choosing the Right Ephemeris

### Use Moshier When:
- Building web applications (small bundle)
- Offline functionality required
- Sub-arcsecond accuracy is sufficient
- Only need major planets (no asteroids)
- Dates between 3000 BC and 3000 AD

### Use Swiss Ephemeris When:
- Need maximum precision
- Need asteroids (Chiron, Ceres, etc.)
- Professional/research work
- Dates outside Moshier range
- Node.js server (files bundled anyway)

## Date Range Coverage

### Moshier
- **Range:** 3000 BC to 3000 AD
- **Reliable:** 3000 BC to 3000 AD

### Swiss Ephemeris (standard files)
- **Range:** 13201 BC to 17191 AD
- **Standard files:** 1800 to 2400 AD
- **Extended files available** for other periods

### Example: Checking Date Coverage

```typescript
function checkEphemerisCoverage(year: number) {
  if (year < -3000 || year > 3000) {
    console.log('Outside Moshier range - use Swiss Ephemeris');
    console.log('May need extended ephemeris files');
  } else {
    console.log('Both Moshier and Swiss Ephemeris available');
  }

  if (year < 1800 || year > 2400) {
    console.log('Outside standard Swiss Ephemeris files');
    console.log('Need additional .se1 files for this period');
  }
}

checkEphemerisCoverage(1500);
// Output: Both Moshier and Swiss Ephemeris available
//         Outside standard Swiss Ephemeris files
//         Need additional .se1 files for this period
```

## File Loading Performance

### Node.js
- **First calculation:** ~10-50ms (file loading)
- **Subsequent:** <1ms (cached in memory)
- **Files loaded once** per process

### Browser
- **loadStandardEphemeris():** ~2-5 seconds (network + processing)
- **After loading:** <1ms per calculation
- **Files cached** in WASM filesystem

### Optimization

```typescript
// Browser: Load once, use many times
const swe = new SwissEphemeris();
await swe.init();

// Optional: Load Swiss Ephemeris if needed
if (needHighPrecision || needAsteroids) {
  console.log('Loading Swiss Ephemeris...');
  await swe.loadStandardEphemeris();
  console.log('Loaded!');
}

// Now use for all calculations
const positions = planets.map(planet =>
  swe.calculatePosition(jd, planet)
);
```

## Troubleshooting

### "Ephemeris file not found"

**Node.js:**
```typescript
// Make sure you're using the default ephemeris
// Don't call setEphemerisPath unless you have custom files

// ❌ Don't do this (unless you have files there)
setEphemerisPath('/custom/path');

// ✅ Do this (use bundled files)
// Don't call setEphemerisPath at all, or:
setEphemerisPath(null);
```

**Browser:**
```typescript
// Make sure files loaded successfully
try {
  await swe.loadStandardEphemeris();
  console.log('Swiss Ephemeris loaded');
} catch (error) {
  console.error('Failed to load ephemeris:', error);
  console.log('Falling back to Moshier');
}
```

### Asteroids Not Available

Asteroids require Swiss Ephemeris files:

```typescript
// ❌ Won't work - Moshier doesn't support asteroids
const chiron = calculatePosition(jd, Asteroid.Chiron, CalculationFlag.MoshierEphemeris);

// ✅ Works - Swiss Ephemeris supports asteroids
const chiron = calculatePosition(jd, Asteroid.Chiron, CalculationFlag.SwissEphemeris);
```

In browser, load files first:
```typescript
await swe.loadStandardEphemeris();  // Required for asteroids
const chiron = swe.calculatePosition(jd, Asteroid.Chiron, CalculationFlag.SwissEphemeris);
```

### Historical Dates

For dates before 1800 or after 2400:

**Node.js:** Download extended ephemeris files from [astro.com](https://www.astro.com/ftp/swisseph/ephe/) and use `setEphemerisPath()`.

**Browser:** Load additional files:
```typescript
await swe.loadEphemerisFiles([
  { name: 'sepl_00.se1', url: 'https://your-cdn.com/sepl_00.se1' },  // 0-1600 AD
  // ... other files as needed
]);
```

## Best Practices

1. **Node.js:** Use default bundled Swiss Ephemeris (no setup needed)
2. **Browser:** Start with Moshier, load Swiss Ephemeris only if needed
3. **Performance:** Load files once, reuse for all calculations
4. **Date ranges:** Check coverage before using historical dates
5. **Asteroids:** Require Swiss Ephemeris files
6. **Offline apps:** Use Moshier (no files needed)

## Summary Table

| Feature | Node.js | Browser (Moshier) | Browser (Swiss) |
|---------|---------|-------------------|-----------------|
| **Setup** | None | `await init()` | `await init()` + `await loadStandardEphemeris()` |
| **Precision** | Highest | Sub-arcsecond | Highest |
| **Bundle size** | N/A | ~250 KB | +2 MB |
| **Asteroids** | ✅ Yes | ❌ No | ✅ Yes |
| **Offline** | ✅ Yes | ✅ Yes | ❌ No (needs CDN) |
| **Date range** | 13201 BC - 17191 AD | 3000 BC - 3000 AD | 13201 BC - 17191 AD |

## See Also

- [Getting Started Guide](../getting-started.md)
- [@swisseph/node API Reference](../api/node.md)
- [@swisseph/browser API Reference](../api/browser.md)
- [Official Swiss Ephemeris Documentation](https://www.astro.com/swisseph/)
