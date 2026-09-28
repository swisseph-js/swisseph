/**
 * Local eclipse circumstances: how an eclipse looks from one place (or at one moment), and
 * positions in a place's sky. Shared by @swisseph/node and @swisseph/browser, which fill these from
 * swe_sol_eclipse_where / _how / _when_loc, swe_lun_eclipse_how / _when_loc and swe_azalt.
 *
 * Azimuths are compass bearings (0° north, 90° east); the Swiss Ephemeris counts from the south.
 */

import { EclipseType, EclipseVisibility } from './enums.js';

/** A place on Earth: longitude east-positive, latitude north-positive, altitude in metres. */
export interface GeoPosition {
  longitude: number;
  latitude: number;
  altitude?: number;
}

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

/** Coordinates in a place's sky. */
export interface HorizontalCoordinates {
  /** Compass bearing in degrees: 0° north, 90° east */
  azimuth: number;
  /** True altitude in degrees */
  altitude: number;
  /** Apparent altitude, with refraction, in degrees */
  apparentAltitude: number;
}

/** A Swiss Ephemeris azimuth (from the south, westwards) as a compass bearing. */
export const compassBearing = (swissAzimuth: number): number => (swissAzimuth + 180) % 360;

/** Reads the `attr` array of swe_sol_eclipse_where / _how / _when_loc. */
export function solarEclipseAttributes(a: ArrayLike<number>): SolarEclipseAttributes {
  return {
    magnitude: a[0],
    diameterRatio: a[1],
    obscuration: a[2],
    coreShadowKm: a[3],
    sunAzimuth: compassBearing(a[4]),
    sunAltitude: a[5],
    sunApparentAltitude: a[6],
    separation: a[7],
    nasaMagnitude: a[8],
    sarosSeries: a[9],
    sarosMember: a[10],
  };
}

/** Reads the `attr` array of swe_lun_eclipse_how / _when_loc. */
export function lunarEclipseAttributes(a: ArrayLike<number>): LunarEclipseAttributes {
  return {
    umbralMagnitude: a[0],
    penumbralMagnitude: a[1],
    moonAzimuth: compassBearing(a[4]),
    moonAltitude: a[5],
    moonApparentAltitude: a[6],
    oppositionDistance: a[7],
    sarosSeries: a[9],
    sarosMember: a[10],
  };
}

/** Reads the results of swe_sol_eclipse_when_loc. */
export function localSolarEclipse(type: number, tret: ArrayLike<number>, attr: ArrayLike<number>): LocalSolarEclipse {
  return {
    type,
    maximum: tret[0],
    firstContact: tret[1],
    secondContact: tret[2],
    thirdContact: tret[3],
    fourthContact: tret[4],
    sunrise: tret[5],
    sunset: tret[6],
    attributes: solarEclipseAttributes(attr),
    isTotal: () => (type & EclipseType.Total) !== 0,
    isAnnular: () => (type & EclipseType.Annular) !== 0,
    isVisible: () => (type & EclipseVisibility.Visible) !== 0,
    isMaximumVisible: () => (type & EclipseVisibility.MaxVisible) !== 0,
    centralDuration: () => (tret[2] && tret[3] ? (tret[3] - tret[2]) * 86400 : 0),
  };
}

/** Reads the results of swe_lun_eclipse_when_loc. */
export function localLunarEclipse(type: number, tret: ArrayLike<number>, attr: ArrayLike<number>): LocalLunarEclipse {
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
    attributes: lunarEclipseAttributes(attr),
    isVisible: () => (type & EclipseVisibility.Visible) !== 0,
  };
}
