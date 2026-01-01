/**
 * Swiss Ephemeris Type Definitions - Central Export
 *
 * This file exports all types, enums, interfaces, and utilities from the type system.
 * Import from this file to get access to all TypeScript definitions.
 */

// Export all enums
export {
  CalendarType,
  Planet,
  LunarPoint,
  Asteroid,
  FictitiousPlanet,
  HouseSystem,
  HousePoint,
  CalculationFlag,
  EclipseType,
  CommonCalculationFlags,
  CommonEclipseTypes,
  AsteroidOffset,
  PlanetaryMoonOffset,
  NumberOfPlanets,
} from './enums';

// Export type aliases from enums
export type { CelestialBody } from './enums';

// Export all result interfaces
export type {
  PlanetaryPosition,
  RectangularCoordinates,
  DateTime,
  ExtendedDateTime,
  HouseData,
  LunarEclipse,
  SolarEclipse,
} from './results';

// Export implementation classes
export { LunarEclipseImpl, SolarEclipseImpl, DateTimeImpl } from './implementations';

// Export flag utilities
export {
  CalculationFlags,
  EclipseTypeFlags,
  normalizeFlags,
  normalizeEclipseTypes,
} from './flags';

// Export flag input types
export type { CalculationFlagInput, EclipseTypeFlagInput } from './flags';
