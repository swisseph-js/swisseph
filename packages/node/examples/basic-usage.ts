/**
 * Swiss Ephemeris Basic Usage Example
 *
 * This example demonstrates the modern object-based API with enums and
 * structured return types.
 */

import {
  setEphemerisPath,
  julianDay,
  julianDayToDate,
  calculatePosition,
  calculateHouses,
  findNextLunarEclipse,
  getCelestialBodyName,
  close,
  Planet,
  HouseSystem,
  CalculationFlag,
} from '@swisseph/node';
import * as path from 'path';

// Set ephemeris path
setEphemerisPath(path.join(__dirname, '..', 'ephemeris'));

console.log('=== Swiss Ephemeris v2.0 - Modern TypeScript API ===\n');

// Example 1: Date conversion
console.log('Example 1: Date Conversion');
console.log('---------------------------');
const jd = julianDay(2007, 3, 3);
console.log(`Date: 2007-03-03`);
console.log(`Julian Day: ${jd}`);

const date = julianDayToDate(jd);
console.log(`Converted back: ${date.toString()}`);
console.log(`ISO format: ${date.toISOString()}`);
console.log();

// Example 2: Calculate planetary positions with enums
console.log('Example 2: Planetary Positions (2007-03-03)');
console.log('--------------------------------------------');

const planets = [
  Planet.Sun,
  Planet.Moon,
  Planet.Mercury,
  Planet.Venus,
  Planet.Mars,
  Planet.Jupiter,
  Planet.Saturn,
];

planets.forEach((planetId) => {
  const name = getCelestialBodyName(planetId);
  const position = calculatePosition(jd, planetId);

  console.log(
    `${name.padEnd(10)}: ` +
      `Longitude ${position.longitude.toFixed(4)}°, ` +
      `Latitude ${position.latitude.toFixed(4)}°, ` +
      `Distance ${position.distance.toFixed(6)} AU`
  );
});
console.log();

// Example 3: Find next lunar eclipse
console.log('Example 3: Next Lunar Eclipse after 2007-03-03');
console.log('-----------------------------------------------');

const eclipse = findNextLunarEclipse(jd);
const eclipseDate = julianDayToDate(eclipse.maximum);

console.log(`Eclipse type: ${eclipse.isTotal() ? 'Total' : eclipse.isPartial() ? 'Partial' : 'Penumbral'}`);
console.log(`Maximum eclipse: ${eclipseDate.toString()}`);

if (eclipse.isTotal()) {
  console.log(`Totality duration: ${eclipse.getTotalityDuration().toFixed(2)} hours`);
}
console.log(`Partial phase duration: ${eclipse.getPartialDuration().toFixed(2)} hours`);
console.log();

// Example 4: Calculate house cusps with enum
console.log('Example 4: House Cusps (Placidus System)');
console.log('-----------------------------------------');
console.log('Location: New York (40.7128°N, 74.0060°W)');

const houses = calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);

console.log(`Ascendant: ${houses.ascendant.toFixed(4)}°`);
console.log(`MC (Midheaven): ${houses.mc.toFixed(4)}°`);
console.log(`ARMC: ${houses.armc.toFixed(4)}°`);
console.log(`Vertex: ${houses.vertex.toFixed(4)}°`);

console.log('\nHouse Cusps:');
for (let i = 1; i <= 12; i++) {
  console.log(`  House ${String(i).padStart(2, ' ')}: ${houses.cusps[i].toFixed(4)}°`);
}
console.log();

// Example 5: Using different ephemeris with flag enums
console.log('Example 5: Using Moshier Ephemeris (No Files Required)');
console.log('------------------------------------------------------');

const sunMoshier = calculatePosition(
  jd,
  Planet.Sun,
  CalculationFlag.MoshierEphemeris | CalculationFlag.Speed
);

console.log(`Sun position (Moshier): ${sunMoshier.longitude.toFixed(4)}°`);
console.log(`Sun speed: ${sunMoshier.longitudeSpeed.toFixed(6)}°/day`);
console.log(`Flags used: ${sunMoshier.flags & CalculationFlag.MoshierEphemeris ? 'Moshier' : 'Swiss Ephemeris'}`);
console.log();

// Example 6: Object destructuring
console.log('Example 6: Elegant Object Destructuring');
console.log('---------------------------------------');

const { longitude, latitude, distance } = calculatePosition(jd, Planet.Mars);
console.log(`Mars: ${longitude.toFixed(2)}° longitude, ${latitude.toFixed(2)}° latitude, ${distance.toFixed(4)} AU`);
console.log();

// Clean up
close();
console.log('=== Demo Complete ===');
