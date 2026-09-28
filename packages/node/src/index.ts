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
  RiseTransitSet,
  normalizeFlags,
  normalizeEclipseTypes,
  LunarEclipseImpl,
  SolarEclipseImpl,
  DateTimeImpl,
  CalculationFlag,
  CommonCalculationFlags,
  EclipseType,
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
  // Validate inputs are valid numbers
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(hour)) {
    throw new TypeError(
      `julianDay requires finite numbers. Received: ` +
      `year=${year}, month=${month}, day=${day}, hour=${hour}`
    );
  }

  return binding.julday(year, month, day, hour, calendarType);
}

/**
 * Calculate Julian day number from a JavaScript Date object
 *
 * Convenience function that converts a JavaScript Date to Julian day number.
 * The Date is interpreted as UTC.
 *
 * @param date - JavaScript Date object (interpreted as UTC)
 * @param calendarType - Calendar system (default: Gregorian)
 * @returns Julian day number
 *
 * @example
 * // From Date object
 * const date = new Date('1990-05-15T14:30:00Z');
 * const jd = dateToJulianDay(date);
 *
 * // From timestamp
 * const now = new Date();
 * const jdNow = dateToJulianDay(now);
 *
 * // Equivalent to julianDay(1990, 5, 15, 14.5)
 * const jd2 = dateToJulianDay(new Date(Date.UTC(1990, 4, 15, 14, 30)));
 */
export function dateToJulianDay(
  date: Date,
  calendarType: CalendarType = CalendarType.Gregorian
): number {
  // Validate that the date object is valid
  if (!(date instanceof Date)) {
    throw new TypeError('dateToJulianDay expects a Date object');
  }

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const milliseconds = date.getUTCMilliseconds();

  // Check if date is invalid (results in NaN)
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours)) {
    throw new TypeError(
      `Invalid Date object provided to dateToJulianDay. ` +
      `Date.toString() returned: "${date.toString()}". ` +
      `Please ensure the date is valid (e.g., avoid new Date("invalid")).`
    );
  }

  // Convert to decimal hours
  const decimalHours = hours + minutes / 60 + seconds / 3600 + milliseconds / 3600000;

  return julianDay(year, month, day, decimalHours, calendarType);
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
    tret[2], // partial begin
    tret[3], // partial end
    tret[4], // total begin
    tret[5], // total end
    tret[6], // penumbral begin
    tret[7]  // penumbral end
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
    tret[2], // partial begin
    tret[3], // partial end
    tret[4], // central begin
    tret[5], // central end
    tret[6], // center line begin
    tret[7]  // center line end
  );
}

// ─── Local eclipse circumstances ───────────────────────────────────────────

/** A place on Earth: longitude east-positive, latitude north-positive, altitude in metres. */
export interface GeoPosition {
  longitude: number;
  latitude: number;
  altitude?: number;
}

/**
 * Visibility flags returned by the local eclipse functions, alongside the EclipseType flags
 * (SE_ECL_VISIBLE and friends in the Swiss Ephemeris).
 */
export enum EclipseVisibility {
  Visible = 128,
  MaxVisible = 256,
  FirstContactVisible = 512,
  SecondContactVisible = 1024,
  ThirdContactVisible = 2048,
  FourthContactVisible = 4096,
}

/** Azimuths are compass bearings: 0° north, 90° east (the Swiss Ephemeris counts from the south). */
const compass = (az: number) => (az + 180) % 360;

/** How a solar eclipse looks at one moment, from one place (or at its central point). */
export interface SolarEclipseAttributes {
  /** Fraction of the Sun's diameter covered by the Moon (above 1 when total) */
  magnitude: number;
  /** Ratio of the Moon's apparent diameter to the Sun's */
  diameterRatio: number;
  /** Fraction of the Sun's disc covered by the Moon (above 1 when total) */
  obscuration: number;
  /** Diameter of the core shadow in km: negative for the umbra (total), positive for the antumbra (annular) */
  coreShadowKm: number;
  /** Sun's azimuth, compass bearing in degrees */
  sunAzimuth: number;
  /** Sun's true altitude in degrees */
  sunAltitude: number;
  /** Sun's apparent altitude (with refraction) in degrees */
  sunApparentAltitude: number;
  /** Angular distance between the Moon and the Sun in degrees */
  separation: number;
  /** Magnitude as NASA defines it (equals diameterRatio for total and annular eclipses) */
  nasaMagnitude: number;
  /** Saros series number */
  sarosSeries: number;
  /** Member number within the Saros series */
  sarosMember: number;
}

const solarAttributes = (a: number[]): SolarEclipseAttributes => ({
  magnitude: a[0],
  diameterRatio: a[1],
  obscuration: a[2],
  coreShadowKm: a[3],
  sunAzimuth: compass(a[4]),
  sunAltitude: a[5],
  sunApparentAltitude: a[6],
  separation: a[7],
  nasaMagnitude: a[8],
  sarosSeries: a[9],
  sarosMember: a[10],
});

/** Where a solar eclipse is central at a moment, or greatest if it is not central. */
export interface SolarEclipseWhere {
  /** Eclipse type flags (0 when there is no eclipse at that moment) */
  type: number;
  /** Longitude of the central line (or of greatest eclipse) */
  longitude: number;
  /** Latitude of the central line (or of greatest eclipse) */
  latitude: number;
  attributes: SolarEclipseAttributes;
}

/**
 * Find where on Earth a solar eclipse is central at a given moment
 *
 * Sample it over the eclipse to trace the central line. For a non-central eclipse the position
 * is where the eclipse is greatest.
 *
 * @example
 * const eclipse = findNextSolarEclipse(julianDay(2027, 7, 1));
 * const at = solarEclipseWhere(eclipse.maximum);
 * console.log(at.longitude, at.latitude, at.attributes.sarosSeries);
 */
export function solarEclipseWhere(
  julianDay: number,
  flags: CalculationFlagInput = CalculationFlag.SwissEphemeris
): SolarEclipseWhere {
  const normalizedFlags = normalizeFlags(flags);
  ensureEphemerisInitialized(normalizedFlags);
  const [type, geopos, attr] = binding.sol_eclipse_where(julianDay, normalizedFlags) as [number, number[], number[]];
  return { type, longitude: geopos[0], latitude: geopos[1], attributes: solarAttributes(attr) };
}

/**
 * How a solar eclipse looks from a place at a given moment
 *
 * @returns type 0 when the Sun is not eclipsed there and then
 */
export function solarEclipseHow(
  julianDay: number,
  place: GeoPosition,
  flags: CalculationFlagInput = CalculationFlag.SwissEphemeris
): { type: number; attributes: SolarEclipseAttributes } {
  const normalizedFlags = normalizeFlags(flags);
  ensureEphemerisInitialized(normalizedFlags);
  const [type, attr] = binding.sol_eclipse_how(julianDay, normalizedFlags, place.longitude, place.latitude, place.altitude ?? 0) as [number, number[]];
  return { type, attributes: solarAttributes(attr) };
}

/** A solar eclipse as seen from one place. Times are Julian days (UT), 0 when they don't occur. */
export interface LocalSolarEclipse {
  /** Eclipse type and visibility flags */
  type: number;
  /** Local maximum */
  maximum: number;
  /** First contact: the eclipse begins */
  firstContact: number;
  /** Second contact: totality or annularity begins */
  secondContact: number;
  /** Third contact: totality or annularity ends */
  thirdContact: number;
  /** Fourth contact: the eclipse ends */
  fourthContact: number;
  /** Sunrise, if the Sun rises during the eclipse */
  sunrise: number;
  /** Sunset, if the Sun sets during the eclipse */
  sunset: number;
  /** The eclipse at the local maximum */
  attributes: SolarEclipseAttributes;
  isTotal(): boolean;
  isAnnular(): boolean;
  isVisible(): boolean;
  isMaximumVisible(): boolean;
  /** Length of totality or annularity in seconds, 0 if the eclipse is only partial here */
  centralDuration(): number;
}

/**
 * Find the next solar eclipse visible from a place
 *
 * @example
 * // The 2027 eclipse from Luxor
 * const e = findNextSolarEclipseAt(julianDay(2027, 7, 1), { longitude: 32.64, latitude: 25.69 });
 * console.log(e.isTotal(), e.centralDuration()); // true, ~381 s
 */
export function findNextSolarEclipseAt(
  startJulianDay: number,
  place: GeoPosition,
  flags: CalculationFlagInput = CalculationFlag.SwissEphemeris,
  backward: boolean = false
): LocalSolarEclipse {
  const normalizedFlags = normalizeFlags(flags);
  ensureEphemerisInitialized(normalizedFlags);
  const [type, tret, attr] = binding.sol_eclipse_when_loc(
    startJulianDay, normalizedFlags, place.longitude, place.latitude, place.altitude ?? 0, backward ? 1 : 0
  ) as [number, number[], number[]];
  return {
    type,
    maximum: tret[0],
    firstContact: tret[1],
    secondContact: tret[2],
    thirdContact: tret[3],
    fourthContact: tret[4],
    sunrise: tret[5],
    sunset: tret[6],
    attributes: solarAttributes(attr),
    isTotal: () => (type & EclipseType.Total) !== 0,
    isAnnular: () => (type & EclipseType.Annular) !== 0,
    isVisible: () => (type & EclipseVisibility.Visible) !== 0,
    isMaximumVisible: () => (type & EclipseVisibility.MaxVisible) !== 0,
    centralDuration: () => (tret[2] && tret[3] ? (tret[3] - tret[2]) * 86400 : 0),
  };
}

/** How a lunar eclipse looks at a moment, and where the Moon stands in a place's sky. */
export interface LunarEclipseAttributes {
  /** Umbral magnitude */
  umbralMagnitude: number;
  /** Penumbral magnitude */
  penumbralMagnitude: number;
  /** Moon's azimuth, compass bearing in degrees */
  moonAzimuth: number;
  /** Moon's true altitude in degrees */
  moonAltitude: number;
  /** Moon's apparent altitude (with refraction) in degrees */
  moonApparentAltitude: number;
  /** Distance of the Moon from opposition in degrees */
  oppositionDistance: number;
  /** Saros series number */
  sarosSeries: number;
  /** Member number within the Saros series */
  sarosMember: number;
}

const lunarAttributes = (a: number[]): LunarEclipseAttributes => ({
  umbralMagnitude: a[0],
  penumbralMagnitude: a[1],
  moonAzimuth: compass(a[4]),
  moonAltitude: a[5],
  moonApparentAltitude: a[6],
  oppositionDistance: a[7],
  sarosSeries: a[9],
  sarosMember: a[10],
});

/**
 * How a lunar eclipse looks at a moment; with a place, also where the Moon stands in its sky
 */
export function lunarEclipseHow(
  julianDay: number,
  place?: GeoPosition,
  flags: CalculationFlagInput = CalculationFlag.SwissEphemeris
): { type: number; attributes: LunarEclipseAttributes } {
  const normalizedFlags = normalizeFlags(flags);
  ensureEphemerisInitialized(normalizedFlags);
  const [type, attr] = binding.lun_eclipse_how(
    julianDay, normalizedFlags, place?.longitude ?? 0, place?.latitude ?? 0, place?.altitude ?? 0
  ) as [number, number[]];
  return { type, attributes: lunarAttributes(attr) };
}

/** A lunar eclipse as seen from one place. Times are Julian days (UT), 0 when they don't occur. */
export interface LocalLunarEclipse {
  type: number;
  maximum: number;
  partialBegin: number;
  partialEnd: number;
  totalBegin: number;
  totalEnd: number;
  penumbralBegin: number;
  penumbralEnd: number;
  /** Moonrise, if the Moon rises during the eclipse */
  moonrise: number;
  /** Moonset, if the Moon sets during the eclipse */
  moonset: number;
  attributes: LunarEclipseAttributes;
  isVisible(): boolean;
}

/**
 * Find the next lunar eclipse visible from a place
 */
export function findNextLunarEclipseAt(
  startJulianDay: number,
  place: GeoPosition,
  flags: CalculationFlagInput = CalculationFlag.SwissEphemeris,
  backward: boolean = false
): LocalLunarEclipse {
  const normalizedFlags = normalizeFlags(flags);
  ensureEphemerisInitialized(normalizedFlags);
  const [type, tret, attr] = binding.lun_eclipse_when_loc(
    startJulianDay, normalizedFlags, place.longitude, place.latitude, place.altitude ?? 0, backward ? 1 : 0
  ) as [number, number[], number[]];
  return {
    type,
    maximum: tret[0],
    partialBegin: tret[2],
    partialEnd: tret[3],
    totalBegin: tret[4],
    totalEnd: tret[5],
    penumbralBegin: tret[6],
    penumbralEnd: tret[7],
    moonrise: tret[8],
    moonset: tret[9],
    attributes: lunarAttributes(attr),
    isVisible: () => (type & EclipseVisibility.Visible) !== 0,
  };
}

/** Coordinates in a place's sky. */
export interface HorizontalCoordinates {
  /** Compass bearing in degrees: 0° north, 90° east */
  azimuth: number;
  /** True altitude in degrees */
  altitude: number;
  /** Apparent altitude, with refraction, in degrees */
  apparentAltitude: number;
}

/**
 * Turn ecliptic or equatorial coordinates into azimuth and altitude for a place
 *
 * @param coordinates - [longitude or right ascension, latitude or declination, distance] in degrees and AU
 * @param equatorial - true if the coordinates are right ascension and declination
 * @param pressure - atmospheric pressure in mbar for refraction (0 estimates it from the altitude)
 * @param temperature - in °C, for refraction
 */
export function horizontalCoordinates(
  julianDay: number,
  place: GeoPosition,
  coordinates: [number, number, number],
  equatorial: boolean = false,
  pressure: number = 0,
  temperature: number = 10
): HorizontalCoordinates {
  ensureEphemerisInitialized(CalculationFlag.SwissEphemeris);
  const [az, alt, app] = binding.azalt(
    julianDay, equatorial ? 1 : 0, place.longitude, place.latitude, place.altitude ?? 0, pressure, temperature,
    coordinates[0], coordinates[1], coordinates[2]
  ) as number[];
  return { azimuth: compass(az), altitude: alt, apparentAltitude: app };
}

/**
 * Greenwich apparent sidereal time, in hours
 */
export function siderealTime(julianDay: number): number {
  return binding.sidtime(julianDay) as number;
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
 * Set the sidereal mode (ayanamsa system) for sidereal calculations
 *
 * This function must be called before calculating sidereal positions with
 * CalculationFlag.Sidereal. Different ayanamsa systems are used in various
 * traditions of astrology, particularly in Vedic (Jyotish) astrology.
 *
 * @param siderealMode - Ayanamsa system to use (e.g., SiderealMode.Lahiri for Vedic)
 * @param t0 - Reference date (Julian day) for custom ayanamsa (default: 0)
 * @param ayanT0 - Initial value of ayanamsa in degrees for custom mode (default: 0)
 *
 * @example
 * import { setSiderealMode, SiderealMode, calculatePosition, CalculationFlag, Planet } from '@swisseph/node';
 *
 * // Set Lahiri ayanamsa (most common in Vedic astrology)
 * setSiderealMode(SiderealMode.Lahiri);
 *
 * // Calculate sidereal position of Sun
 * const jd = julianDay(2025, 1, 1);
 * const sun = calculatePosition(jd, Planet.Sun, CalculationFlag.Sidereal | CalculationFlag.Speed);
 * console.log(`Sidereal Sun: ${sun.longitude}°`);
 *
 * // Set Raman ayanamsa
 * setSiderealMode(SiderealMode.Raman);
 *
 * // Set custom ayanamsa
 * setSiderealMode(SiderealMode.UserDefined, 2451545.0, 23.85);
 */
export function setSiderealMode(
  siderealMode: number,
  t0: number = 0,
  ayanT0: number = 0
): void {
  binding.set_sid_mode(siderealMode, t0, ayanT0);
}

/**
 * Set the geographic location for topocentric calculations
 *
 * This function must be called before calculating topocentric positions with
 * CalculationFlag.Topocentric. Topocentric positions account for the observer's
 * location on Earth, which is particularly important for the Moon due to parallax.
 *
 * @param longitude - Geographic longitude in degrees (positive = east, negative = west)
 * @param latitude - Geographic latitude in degrees (positive = north, negative = south)
 * @param altitude - Altitude above sea level in meters
 *
 * @example
 * import { setTopocentric, calculatePosition, CalculationFlag, Planet } from '@swisseph/node';
 *
 * // Set location to New York City
 * setTopocentric(-74.0060, 40.7128, 10); // lon, lat, altitude
 *
 * // Calculate topocentric Moon position
 * const jd = julianDay(2025, 1, 1);
 * const moon = calculatePosition(
 *   jd,
 *   Planet.Moon,
 *   CalculationFlag.Topocentric | CalculationFlag.Speed
 * );
 * console.log(`Topocentric Moon: ${moon.longitude}°`);
 *
 * // Set location to Mumbai for Vedic calculations
 * setTopocentric(72.8777, 19.0760, 14);
 * setSiderealMode(SiderealMode.Lahiri);
 * const siderealMoon = calculatePosition(
 *   jd,
 *   Planet.Moon,
 *   CalculationFlag.Sidereal | CalculationFlag.Topocentric | CalculationFlag.Speed
 * );
 */
export function setTopocentric(
  longitude: number,
  latitude: number,
  altitude: number
): void {
  binding.set_topo(longitude, latitude, altitude);
}

/**
 * Get the ayanamsa (sidereal offset) value for a given date
 *
 * The ayanamsa is the distance between the tropical and sidereal zodiacs.
 * This function returns the current offset in degrees for the ayanamsa system
 * that was set with setSiderealMode().
 *
 * @param julianDay - Julian day number in Universal Time
 * @returns Ayanamsa value in degrees
 *
 * @example
 * import { getAyanamsa, setSiderealMode, SiderealMode, julianDay } from '@swisseph/node';
 *
 * // Get Lahiri ayanamsa for a date
 * setSiderealMode(SiderealMode.Lahiri);
 * const jd = julianDay(2025, 1, 1);
 * const ayanamsa = getAyanamsa(jd);
 * console.log(`Lahiri ayanamsa: ${ayanamsa.toFixed(4)}°`);
 *
 * // Compare different ayanamsa systems
 * setSiderealMode(SiderealMode.Raman);
 * const ramanAyanamsa = getAyanamsa(jd);
 * console.log(`Raman ayanamsa: ${ramanAyanamsa.toFixed(4)}°`);
 *
 * setSiderealMode(SiderealMode.Krishnamurti);
 * const kpAyanamsa = getAyanamsa(jd);
 * console.log(`KP ayanamsa: ${kpAyanamsa.toFixed(4)}°`);
 */
export function getAyanamsa(julianDay: number): number {
  return binding.get_ayanamsa_ut(julianDay);
}

/**
 * Get the ayanamsa (sidereal offset) value using the extended function
 *
 * @param julianDay - Julian day number in Universal Time
 * @param flags - Calculation flags (default: SwissEphemeris)
 * @returns Ayanamsa value in degrees
 */
export function getAyanamsaExUt(
  julianDay: number,
  flags: CalculationFlagInput = CalculationFlag.SwissEphemeris
): number {
  const normalizedFlags = normalizeFlags(flags);
  ensureEphemerisInitialized(normalizedFlags);
  return binding.get_ayanamsa_ex_ut(julianDay, normalizedFlags);
}

/**
 * Calculate rise, transit, or set time for a celestial body
 *
 * Finds the time when a celestial body rises, transits (culminates), or sets
 * for a given location. This is essential for calculating almanac data,
 * planetary hours, and observational astrology.
 *
 * @param startJulianDay - Julian day to start search from
 * @param body - Celestial body to calculate
 * @param eventType - Type of event (RiseTransitFlag.Rise, Set, UpperTransit, or LowerTransit)
 * @param longitude - Geographic longitude in degrees (positive = east, negative = west)
 * @param latitude - Geographic latitude in degrees (positive = north, negative = south)
 * @param altitude - Altitude above sea level in meters
 * @param flags - Calculation flags (default: SwissEphemeris)
 * @param atmosphericPressure - Atmospheric pressure in millibars (default: 0 = standard)
 * @param atmosphericTemperature - Atmospheric temperature in Celsius (default: 0 = standard)
 * @returns RiseTransitSet object with time of event
 *
 * @example
 * import {
 *   calculateRiseTransitSet,
 *   RiseTransitFlag,
 *   Planet,
 *   julianDay,
 *   julianDayToDate
 * } from '@swisseph/node';
 *
 * // Find sunrise in New York
 * const jd = julianDay(2025, 1, 1);
 * const sunrise = calculateRiseTransitSet(
 *   jd,
 *   Planet.Sun,
 *   RiseTransitFlag.Rise,
 *   -74.0060,  // New York longitude
 *   40.7128,   // New York latitude
 *   10         // altitude in meters
 * );
 * console.log(`Sunrise: ${julianDayToDate(sunrise.time)}`);
 *
 * // Find moonrise
 * const moonrise = calculateRiseTransitSet(
 *   jd,
 *   Planet.Moon,
 *   RiseTransitFlag.Rise,
 *   -74.0060,
 *   40.7128,
 *   10
 * );
 *
 * // Find Sun's upper transit (noon)
 * const noon = calculateRiseTransitSet(
 *   jd,
 *   Planet.Sun,
 *   RiseTransitFlag.UpperTransit,
 *   -74.0060,
 *   40.7128,
 *   10
 * );
 *
 * // With atmospheric refraction correction
 * const preciseRise = calculateRiseTransitSet(
 *   jd,
 *   Planet.Sun,
 *   RiseTransitFlag.Rise,
 *   -74.0060,
 *   40.7128,
 *   10,
 *   CalculationFlag.SwissEphemeris,
 *   1013.25,  // standard pressure in millibars
 *   15        // temperature in Celsius
 * );
 */
export function calculateRiseTransitSet(
  startJulianDay: number,
  body: CelestialBody,
  eventType: number,
  longitude: number,
  latitude: number,
  altitude: number,
  flags: CalculationFlagInput = CalculationFlag.SwissEphemeris,
  atmosphericPressure: number = 0,
  atmosphericTemperature: number = 0
): RiseTransitSet {
  const normalizedFlags = normalizeFlags(flags);
  ensureEphemerisInitialized(normalizedFlags);

  const geopos = [longitude, latitude, altitude];
  const result = binding.rise_trans(
    startJulianDay,
    body,
    eventType,
    geopos,
    normalizedFlags,
    atmosphericPressure,
    atmosphericTemperature
  ) as [number, number];

  const [retFlag, time] = result;

  return {
    time,
    eventType: retFlag,
  };
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
