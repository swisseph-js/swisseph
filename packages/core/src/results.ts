/**
 * Swiss Ephemeris Type Definitions - Result Interfaces
 *
 * This file contains interface definitions for all result types returned by
 * Swiss Ephemeris functions. These interfaces replace array-based returns with
 * structured objects for better developer experience.
 */

import { EclipseType, HouseSystem, CalendarType } from './enums';

/**
 * Planetary position result from calculatePosition()
 * Replaces the old [number[], number] tuple return from calc_ut()
 */
export interface PlanetaryPosition {
  /** Longitude in degrees (or X coordinate if XYZ flag is set) */
  longitude: number;

  /** Latitude in degrees (or Y coordinate if XYZ flag is set) */
  latitude: number;

  /** Distance in AU (or Z coordinate if XYZ flag is set) */
  distance: number;

  /** Longitude speed in degrees/day (or X speed if XYZ flag is set) */
  longitudeSpeed: number;

  /** Latitude speed in degrees/day (or Y speed if XYZ flag is set) */
  latitudeSpeed: number;

  /** Distance speed in AU/day (or Z speed if XYZ flag is set) */
  distanceSpeed: number;

  /** Return flags indicating the calculation method actually used */
  flags: number;
}

/**
 * Alternative interface for rectangular coordinates
 * Same data as PlanetaryPosition but with semantically appropriate names
 * when using CalculationFlag.XYZ
 */
export interface RectangularCoordinates {
  /** X coordinate */
  x: number;

  /** Y coordinate */
  y: number;

  /** Z coordinate */
  z: number;

  /** X coordinate speed */
  xSpeed: number;

  /** Y coordinate speed */
  ySpeed: number;

  /** Z coordinate speed */
  zSpeed: number;

  /** Return flags */
  flags: number;
}

/**
 * Date/time representation
 * Replaces the old [number, number, number, number] tuple from revjul()
 */
export interface DateTime {
  /** Year (negative for BCE/BC) */
  year: number;

  /** Month (1-12) */
  month: number;

  /** Day of month (1-31) */
  day: number;

  /** Hour as decimal (0.0-23.999...) */
  hour: number;

  /** Calendar type used for this date */
  calendarType?: CalendarType;
}

/**
 * Extended date/time with convenience methods
 */
export interface ExtendedDateTime extends DateTime {
  /** Convert to ISO 8601 string */
  toISOString(): string;

  /** Convert to formatted string */
  toString(): string;
}

/**
 * House calculation result
 * Replaces the old [number[], number[]] tuple from houses()
 */
export interface HouseData {
  /**
   * House cusps array (indices 1-12 are the house cusps)
   * Index 0 may be unused depending on house system
   */
  cusps: number[];

  /** Ascendant in degrees */
  ascendant: number;

  /** MC (Medium Coeli / Midheaven) in degrees */
  mc: number;

  /** ARMC (sidereal time) in degrees */
  armc: number;

  /** Vertex in degrees */
  vertex: number;

  /** Equatorial Ascendant in degrees */
  equatorialAscendant: number;

  /** Co-Ascendant 1 (Koch) in degrees */
  coAscendant1: number;

  /** Co-Ascendant 2 (Munkasey) in degrees */
  coAscendant2: number;

  /** Polar Ascendant in degrees */
  polarAscendant: number;

  /** House system used for this calculation */
  houseSystem: HouseSystem;
}

/**
 * Lunar eclipse event details
 * Replaces the old [number, number[]] tuple from lun_eclipse_when()
 */
export interface LunarEclipse {
  /** Eclipse type flags (bitwise combination of EclipseType values) */
  type: number;

  /** Time of maximum eclipse (Julian day) */
  maximum: number;

  /** Start of partial eclipse phase (Julian day) */
  partialBegin: number;

  /** End of partial eclipse phase (Julian day) */
  partialEnd: number;

  /** Start of total eclipse phase (Julian day), 0 if not total */
  totalBegin: number;

  /** End of total eclipse phase (Julian day), 0 if not total */
  totalEnd: number;

  /** Start of penumbral eclipse phase (Julian day) */
  penumbralBegin: number;

  /** End of penumbral eclipse phase (Julian day) */
  penumbralEnd: number;

  /**
   * Check if this is a total lunar eclipse
   */
  isTotal(): boolean;

  /**
   * Check if this is a partial lunar eclipse
   */
  isPartial(): boolean;

  /**
   * Check if this is a penumbral-only lunar eclipse
   */
  isPenumbralOnly(): boolean;

  /**
   * Get the duration of totality in hours
   * Returns 0 if not a total eclipse
   */
  getTotalityDuration(): number;

  /**
   * Get the duration of partial phase in hours
   */
  getPartialDuration(): number;

  /**
   * Get the total duration of the eclipse (penumbral) in hours
   */
  getTotalDuration(): number;
}

/**
 * Solar eclipse event details
 * Replaces the old [number, number[]] tuple from sol_eclipse_when_glob()
 */
export interface SolarEclipse {
  /** Eclipse type flags (bitwise combination of EclipseType values) */
  type: number;

  /** Time of maximum eclipse (Julian day) */
  maximum: number;

  /** Start of partial eclipse phase (Julian day) */
  partialBegin: number;

  /** End of partial eclipse phase (Julian day) */
  partialEnd: number;

  /** Start of central (total/annular) phase (Julian day), 0 if not central */
  centralBegin: number;

  /** End of central (total/annular) phase (Julian day), 0 if not central */
  centralEnd: number;

  /** Time when center line begins (Julian day), 0 if not central */
  centerLineBegin: number;

  /** Time when center line ends (Julian day), 0 if not central */
  centerLineEnd: number;

  /**
   * Check if this is a total solar eclipse
   */
  isTotal(): boolean;

  /**
   * Check if this is an annular solar eclipse
   */
  isAnnular(): boolean;

  /**
   * Check if this is a hybrid (annular-total) solar eclipse
   */
  isHybrid(): boolean;

  /**
   * Check if this is a partial solar eclipse
   */
  isPartial(): boolean;

  /**
   * Check if this is a central eclipse (path crosses Earth's surface)
   */
  isCentral(): boolean;

  /**
   * Check if this is a non-central eclipse
   */
  isNonCentral(): boolean;
}
