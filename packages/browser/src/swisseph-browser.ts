/**
 * Swiss Ephemeris for Browsers (WebAssembly) - Modern TypeScript API
 *
 * High-precision astronomical calculations in the browser using WebAssembly.
 * This module provides the same modern API as the Node.js version but runs
 * entirely in the browser with no server required.
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

/**
 * Emscripten Module interface
 */
interface EmscriptenModule {
  cwrap: <T = any>(
    ident: string,
    returnType: string | null,
    argTypes: string[]
  ) => T;
  ccall: (
    ident: string,
    returnType: string | null,
    argTypes: string[],
    args: any[]
  ) => any;
  allocateUTF8: (str: string) => number;
  getValue: (ptr: number, type: string) => number;
  UTF8ToString: (ptr: number) => string;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  FS: {
    mkdir: (path: string) => void;
    writeFile: (path: string, data: Uint8Array) => void;
    readFile: (path: string) => Uint8Array;
    unlink: (path: string) => void;
  };
}

/**
 * WebAssembly Swiss Ephemeris module type
 */
interface SwissEphModule extends EmscriptenModule {
  // Additional module-specific properties can be added here
}

/**
 * Swiss Ephemeris for browsers
 *
 * This class provides access to Swiss Ephemeris calculations in the browser
 * using WebAssembly. It must be initialized before use.
 *
 * @example
 * import { SwissEphemeris, Planet, CalculationFlag } from './swisseph-browser.js';
 *
 * const swe = new SwissEphemeris();
 * await swe.init();
 *
 * const jd = swe.julianDay(2007, 3, 3);
 * const sun = swe.calculatePosition(jd, Planet.Sun);
 * console.log(`Sun: ${sun.longitude}°`);
 */
export class SwissEphemeris {
  private module: SwissEphModule | null = null;
  private ready: boolean = false;

  // Wrapped C functions
  private _julday!: (
    year: number,
    month: number,
    day: number,
    hour: number,
    gregflag: number
  ) => number;
  private _getPlanetName!: (ipl: number) => string;
  private _close!: () => void;
  private _version!: () => string;

  /**
   * Initialize the WebAssembly module
   *
   * This must be called before using any other methods.
   * It loads the WASM binary and sets up the function wrappers.
   *
   * @example
   * const swe = new SwissEphemeris();
   * await swe.init();
   * console.log(swe.version());
   */
  async init(): Promise<void> {
    if (this.ready) return;

    // Dynamically import the WASM module (built separately by build-wasm.sh)
    // @ts-expect-error - WASM module is generated at build time
    const SwissEphModuleImport = await import('./swisseph.js');
    // Emscripten with MODULARIZE=1 exports the function, but ES module import
    // may wrap it differently. Try default, then the import itself, then check if it's already a function
    let SwissEphModuleFactory: any;
    if (typeof SwissEphModuleImport.default === 'function') {
      SwissEphModuleFactory = SwissEphModuleImport.default;
    } else if (typeof SwissEphModuleImport === 'function') {
      SwissEphModuleFactory = SwissEphModuleImport;
    } else if (SwissEphModuleImport.default) {
      SwissEphModuleFactory = SwissEphModuleImport.default;
    } else {
      // Fallback: try to get the function from the module
      SwissEphModuleFactory = (SwissEphModuleImport as any).SwissEphModule || SwissEphModuleImport;
    }
    
    if (typeof SwissEphModuleFactory !== 'function') {
      throw new Error('Failed to load WASM module: SwissEphModule factory function not found');
    }
    
    // Configure the WASM module to locate files correctly
    // The WASM file is in the same directory as swisseph.js (dist/)
    // When imported as ES module, currentScript might not be available,
    // so we provide locateFile to ensure correct path resolution
    this.module = (await SwissEphModuleFactory({
      locateFile: (path: string, prefix?: string) => {
        // The WASM file should be in the same directory as swisseph.js (dist/)
        // Use absolute path from server root to avoid path resolution issues
        if (path === 'swisseph.wasm') {
          return '/dist/swisseph.wasm';
        }
        // For other files, use the prefix if provided, otherwise use the path as-is
        return prefix ? prefix + path : path;
      }
    })) as SwissEphModule;

    this._wrapFunctions();
    this.ready = true;
    console.log('Swiss Ephemeris WASM initialized:', this.version());
  }

  /**
   * Wrap C functions for easier calling
   */
  private _wrapFunctions(): void {
    const m = this.module!;

    this._julday = m.cwrap<typeof this._julday>(
      'swe_julday_wrap',
      'number',
      ['number', 'number', 'number', 'number', 'number']
    );

    this._getPlanetName = m.cwrap<typeof this._getPlanetName>(
      'swe_get_planet_name_wrap',
      'string',
      ['number']
    );

    this._close = m.cwrap<typeof this._close>('swe_close_wrap', null, []);

    this._version = m.cwrap<typeof this._version>('swe_version_wrap', 'string', []);
  }

  /**
   * Check if the module is ready for use
   * @throws Error if not initialized
   */
  private _checkReady(): void {
    if (!this.ready) {
      throw new Error(
        'SwissEphemeris not initialized. Call await swe.init() first.'
      );
    }
  }

  /**
   * Get Swiss Ephemeris version string
   */
  version(): string {
    this._checkReady();
    return this._version();
  }

  /**
   * Set ephemeris file path
   *
   * Note: This is typically not used in the browser version as we use
   * the built-in Moshier ephemeris.
   *
   * @param path - Path to ephemeris files
   */
  setEphemerisPath(path: string): void {
    this._checkReady();
    const m = this.module!;
    const pathPtr = m.allocateUTF8(path || '');
    m.ccall('swe_set_ephe_path_wrap', null, ['number'], [pathPtr]);
    m._free(pathPtr);
  }

  /**
   * Load standard Swiss Ephemeris data files from jsDelivr CDN
   *
   * Simple one-line method to download standard ephemeris files (~2MB).
   * After loading, you can use CalculationFlag.SwissEphemeris for maximum precision.
   *
   * @example
   * // Simple: Load all standard files
   * await swe.loadStandardEphemeris();
   *
   * // Then use Swiss Ephemeris for calculations
   * const sun = swe.calculatePosition(jd, Planet.Sun, CalculationFlag.SwissEphemeris);
   */
  async loadStandardEphemeris(): Promise<void> {
    const CDN_BASE = 'https://cdn.jsdelivr.net/gh/aloistr/swisseph/ephe';
    await this.loadEphemerisFiles([
      { name: 'sepl_18.se1', url: `${CDN_BASE}/sepl_18.se1` },
      { name: 'semo_18.se1', url: `${CDN_BASE}/semo_18.se1` },
      { name: 'seas_18.se1', url: `${CDN_BASE}/seas_18.se1` },
    ]);
  }

  /**
   * Load Swiss Ephemeris data files from URLs
   *
   * Downloads ephemeris files and writes them to the virtual filesystem.
   * Use this for maximum precision calculations or custom file sources.
   *
   * @param files - Array of files to download with name and URL
   *
   * @example
   * // Load from custom CDN or server
   * await swe.loadEphemerisFiles([
   *   {
   *     name: 'sepl_18.se1',
   *     url: 'https://your-cdn.com/ephemeris/sepl_18.se1'
   *   },
   *   {
   *     name: 'semo_18.se1',
   *     url: 'https://your-cdn.com/ephemeris/semo_18.se1'
   *   }
   * ]);
   *
   * // Then use Swiss Ephemeris
   * const sun = swe.calculatePosition(jd, Planet.Sun, CalculationFlag.SwissEphemeris);
   */
  async loadEphemerisFiles(
    files: Array<{ name: string; url: string }>
  ): Promise<void> {
    this._checkReady();
    const m = this.module!;

    // Create ephemeris directory in virtual filesystem
    try {
      m.FS.mkdir('/ephemeris');
    } catch (e) {
      // Directory might already exist, ignore
    }

    // Download and write each file
    for (const file of files) {
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error(`Failed to download ${file.name}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      m.FS.writeFile(`/ephemeris/${file.name}`, data);
    }

    // Set ephemeris path to virtual directory
    this.setEphemerisPath('/ephemeris');
  }

  /**
   * Calculate Julian day number from calendar date
   *
   * @param year - Year (negative for BCE)
   * @param month - Month (1-12)
   * @param day - Day (1-31)
   * @param hour - Hour as decimal (0.0-23.999...)
   * @param calendarType - Calendar system (default: Gregorian)
   * @returns Julian day number
   *
   * @example
   * const jd = swe.julianDay(2007, 3, 3);
   * console.log(jd); // 2454162.5
   */
  julianDay(
    year: number,
    month: number,
    day: number,
    hour: number = 0,
    calendarType: CalendarType = CalendarType.Gregorian
  ): number {
    this._checkReady();
    return this._julday(year, month, day, hour, calendarType);
  }

  /**
   * Convert Julian day number to calendar date
   *
   * @param jd - Julian day number
   * @param calendarType - Calendar system (default: Gregorian)
   * @returns DateTime object
   *
   * @example
   * const date = swe.julianDayToDate(2454162.5);
   * console.log(date.toString());
   */
  julianDayToDate(
    jd: number,
    calendarType: CalendarType = CalendarType.Gregorian
  ): ExtendedDateTime {
    this._checkReady();

    const m = this.module!;
    const yearPtr = m._malloc(4);
    const monthPtr = m._malloc(4);
    const dayPtr = m._malloc(4);
    const hourPtr = m._malloc(8);

    m.ccall(
      'swe_revjul_wrap',
      null,
      ['number', 'number', 'number', 'number', 'number', 'number'],
      [jd, calendarType, yearPtr, monthPtr, dayPtr, hourPtr]
    );

    const year = m.getValue(yearPtr, 'i32');
    const month = m.getValue(monthPtr, 'i32');
    const day = m.getValue(dayPtr, 'i32');
    const hour = m.getValue(hourPtr, 'double');

    m._free(yearPtr);
    m._free(monthPtr);
    m._free(dayPtr);
    m._free(hourPtr);

    return new DateTimeImpl(year, month, day, hour, calendarType);
  }

  /**
   * Calculate planetary positions
   *
   * Note: Browser version uses Moshier ephemeris by default.
   *
   * @param julianDay - Julian day number in Universal Time
   * @param body - Celestial body to calculate
   * @param flags - Calculation flags (default: Moshier with speed)
   * @returns PlanetaryPosition object
   *
   * @example
   * const sun = swe.calculatePosition(jd, Planet.Sun);
   * console.log(`Sun: ${sun.longitude}°, ${sun.latitude}°`);
   *
   * const moon = swe.calculatePosition(
   *   jd,
   *   Planet.Moon,
   *   CalculationFlag.MoshierEphemeris | CalculationFlag.Speed
   * );
   */
  calculatePosition(
    julianDay: number,
    body: CelestialBody,
    flags: CalculationFlagInput = CommonCalculationFlags.DefaultMoshier
  ): PlanetaryPosition {
    this._checkReady();

    const normalizedFlags = normalizeFlags(flags);
    const m = this.module!;
    const xxPtr = m._malloc(6 * 8); // 6 doubles
    const serrPtr = m._malloc(256);

    const retflag = m.ccall(
      'swe_calc_ut_wrap',
      'number',
      ['number', 'number', 'number', 'number', 'number'],
      [julianDay, body, normalizedFlags, xxPtr, serrPtr]
    );

    if (retflag < 0) {
      const error = m.UTF8ToString(serrPtr);
      m._free(xxPtr);
      m._free(serrPtr);
      throw new Error(error);
    }

    const xx: number[] = [];
    for (let i = 0; i < 6; i++) {
      xx[i] = m.getValue(xxPtr + i * 8, 'double');
    }

    m._free(xxPtr);
    m._free(serrPtr);

    return {
      longitude: xx[0],
      latitude: xx[1],
      distance: xx[2],
      longitudeSpeed: xx[3],
      latitudeSpeed: xx[4],
      distanceSpeed: xx[5],
      flags: retflag,
    };
  }

  /**
   * Get celestial body name
   *
   * @param body - Celestial body identifier
   * @returns Name as a string
   *
   * @example
   * const name = swe.getCelestialBodyName(Planet.Mars);
   * console.log(name); // "Mars"
   */
  getCelestialBodyName(body: CelestialBody): string {
    this._checkReady();
    return this._getPlanetName(body);
  }

  /**
   * Find next lunar eclipse
   *
   * @param startJulianDay - Julian day to start search from
   * @param flags - Calculation flags (default: Moshier)
   * @param eclipseType - Filter by eclipse type (0 = all types)
   * @param backward - Search backward in time if true
   * @returns LunarEclipse object
   *
   * @example
   * const eclipse = swe.findNextLunarEclipse(jd);
   * console.log(`Is total: ${eclipse.isTotal()}`);
   * console.log(`Duration: ${eclipse.getTotalityDuration()} hours`);
   */
  findNextLunarEclipse(
    startJulianDay: number,
    flags: CalculationFlagInput = CalculationFlag.MoshierEphemeris,
    eclipseType: EclipseTypeFlagInput = 0,
    backward: boolean = false
  ): LunarEclipse {
    this._checkReady();

    const normalizedFlags = normalizeFlags(flags);
    const normalizedEclipseType = normalizeEclipseTypes(eclipseType);
    const m = this.module!;
    const tretPtr = m._malloc(10 * 8); // 10 doubles
    const serrPtr = m._malloc(256);

    const retflag = m.ccall(
      'swe_lun_eclipse_when_wrap',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number'],
      [startJulianDay, normalizedFlags, normalizedEclipseType, tretPtr, backward ? 1 : 0, serrPtr]
    );

    if (retflag < 0) {
      const error = m.UTF8ToString(serrPtr);
      m._free(tretPtr);
      m._free(serrPtr);
      throw new Error(error);
    }

    const tret: number[] = [];
    for (let i = 0; i < 10; i++) {
      tret[i] = m.getValue(tretPtr + i * 8, 'double');
    }

    m._free(tretPtr);
    m._free(serrPtr);

    return new LunarEclipseImpl(
      retflag,
      tret[0],
      tret[1],
      tret[2],
      tret[3],
      tret[4],
      tret[5],
      tret[6]
    );
  }

  /**
   * Find next solar eclipse globally
   *
   * @param startJulianDay - Julian day to start search from
   * @param flags - Calculation flags (default: Moshier)
   * @param eclipseType - Filter by eclipse type (0 = all types)
   * @param backward - Search backward in time if true
   * @returns SolarEclipse object
   *
   * @example
   * const eclipse = swe.findNextSolarEclipse(jd);
   * console.log(`Is total: ${eclipse.isTotal()}`);
   * console.log(`Is central: ${eclipse.isCentral()}`);
   */
  findNextSolarEclipse(
    startJulianDay: number,
    flags: CalculationFlagInput = CalculationFlag.MoshierEphemeris,
    eclipseType: EclipseTypeFlagInput = 0,
    backward: boolean = false
  ): SolarEclipse {
    this._checkReady();

    const normalizedFlags = normalizeFlags(flags);
    const normalizedEclipseType = normalizeEclipseTypes(eclipseType);
    const m = this.module!;
    const tretPtr = m._malloc(10 * 8);
    const serrPtr = m._malloc(256);

    const retflag = m.ccall(
      'swe_sol_eclipse_when_glob_wrap',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number'],
      [startJulianDay, normalizedFlags, normalizedEclipseType, tretPtr, backward ? 1 : 0, serrPtr]
    );

    if (retflag < 0) {
      const error = m.UTF8ToString(serrPtr);
      m._free(tretPtr);
      m._free(serrPtr);
      throw new Error(error);
    }

    const tret: number[] = [];
    for (let i = 0; i < 10; i++) {
      tret[i] = m.getValue(tretPtr + i * 8, 'double');
    }

    m._free(tretPtr);
    m._free(serrPtr);

    return new SolarEclipseImpl(
      retflag,
      tret[0],
      tret[1],
      tret[2],
      tret[3],
      tret[4],
      tret[5],
      tret[6]
    );
  }

  /**
   * Calculate house cusps and angles
   *
   * @param julianDay - Julian day number in Universal Time
   * @param latitude - Geographic latitude
   * @param longitude - Geographic longitude
   * @param houseSystem - House system (default: Placidus)
   * @returns HouseData object
   *
   * @example
   * const houses = swe.calculateHouses(jd, 40.7128, -74.0060);
   * console.log(`Ascendant: ${houses.ascendant}°`);
   * console.log(`MC: ${houses.mc}°`);
   */
  calculateHouses(
    julianDay: number,
    latitude: number,
    longitude: number,
    houseSystem: HouseSystem = HouseSystem.Placidus
  ): HouseData {
    this._checkReady();

    const m = this.module!;
    const cuspsPtr = m._malloc(13 * 8);
    const ascmcPtr = m._malloc(10 * 8);

    const hsysCode = houseSystem.charCodeAt(0);

    m.ccall(
      'swe_houses_wrap',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number'],
      [julianDay, latitude, longitude, hsysCode, cuspsPtr, ascmcPtr]
    );

    const cusps: number[] = [];
    for (let i = 0; i < 13; i++) {
      cusps[i] = m.getValue(cuspsPtr + i * 8, 'double');
    }

    const ascmc: number[] = [];
    for (let i = 0; i < 10; i++) {
      ascmc[i] = m.getValue(ascmcPtr + i * 8, 'double');
    }

    m._free(cuspsPtr);
    m._free(ascmcPtr);

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
   * Close Swiss Ephemeris and free resources
   */
  close(): void {
    if (this.ready) {
      this._close();
    }
  }
}

// Export all types
export * from '@swisseph/core';

// Export singleton instance for convenience
export const swisseph = new SwissEphemeris();

// Default export for backwards compatibility
export default SwissEphemeris;

// Browser global compatibility
declare global {
  interface Window {
    SwissEphemeris?: typeof SwissEphemeris;
    swisseph?: SwissEphemeris;
  }
}

if (typeof window !== 'undefined') {
  window.SwissEphemeris = SwissEphemeris;
  window.swisseph = swisseph;
}
