/**
 * Swiss Ephemeris Type Definitions - Enums
 *
 * This file contains all enum definitions for the Swiss Ephemeris library.
 * Enums replace the old numeric constants with type-safe, developer-friendly values.
 */

/**
 * Calendar system type
 */
export enum CalendarType {
  /** Julian calendar */
  Julian = 0,
  /** Gregorian calendar (default for modern dates) */
  Gregorian = 1
}

/**
 * Major planets and luminaries
 */
export enum Planet {
  /** Sun */
  Sun = 0,
  /** Moon */
  Moon = 1,
  /** Mercury */
  Mercury = 2,
  /** Venus */
  Venus = 3,
  /** Mars */
  Mars = 4,
  /** Jupiter */
  Jupiter = 5,
  /** Saturn */
  Saturn = 6,
  /** Uranus */
  Uranus = 7,
  /** Neptune */
  Neptune = 8,
  /** Pluto */
  Pluto = 9,
  /** Earth (for heliocentric calculations) */
  Earth = 14,
  /** Ecliptic and nutation */
  EclipticNutation = -1,
  /** Fixed star (special value) */
  FixedStar = -10
}

/**
 * Lunar and solar nodes and apogees
 */
export enum LunarPoint {
  /** Mean lunar node (North Node) */
  MeanNode = 10,
  /** True lunar node (osculating) */
  TrueNode = 11,
  /** Mean lunar apogee (Lilith) */
  MeanApogee = 12,
  /** Osculating lunar apogee */
  OsculatingApogee = 13,
  /** Interpolated lunar apogee */
  InterpolatedApogee = 21,
  /** Interpolated lunar perigee */
  InterpolatedPerigee = 22
}

/**
 * Main belt asteroids
 */
export enum Asteroid {
  /** Chiron */
  Chiron = 15,
  /** Pholus */
  Pholus = 16,
  /** Ceres */
  Ceres = 17,
  /** Pallas */
  Pallas = 18,
  /** Juno */
  Juno = 19,
  /** Vesta */
  Vesta = 20
}

/**
 * Fictitious planets used in Uranian astrology and other systems
 */
export enum FictitiousPlanet {
  /** Cupido (Uranian) */
  Cupido = 40,
  /** Hades (Uranian) */
  Hades = 41,
  /** Zeus (Uranian) */
  Zeus = 42,
  /** Kronos (Uranian) */
  Kronos = 43,
  /** Apollon (Uranian) */
  Apollon = 44,
  /** Admetos (Uranian) */
  Admetos = 45,
  /** Vulkanus (Uranian) */
  Vulkanus = 46,
  /** Poseidon (Uranian) */
  Poseidon = 47,
  /** Isis (Transatlantic) */
  Isis = 48,
  /** Nibiru (hypothetical) */
  Nibiru = 49,
  /** Harrington (hypothetical) */
  Harrington = 50,
  /** Neptune according to Leverrier */
  NeptuneLeverrier = 51,
  /** Neptune according to Adams */
  NeptuneAdams = 52,
  /** Pluto according to Lowell */
  PlutoLowell = 53,
  /** Pluto according to Pickering */
  PlutoPickering = 54,
  /** Vulcan (hypothetical planet inside Mercury's orbit) */
  Vulcan = 55,
  /** White Moon (Selena) */
  WhiteMoon = 56,
  /** Proserpina */
  Proserpina = 57,
  /** Waldemath (hypothetical second moon) */
  Waldemath = 58
}

/**
 * Union type for all celestial bodies that can be calculated
 */
export type CelestialBody = Planet | LunarPoint | Asteroid | FictitiousPlanet | number;

/**
 * House systems
 */
export enum HouseSystem {
  /** Placidus (most common in modern Western astrology) */
  Placidus = 'P',
  /** Koch */
  Koch = 'K',
  /** Porphyrius */
  Porphyrius = 'O',
  /** Regiomontanus */
  Regiomontanus = 'R',
  /** Campanus */
  Campanus = 'C',
  /** Equal (Ascendant) */
  Equal = 'A',
  /** Vehlow Equal */
  VehlowEqual = 'V',
  /** Whole Sign */
  WholeSign = 'W',
  /** Meridian (Axial rotation) */
  Meridian = 'X',
  /** Azimuthal / Horizontal */
  Azimuthal = 'H',
  /** Polich/Page ("topocentric") */
  PolichPage = 'T',
  /** Alcabitus */
  Alcabitus = 'B',
  /** Morinus */
  Morinus = 'M'
}

/**
 * House cusps and significant points
 * These are indices into the ascmc array returned by houses calculation
 */
export enum HousePoint {
  /** Ascendant */
  Ascendant = 0,
  /** MC (Medium Coeli / Midheaven) */
  MC = 1,
  /** ARMC (sidereal time) */
  ARMC = 2,
  /** Vertex */
  Vertex = 3,
  /** Equatorial Ascendant */
  EquatorialAscendant = 4,
  /** Co-Ascendant 1 (Koch) */
  CoAscendant1 = 5,
  /** Co-Ascendant 2 (Munkasey) */
  CoAscendant2 = 6,
  /** Polar Ascendant */
  PolarAscendant = 7
}

/**
 * Calculation flags (bitwise)
 * These can be combined using bitwise OR (|) operator
 */
export enum CalculationFlag {
  /** Use JPL ephemeris files */
  JPLEphemeris = 1,
  /** Use Swiss Ephemeris files */
  SwissEphemeris = 2,
  /** Use Moshier ephemeris (analytical, no files needed) */
  MoshierEphemeris = 4,
  /** Heliocentric positions */
  Heliocentric = 8,
  /** True/geometric positions (no light-time correction) */
  TruePositions = 16,
  /** J2000 coordinates */
  J2000 = 32,
  /** No nutation */
  NoNutation = 64,
  /** High-precision speed (uses 3 positions) */
  Speed3 = 128,
  /** Calculate speed */
  Speed = 256,
  /** No gravitational deflection */
  NoGravitationalDeflection = 512,
  /** No aberration */
  NoAberration = 1024,
  /** Equatorial coordinates (RA/Dec instead of longitude/latitude) */
  Equatorial = 2048,
  /** Rectangular coordinates (X/Y/Z) */
  XYZ = 4096,
  /** Radians instead of degrees */
  Radians = 8192,
  /** Barycentric positions */
  Barycentric = 16384,
  /** Topocentric positions */
  Topocentric = 32768,
  /** Sidereal positions */
  Sidereal = 65536,
  /** ICRS reference frame */
  ICRS = 131072,
  /** Nutation according to IAU 1980 */
  DpsidepsIAU1980 = 262144,
  /** JPL Horizons mode */
  JPLHorizons = 524288,
  /** JPL Horizons approximation mode */
  JPLHorizonsApprox = 1048576
}

/**
 * Common flag combinations for convenience
 */
export const CommonCalculationFlags = {
  /** Astrometric positions (no aberration or gravitational deflection) */
  Astrometric: CalculationFlag.NoAberration | CalculationFlag.NoGravitationalDeflection,
  /** Default flags for Swiss Ephemeris with speed */
  DefaultSwissEphemeris: CalculationFlag.SwissEphemeris | CalculationFlag.Speed,
  /** Default flags for Moshier with speed */
  DefaultMoshier: CalculationFlag.MoshierEphemeris | CalculationFlag.Speed
} as const;

/**
 * Eclipse type flags (bitwise)
 * These can be combined using bitwise OR (|) operator
 */
export enum EclipseType {
  /** Central eclipse (path of totality/annularity crosses Earth) */
  Central = 1,
  /** Non-central eclipse */
  NonCentral = 2,
  /** Total eclipse */
  Total = 4,
  /** Annular eclipse */
  Annular = 8,
  /** Partial eclipse */
  Partial = 16,
  /** Annular-total (hybrid) eclipse */
  AnnularTotal = 32,
  /** Penumbral lunar eclipse */
  Penumbral = 64
}

/**
 * Common eclipse type combinations
 */
export const CommonEclipseTypes = {
  /** All types of solar eclipses */
  AllSolar: EclipseType.Central | EclipseType.NonCentral | EclipseType.Total |
            EclipseType.Annular | EclipseType.Partial | EclipseType.AnnularTotal,
  /** All types of lunar eclipses */
  AllLunar: EclipseType.Total | EclipseType.Partial | EclipseType.Penumbral
} as const;

/**
 * Constants for special offsets
 */
export const AsteroidOffset = 10000;
export const PlanetaryMoonOffset = 9000;
export const NumberOfPlanets = 23;
