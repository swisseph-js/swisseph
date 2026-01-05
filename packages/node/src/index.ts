/**
 * Swiss Ephemeris for Node.js - Modern TypeScript API
 *
 * This module provides a modern, type-safe API for Swiss Ephemeris astronomical calculations.
 * It wraps the native C library with developer-friendly TypeScript interfaces.
 */

import {
  CalendarType,
  Planet,
  CelestialBody,
  HouseSystem,
  HousePoint,
  CalculationFlagInput,
  EclipseTypeFlagInput,
  PlanetaryPosition,
  HouseData,
  LunarEclipse,
  SolarEclipse,
  DateTime,
  ExtendedDateTime,
  normalizeFlags,
  normalizeEclipseTypes,
  LunarEclipseImpl,
  SolarEclipseImpl,
  DateTimeImpl,
  CalculationFlag,
  CommonCalculationFlags,
} from '@swisseph/core';

import * as path from 'path';

// Import the native addon
const binding = require('node-gyp-build')(path.join(__dirname, '..'));

// Track if ephemeris path has been explicitly set
let ephemerisPathSet = false;

/**
 * Get the path to bundled ephemeris files
 * @internal
 */
function getBundledEphemerisPath(): string {
  // The ephemeris files are bundled in the package at ../ephemeris
  return path.join(__dirname, '..', 'ephemeris');
}

/**
 * Initialize ephemeris with bundled files if not already set and using Swiss Ephemeris
 * @internal
 */
function ensureEphemerisInitialized(flags: number): void {
  // Only auto-load if using Swiss Ephemeris (not Moshier) and path not explicitly set
  const usingMoshier = (flags & CalculationFlag.MoshierEphemeris) !== 0;

  if (!ephemerisPathSet && !usingMoshier) {
    const bundledPath = getBundledEphemerisPath();
    binding.set_ephe_path(bundledPath);
    ephemerisPathSet = true;
  }
}

/**
 * Set the directory path for ephemeris files
 *
 * By default, @swisseph/node uses bundled ephemeris files included with the package.
 * Call this function only if you want to use custom ephemeris files.
 *
 * @param path - Directory path containing ephemeris files, or null/undefined for bundled files
 *
 * @example
 * // Use custom ephemeris files
 * setEphemerisPath('/path/to/custom/ephemeris');
 *
 * // Revert to bundled files
 * setEphemerisPath(null);
 */
export function setEphemerisPath(path?: string | null): void {
  if (path === null || path === undefined) {
    // Use bundled ephemeris
    const bundledPath = getBundledEphemerisPath();
    binding.set_ephe_path(bundledPath);
  } else {
    // Use custom path
    binding.set_ephe_path(path);
  }
  ephemerisPathSet = true;
}

/**
 * Calculate Julian day number from calendar date
 *
 * The Julian day number is a continuous count of days since the beginning
 * of the Julian period (January 1, 4713 BCE, proleptic Julian calendar).
 *
 * @param year - Year (negative for BCE)
 * @param month - Month (1-12)
 * @param day - Day (1-31)
 * @param hour - Hour as decimal (0.0-23.999...)
 * @param calendarType - Calendar system (default: Gregorian)
 * @returns Julian day number
 *
 * @example
 * const jd = julianDay(2007, 3, 3);
 * console.log(jd); // 2454162.5
 *
 * const jdWithTime = julianDay(2007, 3, 3, 14.5);
 * console.log(jdWithTime); // 2454163.104166667
 */
export function julianDay(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  calendarType: CalendarType = CalendarType.Gregorian
): number {
  return binding.julday(year, month, day, hour, calendarType);
}

/**
 * Convert Julian day number to calendar date
 *
 * @param jd - Julian day number
 * @param calendarType - Calendar system (default: Gregorian)
 * @returns DateTime object with year, month, day, and hour
 *
 * @example
 * const date = julianDayToDate(2454162.5);
 * console.log(date);
 * // { year: 2007, month: 3, day: 3, hour: 0, calendarType: CalendarType.Gregorian }
 *
 * console.log(date.toString());
 * // "2007-03-03 0.000000 hours (Gregorian)"
 */
export function julianDayToDate(
  jd: number,
  calendarType: CalendarType = CalendarType.Gregorian
): ExtendedDateTime {
  const result = binding.revjul(jd, calendarType) as [number, number, number, number];
  return new DateTimeImpl(result[0], result[1], result[2], result[3], calendarType);
}

/**
 * Calculate planetary positions
 *
 * This is the main function for calculating positions of planets, asteroids,
 * and other celestial bodies.
 *
 * @param julianDay - Julian day number in Universal Time
 * @param body - Celestial body to calculate (use Planet, Asteroid, etc. enums)
 * @param flags - Calculation flags (default: SwissEphemeris with speed)
 * @returns PlanetaryPosition object with longitude, latitude, distance, and speeds
 *
 * @example
 * // Calculate Sun position
 * const sun = calculatePosition(jd, Planet.Sun);
 * console.log(`Sun longitude: ${sun.longitude}°`);
 *
 * // Calculate with specific flags
 * const moon = calculatePosition(
 *   jd,
 *   Planet.Moon,
 *   CalculationFlag.MoshierEphemeris | CalculationFlag.Speed
 * );
 *
 * // Using flag builder
 * import { CalculationFlags } from 'swisseph';
 * const flags = CalculationFlags.from(
 *   CalculationFlag.SwissEphemeris,
 *   CalculationFlag.Speed,
 *   CalculationFlag.Equatorial
 * );
 * const mars = calculatePosition(jd, Planet.Mars, flags);
 */
export function calculatePosition(
  julianDay: number,
  body: CelestialBody,
  flags: CalculationFlagInput = CommonCalculationFlags.DefaultSwissEphemeris
): PlanetaryPosition {
  const normalizedFlags = normalizeFlags(flags);
  ensureEphemerisInitialized(normalizedFlags);
  const result = binding.calc_ut(julianDay, body, normalizedFlags) as [number[], number];
  const [xx, retFlags] = result;

  return {
    longitude: xx[0],
    latitude: xx[1],
    distance: xx[2],
    longitudeSpeed: xx[3],
    latitudeSpeed: xx[4],
    distanceSpeed: xx[5],
    flags: retFlags,
  };
}

/**
 * Calculate house cusps and angles
 *
 * Houses divide the ecliptic into 12 sections based on the observer's
 * location and the time of day.
 *
 * @param julianDay - Julian day number in Universal Time
 * @param latitude - Geographic latitude (positive = north, negative = south)
 * @param longitude - Geographic longitude (positive = east, negative = west)
 * @param houseSystem - House system to use (default: Placidus)
 * @returns HouseData object with cusps and angles
 *
 * @example
 * // Calculate houses for New York
 * const houses = calculateHouses(jd, 40.7128, -74.0060, HouseSystem.Placidus);
 * console.log(`Ascendant: ${houses.ascendant}°`);
 * console.log(`MC: ${houses.mc}°`);
 *
 * // Access house cusps
 * for (let i = 1; i <= 12; i++) {
 *   console.log(`House ${i}: ${houses.cusps[i]}°`);
 * }
 *
 * // Try different house system
 * const wholeSigns = calculateHouses(jd, 40.7128, -74.0060, HouseSystem.WholeSign);
 */
export function calculateHouses(
  julianDay: number,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem = HouseSystem.Placidus
): HouseData {
  const result = binding.houses(julianDay, latitude, longitude, houseSystem) as [
    number[],
    number[]
  ];
  const [cusps, ascmc] = result;

  return {
    cusps,
    ascendant: ascmc[HousePoint.Ascendant],
    mc: ascmc[HousePoint.MC],
    armc: ascmc[HousePoint.ARMC],
    vertex: ascmc[HousePoint.Vertex],
    equatorialAscendant: ascmc[HousePoint.EquatorialAscendant],
    coAscendant1: ascmc[HousePoint.CoAscendant1],
    coAscendant2: ascmc[HousePoint.CoAscendant2],
    polarAscendant: ascmc[HousePoint.PolarAscendant],
    houseSystem,
  };
}

/**
 * Find the next lunar eclipse
 *
 * Searches for the next lunar eclipse after the given Julian day.
 *
 * @param startJulianDay - Julian day to start search from
 * @param flags - Calculation flags (default: SwissEphemeris)
 * @param eclipseType - Filter by eclipse type (0 = all types)
 * @param backward - Search backward in time if true
 * @returns LunarEclipse object with times and convenience methods
 *
 * @example
 * // Find next lunar eclipse
 * const jd = julianDay(2025, 1, 1);
 * const eclipse = findNextLunarEclipse(jd);
 *
 * console.log(`Eclipse maximum: ${julianDayToDate(eclipse.maximum)}`);
 * console.log(`Is total: ${eclipse.isTotal()}`);
 * console.log(`Totality duration: ${eclipse.getTotalityDuration()} hours`);
 *
 * // Find previous lunar eclipse
 * const previousEclipse = findNextLunarEclipse(jd, undefined, 0, true);
 */
export function findNextLunarEclipse(
  startJulianDay: number,
  flags: CalculationFlagInput = CalculationFlag.SwissEphemeris,
  eclipseType: EclipseTypeFlagInput = 0,
  backward: boolean = false
): LunarEclipse {
  const normalizedFlags = normalizeFlags(flags);
  ensureEphemerisInitialized(normalizedFlags);
  const normalizedEclipseType = normalizeEclipseTypes(eclipseType);

  const result = binding.lun_eclipse_when(
    startJulianDay,
    normalizedFlags,
    normalizedEclipseType,
    backward ? 1 : 0
  ) as [number, number[]];

  const [retFlag, tret] = result;

  return new LunarEclipseImpl(
    retFlag,
    tret[0], // maximum
    tret[1], // partial begin
    tret[2], // partial end
    tret[3], // total begin
    tret[4], // total end
    tret[5], // penumbral begin
    tret[6]  // penumbral end
  );
}

/**
 * Find the next solar eclipse globally
 *
 * Searches for the next solar eclipse visible anywhere on Earth.
 *
 * @param startJulianDay - Julian day to start search from
 * @param flags - Calculation flags (default: SwissEphemeris)
 * @param eclipseType - Filter by eclipse type (0 = all types)
 * @param backward - Search backward in time if true
 * @returns SolarEclipse object with times and convenience methods
 *
 * @example
 * // Find next solar eclipse
 * const jd = julianDay(2025, 1, 1);
 * const eclipse = findNextSolarEclipse(jd);
 *
 * console.log(`Eclipse maximum: ${julianDayToDate(eclipse.maximum)}`);
 * console.log(`Is total: ${eclipse.isTotal()}`);
 * console.log(`Is annular: ${eclipse.isAnnular()}`);
 * console.log(`Is central: ${eclipse.isCentral()}`);
 */
export function findNextSolarEclipse(
  startJulianDay: number,
  flags: CalculationFlagInput = CalculationFlag.SwissEphemeris,
  eclipseType: EclipseTypeFlagInput = 0,
  backward: boolean = false
): SolarEclipse {
  const normalizedFlags = normalizeFlags(flags);
  ensureEphemerisInitialized(normalizedFlags);
  const normalizedEclipseType = normalizeEclipseTypes(eclipseType);

  const result = binding.sol_eclipse_when_glob(
    startJulianDay,
    normalizedFlags,
    normalizedEclipseType,
    backward ? 1 : 0
  ) as [number, number[]];

  const [retFlag, tret] = result;

  return new SolarEclipseImpl(
    retFlag,
    tret[0], // maximum
    tret[1], // partial begin
    tret[2], // partial end
    tret[3], // central begin
    tret[4], // central end
    tret[5], // center line begin
    tret[6]  // center line end
  );
}

/**
 * Get the name of a celestial body
 *
 * @param body - Celestial body identifier
 * @returns Name of the body as a string
 *
 * @example
 * const name = getCelestialBodyName(Planet.Mars);
 * console.log(name); // "Mars"
 *
 * const sunName = getCelestialBodyName(Planet.Sun);
 * console.log(sunName); // "Sun"
 */
export function getCelestialBodyName(body: CelestialBody): string {
  return binding.get_planet_name(body);
}

/**
 * Close Swiss Ephemeris and free resources
 *
 * Call this function when you're done using Swiss Ephemeris to free
 * allocated resources.
 *
 * @example
 * // After all calculations are done
 * close();
 */
export function close(): void {
  binding.close();
}

// Re-export all types for convenience
export * from '@swisseph/core';
