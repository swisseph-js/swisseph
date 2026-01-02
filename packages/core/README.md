# @swisseph/core

TypeScript types and interfaces for Swiss Ephemeris astronomical calculations.

## Overview

This package provides shared TypeScript type definitions, enums, and interfaces used across the Swiss Ephemeris ecosystem. It contains no implementation code - only type definitions that enable type-safe astronomical calculations.

## Installation

```bash
npm install @swisseph/core
```

## Usage

This package is primarily used as a dependency for:
- `@swisseph/node` - Swiss Ephemeris for Node.js
- `@swisseph/browser` - Swiss Ephemeris for browsers (WebAssembly)

You typically don't need to install this directly unless you're building custom integrations.

```typescript
import {
  Planet,
  HouseSystem,
  CalendarType,
  CalculationFlag,
  PlanetaryPosition,
  HouseData
} from '@swisseph/core';
```

## Included Types

### Enums
- `Planet` - Major planets and luminaries (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)
- `LunarPoint` - Lunar nodes and apogees (True Node, Mean Node, Apogee, etc.)
- `Asteroid` - Main belt asteroids (Chiron, Pholus, Ceres, Pallas, Juno, Vesta)
- `FictitiousPlanet` - Uranian astrology bodies
- `HouseSystem` - All house systems (Placidus, Koch, Whole Sign, Equal, etc.)
- `HousePoint` - House cusps and angles (Ascendant, MC, Vertex, etc.)
- `CalculationFlag` - Bitwise flags for calculations (SwissEphemeris, Moshier, Speed, etc.)
- `CalendarType` - Julian vs Gregorian calendar systems
- `EclipseType` - Eclipse type flags (Total, Partial, Annular, etc.)

### Interfaces
- `PlanetaryPosition` - Results from planetary position calculations
- `HouseData` - House cusps and angles with named properties
- `DateTime` - Calendar date representation
- `LunarEclipse` - Lunar eclipse details with convenience methods
- `SolarEclipse` - Solar eclipse details with convenience methods

## Type-Safe API

All enums are designed to work with TypeScript's type system while remaining compatible with the underlying Swiss Ephemeris C library:

```typescript
// Type-safe celestial body selection
const sun: CelestialBody = Planet.Sun;
const moon: CelestialBody = Planet.Moon;

// Type-safe house system selection
const houses: HouseSystem = HouseSystem.Placidus;

// Type-safe calculation flags
const flags: CalculationFlagInput = CalculationFlag.SwissEphemeris | CalculationFlag.Speed;
```

## Documentation

Complete documentation is available in the [GitHub repository](https://github.com/swisseph-js/swisseph/tree/main/docs):

- **[Getting Started Guide](https://github.com/swisseph-js/swisseph/blob/main/docs/getting-started.md)** - Installation and quick start
- **[Type Reference](https://github.com/swisseph-js/swisseph/blob/main/docs/api/core.md)** - Complete types and enums documentation
- **API References:**
  - [`@swisseph/node` API](https://github.com/swisseph-js/swisseph/blob/main/docs/api/node.md) - Node.js package documentation
  - [`@swisseph/browser` API](https://github.com/swisseph-js/swisseph/blob/main/docs/api/browser.md) - Browser package documentation

## License

AGPL-3.0 - See LICENSE file for details

Swiss Ephemeris is a product of Astrodienst AG, Zurich, Switzerland.

## Links
- [Swiss Ephemeris](https://www.astro.com/swisseph/)
