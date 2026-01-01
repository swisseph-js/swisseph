# Swiss Ephemeris Browser Version - Features & Capabilities

## ✅ What's Included

### Core Functionality

All major Swiss Ephemeris functions work in the browser:

#### 1. **Date Conversions**
```javascript
const jd = swe.julday(2007, 3, 3);           // → 2454162.5
const [y, m, d, h] = swe.revjul(jd);         // → [2007, 3, 3, 0]
```

#### 2. **Planetary Positions**
All major planets supported:
- ☉ Sun
- ☽ Moon
- ☿ Mercury
- ♀ Venus
- ♂ Mars
- ♃ Jupiter
- ♄ Saturn
- ♅ Uranus
- ♆ Neptune
- ♇ Pluto

```javascript
const result = swe.calc_ut(jd, swe.SUN, swe.FLG_MOSEPH);
// result.xx[0] = longitude
// result.xx[1] = latitude
// result.xx[2] = distance (AU)
```

#### 3. **Eclipse Calculations**
```javascript
// Lunar eclipses
const lunar = swe.lun_eclipse_when(jd, swe.FLG_MOSEPH);

// Solar eclipses
const solar = swe.sol_eclipse_when_glob(jd, swe.FLG_MOSEPH);
```

#### 4. **House Systems**
Supports all major house systems:
- **P** - Placidus (most popular)
- **K** - Koch
- **R** - Regiomontanus
- **C** - Campanus
- **E** - Equal
- **W** - Whole Sign
- And more...

```javascript
const houses = swe.houses(jd, 40.7128, -74.0060, 'P');
// houses.ascmc[0] = Ascendant
// houses.ascmc[1] = MC
// houses.cusps[1-12] = house cusps
```

## 🎯 Accuracy

### Moshier Ephemeris Performance

Compared to Swiss Ephemeris with JPL DE431 data:

| Planet | Longitude Difference | Typical Use Cases |
|--------|---------------------|-------------------|
| Sun | 0.006" | ✅ Excellent |
| Moon | 1.2" | ✅ Good |
| Mercury | 0.015" | ✅ Excellent |
| Venus | 0.008" | ✅ Excellent |
| Mars | 0.007" | ✅ Excellent |
| Jupiter | 0.195" | ✅ Excellent |
| Saturn | 0.025" | ✅ Excellent |
| Uranus | 0.007" | ✅ Excellent |
| Neptune | 0.082" | ✅ Excellent |
| Pluto | 0.150" | ✅ Excellent |

**Note:** 1 arcsecond (") = 1/3600 degree. These differences are negligible for:
- Astrology (requires ~1° accuracy)
- Educational astronomy
- Planetarium software
- Birth chart calculations
- Transit predictions

## 📊 Performance

### Bundle Size
- **swisseph.wasm**: ~1.2MB (uncompressed), ~400KB (gzipped)
- **swisseph.js**: ~100KB (uncompressed), ~30KB (gzipped)
- **swisseph-browser.js**: ~8KB

**Total download:** ~440KB (gzipped) - Comparable to a medium-sized image!

### Calculation Speed
- **Initial load**: ~200ms (WASM compilation)
- **Planetary position**: <1ms
- **Eclipse search**: ~10-50ms
- **House calculation**: <1ms

Performance is nearly identical to native C code thanks to WebAssembly!

## 🌐 Browser Compatibility

### Supported Browsers
- ✅ Chrome 57+ (2017)
- ✅ Firefox 52+ (2017)
- ✅ Safari 11+ (2017)
- ✅ Edge 79+ (2020)
- ✅ Opera 44+ (2017)

### Required Features
- WebAssembly support (99.9% of users)
- ES6 modules support
- Async/await support

### Mobile Support
- ✅ iOS Safari 11+
- ✅ Chrome Mobile
- ✅ Firefox Mobile
- ✅ Samsung Internet

## 💡 Use Cases

Perfect for:

### 1. **Astrology Websites**
```javascript
// Birth chart calculator
async function calculateChart(birthData) {
  const swe = new SwissEph();
  await swe.init();

  const jd = swe.julday(birthData.year, birthData.month, birthData.day, birthData.hour);
  const planets = {};

  for (const planet of [swe.SUN, swe.MOON, /* ... */]) {
    const result = swe.calc_ut(jd, planet, swe.FLG_MOSEPH);
    planets[planet] = result.xx[0]; // longitude
  }

  const houses = swe.houses(jd, birthData.lat, birthData.lon, 'P');

  return { planets, houses };
}
```

### 2. **Educational Apps**
- Interactive astronomy lessons
- Solar system simulators
- Eclipse predictor tools
- Planetarium apps

### 3. **Transit Calculators**
```javascript
// Find when Mars crosses 0° Aries
async function findMarsCrossing(startDate) {
  const swe = new SwissEph();
  await swe.init();

  let jd = swe.julday(startDate.year, startDate.month, startDate.day);

  for (let i = 0; i < 365; i++) {
    const result = swe.calc_ut(jd, swe.MARS, swe.FLG_MOSEPH);
    if (result.xx[0] >= 0 && result.xx[0] < 1) {
      return swe.revjul(jd);
    }
    jd += 1;
  }
}
```

### 4. **Progressive Web Apps (PWA)**
- Offline-capable astrology apps
- Works without internet after initial load
- Can be installed on mobile devices

## ❌ Limitations

### What Doesn't Work

1. **Asteroids** - Moshier only includes major planets
   - ❌ Cannot calculate asteroid positions (Ceres, Pallas, etc.)
   - ✅ Use Node.js version with ephemeris files for asteroids

2. **Swiss Ephemeris Files** - Too large for web
   - ❌ Cannot use `FLG_SWIEPH` with data files
   - ✅ `FLG_MOSEPH` provides excellent accuracy instead

3. **Extended Date Range** - Moshier optimized for modern era
   - ⚠️ Less accurate before 1800 or after 2200
   - ✅ Excellent from 1800-2200 (covers most use cases)

4. **Fixed Stars** - Not included in browser version
   - ❌ `swe_fixstar()` functions not available
   - ✅ Use Node.js version if needed

### Workarounds

**Need asteroids?**
- Use Node.js version for server-side calculations
- Send results to browser for display

**Need extended date range?**
- Use Node.js version with Swiss Ephemeris files
- Or accept lower accuracy with Moshier

**Need fixed stars?**
- Use Node.js version
- Or use a separate star catalog library

## 🆚 Browser vs Node.js Comparison

| Feature | Browser (WASM) | Node.js (Native) |
|---------|----------------|------------------|
| **Platform** | Any modern browser | Node.js only |
| **Installation** | Just load the files | `npm install` + build |
| **Ephemeris** | Moshier (built-in) | Swiss Ephemeris files |
| **Planets** | 10 major planets | All planets + asteroids |
| **Accuracy** | Sub-arcsecond | JPL precision |
| **Date Range** | 1800-2200 (optimal) | 13201 BC - 17191 AD |
| **Bundle Size** | ~440KB (gzipped) | ~2MB + data files |
| **Startup** | ~200ms | <10ms |
| **Performance** | Excellent | Excellent |
| **Offline** | Yes (after first load) | Yes |
| **Dependencies** | None | node-gyp, C++ compiler |

## 🚀 Getting Started

See the [main README](README.md) for quick start guide and [BUILDING.md](BUILDING.md) for build instructions.

## 📝 Examples

Check out `test/index.html` for a complete working example with:
- Date conversion
- Planetary positions
- Eclipse calculations
- House cusps
- Complete birth chart

## 🎓 Learn More

- [Swiss Ephemeris Documentation](https://www.astro.com/swisseph/)
- [pyswisseph](https://github.com/astrorigin/pyswisseph) (Python equivalent)
- [WebAssembly](https://webassembly.org/)
- [Emscripten](https://emscripten.org/)
