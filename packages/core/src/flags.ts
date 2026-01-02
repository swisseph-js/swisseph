/**
 * Swiss Ephemeris Type Definitions - Flag Utilities
 *
 * This file contains utilities for working with bitwise flags in a type-safe manner.
 * These builder classes make it easier to combine flags while maintaining type safety.
 */

import { CalculationFlag, EclipseType } from './enums.js';

/**
 * Type-safe flag builder for calculation flags
 *
 * @example
 * const flags = CalculationFlags
 *   .from(CalculationFlag.SwissEphemeris)
 *   .add(CalculationFlag.Speed)
 *   .add(CalculationFlag.Equatorial);
 *
 * const position = calculatePosition(jd, Planet.Sun, flags);
 */
export class CalculationFlags {
  private flags: number = 0;

  constructor(initialFlags?: CalculationFlag | CalculationFlag[]) {
    if (initialFlags !== undefined) {
      this.add(initialFlags);
    }
  }

  /**
   * Add one or more flags to the current set
   * @param flag - Single flag or array of flags to add
   * @returns this (for method chaining)
   */
  add(flag: CalculationFlag | CalculationFlag[]): this {
    if (Array.isArray(flag)) {
      flag.forEach((f) => (this.flags |= f));
    } else {
      this.flags |= flag;
    }
    return this;
  }

  /**
   * Remove one or more flags from the current set
   * @param flag - Single flag or array of flags to remove
   * @returns this (for method chaining)
   */
  remove(flag: CalculationFlag | CalculationFlag[]): this {
    if (Array.isArray(flag)) {
      flag.forEach((f) => (this.flags &= ~f));
    } else {
      this.flags &= ~flag;
    }
    return this;
  }

  /**
   * Check if a specific flag is set
   * @param flag - Flag to check
   * @returns true if the flag is set
   */
  has(flag: CalculationFlag): boolean {
    return (this.flags & flag) === flag;
  }

  /**
   * Convert to raw number for passing to C library
   * @returns The numeric representation of all combined flags
   */
  toNumber(): number {
    return this.flags;
  }

  /**
   * Create a new CalculationFlags instance from one or more flags
   * @param flags - Flags to combine
   * @returns New CalculationFlags instance
   */
  static from(...flags: CalculationFlag[]): CalculationFlags {
    return new CalculationFlags(flags);
  }

  /**
   * Common preset: Swiss Ephemeris with speed calculation
   */
  static get swissEphemerisWithSpeed(): CalculationFlags {
    return CalculationFlags.from(CalculationFlag.SwissEphemeris, CalculationFlag.Speed);
  }

  /**
   * Common preset: Moshier ephemeris with speed calculation
   */
  static get moshierWithSpeed(): CalculationFlags {
    return CalculationFlags.from(CalculationFlag.MoshierEphemeris, CalculationFlag.Speed);
  }

  /**
   * Common preset: Astrometric positions (no aberration or light deflection)
   */
  static get astrometric(): CalculationFlags {
    return CalculationFlags.from(
      CalculationFlag.SwissEphemeris,
      CalculationFlag.NoAberration,
      CalculationFlag.NoGravitationalDeflection
    );
  }

  /**
   * Common preset: Heliocentric positions
   */
  static get heliocentric(): CalculationFlags {
    return CalculationFlags.from(CalculationFlag.SwissEphemeris, CalculationFlag.Heliocentric);
  }

  /**
   * Common preset: Topocentric positions
   */
  static get topocentric(): CalculationFlags {
    return CalculationFlags.from(CalculationFlag.SwissEphemeris, CalculationFlag.Topocentric);
  }

  /**
   * Common preset: Equatorial coordinates (RA/Dec)
   */
  static get equatorial(): CalculationFlags {
    return CalculationFlags.from(
      CalculationFlag.SwissEphemeris,
      CalculationFlag.Equatorial,
      CalculationFlag.Speed
    );
  }
}

/**
 * Type-safe flag builder for eclipse type filtering
 *
 * @example
 * const eclipseFilter = EclipseTypeFlags
 *   .from(EclipseType.Total)
 *   .add(EclipseType.Partial);
 *
 * const eclipse = findNextLunarEclipse(jd, flags, eclipseFilter.toNumber());
 */
export class EclipseTypeFlags {
  private flags: number = 0;

  constructor(initialFlags?: EclipseType | EclipseType[]) {
    if (initialFlags !== undefined) {
      this.add(initialFlags);
    }
  }

  /**
   * Add one or more eclipse types to the filter
   * @param flag - Single type or array of types to add
   * @returns this (for method chaining)
   */
  add(flag: EclipseType | EclipseType[]): this {
    if (Array.isArray(flag)) {
      flag.forEach((f) => (this.flags |= f));
    } else {
      this.flags |= flag;
    }
    return this;
  }

  /**
   * Check if a specific eclipse type is in the filter
   * @param flag - Eclipse type to check
   * @returns true if the type is included
   */
  has(flag: EclipseType): boolean {
    return (this.flags & flag) === flag;
  }

  /**
   * Convert to raw number for passing to C library
   * @returns The numeric representation of all combined types
   */
  toNumber(): number {
    return this.flags;
  }

  /**
   * Create a new EclipseTypeFlags instance from one or more types
   * @param flags - Eclipse types to combine
   * @returns New EclipseTypeFlags instance
   */
  static from(...flags: EclipseType[]): EclipseTypeFlags {
    return new EclipseTypeFlags(flags);
  }

  /**
   * Preset: All solar eclipse types
   */
  static get allSolar(): EclipseTypeFlags {
    return new EclipseTypeFlags([
      EclipseType.Central,
      EclipseType.NonCentral,
      EclipseType.Total,
      EclipseType.Annular,
      EclipseType.Partial,
      EclipseType.AnnularTotal,
    ]);
  }

  /**
   * Preset: All lunar eclipse types
   */
  static get allLunar(): EclipseTypeFlags {
    return new EclipseTypeFlags([
      EclipseType.Total,
      EclipseType.Partial,
      EclipseType.Penumbral,
    ]);
  }

  /**
   * Preset: Only total eclipses
   */
  static get totalOnly(): EclipseTypeFlags {
    return EclipseTypeFlags.from(EclipseType.Total);
  }

  /**
   * Preset: Total and partial eclipses (no penumbral)
   */
  static get totalAndPartial(): EclipseTypeFlags {
    return EclipseTypeFlags.from(EclipseType.Total, EclipseType.Partial);
  }
}

/**
 * Type for functions that can accept various flag formats
 * Allows for flexibility while maintaining type safety
 */
export type CalculationFlagInput = number | CalculationFlag | CalculationFlags | CalculationFlag[];

/**
 * Type for eclipse type filter input
 */
export type EclipseTypeFlagInput = number | EclipseType | EclipseTypeFlags | EclipseType[];

/**
 * Normalize calculation flag input to a number
 * This allows functions to accept multiple flag formats
 *
 * @param input - Flags in various formats
 * @returns Numeric representation of the flags
 */
export function normalizeFlags(input: CalculationFlagInput): number {
  if (typeof input === 'number') {
    return input;
  }
  if (input instanceof CalculationFlags) {
    return input.toNumber();
  }
  if (Array.isArray(input)) {
    return CalculationFlags.from(...input).toNumber();
  }
  // Single CalculationFlag enum value
  return input;
}

/**
 * Normalize eclipse type flag input to a number
 *
 * @param input - Eclipse types in various formats
 * @returns Numeric representation of the types
 */
export function normalizeEclipseTypes(input: EclipseTypeFlagInput): number {
  if (typeof input === 'number') {
    return input;
  }
  if (input instanceof EclipseTypeFlags) {
    return input.toNumber();
  }
  if (Array.isArray(input)) {
    return EclipseTypeFlags.from(...input).toNumber();
  }
  // Single EclipseType enum value
  return input;
}
