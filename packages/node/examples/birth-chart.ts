/**
 * Birth Chart Calculation Example (v2.0)
 *
 * This example demonstrates calculating a complete birth chart
 * using the modern object-based API.
 */

import {
  setEphemerisPath,
  julianDay,
  calculatePosition,
  calculateHouses,
  getCelestialBodyName,
  close,
  Planet,
  LunarPoint,
  Asteroid,
  HouseSystem,
  CalculationFlag,
  type PlanetaryPosition,
  type HouseData,
} from '@swisseph/node';
import * as path from 'path';

// Set ephemeris path
setEphemerisPath(path.join(__dirname, '..', 'ephemeris'));

// Birth data
interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  latitude: number;
  longitude: number;
  location: string;
}

const birthData: BirthData = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 14.5, // 14:30 (2:30 PM)
  latitude: 40.7128, // New York
  longitude: -74.006,
  location: 'New York, NY, USA',
};

console.log('=== Birth Chart Calculator (v2.0) ===\n');
console.log('Birth Information:');
console.log(`Date: ${birthData.year}-${String(birthData.month).padStart(2, '0')}-${String(birthData.day).padStart(2, '0')}`);
console.log(`Time: ${Math.floor(birthData.hour)}:${String(Math.floor((birthData.hour % 1) * 60)).padStart(2, '0')}`);
console.log(`Location: ${birthData.location}`);
console.log(`Coordinates: ${birthData.latitude}°N, ${Math.abs(birthData.longitude)}°W`);
console.log();

// Calculate Julian day
const jd = julianDay(birthData.year, birthData.month, birthData.day, birthData.hour);

// Define celestial bodies to calculate
const celestialBodies = [
  { id: Planet.Sun, name: 'Sun' },
  { id: Planet.Moon, name: 'Moon' },
  { id: Planet.Mercury, name: 'Mercury' },
  { id: Planet.Venus, name: 'Venus' },
  { id: Planet.Mars, name: 'Mars' },
  { id: Planet.Jupiter, name: 'Jupiter' },
  { id: Planet.Saturn, name: 'Saturn' },
  { id: Planet.Uranus, name: 'Uranus' },
  { id: Planet.Neptune, name: 'Neptune' },
  { id: Planet.Pluto, name: 'Pluto' },
  { id: LunarPoint.TrueNode, name: 'North Node' },
  { id: Asteroid.Chiron, name: 'Chiron' },
];

// Calculate planetary positions
console.log('Planetary Positions:');
console.log('-------------------');

interface ChartPosition extends PlanetaryPosition {
  name: string;
  sign: string;
  degrees: number;
}

const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function getZodiacSign(longitude: number): { sign: string; degrees: number } {
  const signIndex = Math.floor(longitude / 30);
  const degrees = longitude % 30;
  return {
    sign: zodiacSigns[signIndex],
    degrees,
  };
}

const positions: ChartPosition[] = [];

celestialBodies.forEach((body) => {
  const position = calculatePosition(
    jd,
    body.id,
    CalculationFlag.SwissEphemeris | CalculationFlag.Speed
  );

  const { sign, degrees } = getZodiacSign(position.longitude);

  const chartPosition: ChartPosition = {
    ...position,
    name: body.name,
    sign,
    degrees,
  };

  positions.push(chartPosition);

  const degreeStr = `${Math.floor(degrees)}°${String(Math.floor((degrees % 1) * 60)).padStart(2, '0')}'`;

  console.log(
    `${body.name.padEnd(15)}: ${degreeStr.padEnd(8)} ${sign.padEnd(12)} ` +
      `(${position.longitude.toFixed(4)}°)`
  );
});

console.log();

// Calculate houses
console.log('House Cusps (Placidus):');
console.log('----------------------');

const houses = calculateHouses(
  jd,
  birthData.latitude,
  birthData.longitude,
  HouseSystem.Placidus
);

// Angles
console.log('\nAngles:');
const ascSign = getZodiacSign(houses.ascendant);
const mcSign = getZodiacSign(houses.mc);

console.log(
  `Ascendant (ASC): ${Math.floor(ascSign.degrees)}°${String(Math.floor((ascSign.degrees % 1) * 60)).padStart(2, '0')}' ${ascSign.sign}`
);
console.log(
  `Midheaven (MC):  ${Math.floor(mcSign.degrees)}°${String(Math.floor((mcSign.degrees % 1) * 60)).padStart(2, '0')}' ${mcSign.sign}`
);

// House cusps
console.log('\nHouse Cusps:');
for (let i = 1; i <= 12; i++) {
  const cuspSign = getZodiacSign(houses.cusps[i]);
  const degreeStr = `${Math.floor(cuspSign.degrees)}°${String(Math.floor((cuspSign.degrees % 1) * 60)).padStart(2, '0')}'`;

  console.log(`House ${String(i).padStart(2, ' ')}: ${degreeStr.padEnd(8)} ${cuspSign.sign}`);
}

console.log();

// Calculate aspects (simple major aspects)
console.log('Major Aspects:');
console.log('-------------');

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

const aspectTypes = [
  { name: 'Conjunction', angle: 0, orb: 8 },
  { name: 'Opposition', angle: 180, orb: 8 },
  { name: 'Trine', angle: 120, orb: 8 },
  { name: 'Square', angle: 90, orb: 8 },
  { name: 'Sextile', angle: 60, orb: 6 },
];

function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

function getAspect(long1: number, long2: number): Aspect | null {
  const diff = normalizeAngle(Math.abs(long1 - long2));
  const actualDiff = Math.min(diff, 360 - diff);

  for (const aspectType of aspectTypes) {
    const orb = Math.abs(actualDiff - aspectType.angle);
    if (orb <= aspectType.orb) {
      return {
        planet1: '',
        planet2: '',
        type: aspectType.name,
        orb,
      };
    }
  }

  return null;
}

const aspects: Aspect[] = [];

for (let i = 0; i < positions.length; i++) {
  for (let j = i + 1; j < positions.length; j++) {
    const aspect = getAspect(positions[i].longitude, positions[j].longitude);
    if (aspect) {
      aspects.push({
        ...aspect,
        planet1: positions[i].name,
        planet2: positions[j].name,
      });
    }
  }
}

// Sort by orb (tightest aspects first)
aspects.sort((a, b) => a.orb - b.orb);

// Show top 10 aspects
aspects.slice(0, 10).forEach((aspect) => {
  console.log(
    `${aspect.planet1.padEnd(15)} ${aspect.type.padEnd(12)} ${aspect.planet2.padEnd(15)} ` +
      `(orb: ${aspect.orb.toFixed(2)}°)`
  );
});

console.log();

// Summary
console.log('Chart Summary:');
console.log('-------------');
console.log(`Sun Sign: ${positions.find((p) => p.name === 'Sun')?.sign}`);
console.log(`Moon Sign: ${positions.find((p) => p.name === 'Moon')?.sign}`);
console.log(`Rising Sign (Ascendant): ${ascSign.sign}`);
console.log(`Total Aspects Found: ${aspects.length}`);

console.log();

// Clean up
close();
console.log('=== Chart Complete ===');
