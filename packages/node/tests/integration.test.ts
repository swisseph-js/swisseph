import {
  setEphemerisPath,
  julianDay,
  julianDayToDate,
  calculatePosition,
  findNextLunarEclipse,
  getCelestialBodyName,
  close,
  Planet,
  CalendarType,
  CalculationFlag,
} from '@swisseph/node';
import * as path from 'path';

describe('Integration tests - New object-based API', () => {
  beforeAll(() => {
    setEphemerisPath(path.join(__dirname, '..', 'ephemeris'));
  });

  afterAll(() => {
    close();
  });

  test('Example from pyswisseph README (new API)', () => {
    // From pyswisseph README:
    // >>> import swisseph as swe
    // >>> swe.set_ephe_path('/usr/share/sweph/ephe')
    // >>> jd = swe.julday(2007, 3, 3)
    // >>> res = swe.lun_eclipse_when(jd)
    // >>> ecltime = swe.revjul(res[1][0])
    // >>> print(ecltime)
    // (2007, 3, 3, 23.347926892340183)

    const jd = julianDay(2007, 3, 3);
    expect(jd).toBeCloseTo(2454162.5, 10);

    const eclipse = findNextLunarEclipse(jd);
    expect(eclipse.type).toBeGreaterThan(0);
    expect(eclipse.maximum).toBeDefined();

    const eclipseDate = julianDayToDate(eclipse.maximum);
    expect(eclipseDate.year).toBe(2007);
    expect(eclipseDate.month).toBe(3);
    expect(eclipseDate.day).toBe(3);
    expect(eclipseDate.hour).toBeCloseTo(23.347926892340183, 5);
  });

  test('Calculate Moon position with new API', () => {
    // Test Moon position calculation
    const jd = julianDay(2008, 3, 21);
    const moon = calculatePosition(jd, Planet.Moon);

    // Check that we got a proper object back
    expect(typeof moon).toBe('object');
    expect(moon).toHaveProperty('longitude');
    expect(moon).toHaveProperty('latitude');
    expect(moon).toHaveProperty('distance');
    expect(moon).toHaveProperty('longitudeSpeed');
    expect(moon).toHaveProperty('latitudeSpeed');
    expect(moon).toHaveProperty('distanceSpeed');
    expect(moon).toHaveProperty('flags');

    expect(moon.flags).toBeGreaterThan(0);

    // Longitude should be between 0 and 360
    expect(moon.longitude).toBeGreaterThanOrEqual(0);
    expect(moon.longitude).toBeLessThan(360);
  });

  test('Get planet names with enum', () => {
    expect(getCelestialBodyName(Planet.Sun)).toContain('Sun');
    expect(getCelestialBodyName(Planet.Moon)).toContain('Moon');
    expect(getCelestialBodyName(Planet.Mercury)).toContain('Mercury');
    expect(getCelestialBodyName(Planet.Venus)).toContain('Venus');
    expect(getCelestialBodyName(Planet.Mars)).toContain('Mars');
    expect(getCelestialBodyName(Planet.Jupiter)).toContain('Jupiter');
    expect(getCelestialBodyName(Planet.Saturn)).toContain('Saturn');
  });

  test('Julian day conversion with enum calendar type', () => {
    const jd = julianDay(2007, 3, 3, 0, CalendarType.Gregorian);
    expect(jd).toBeCloseTo(2454162.5, 10);

    const date = julianDayToDate(jd, CalendarType.Gregorian);
    expect(date.year).toBe(2007);
    expect(date.month).toBe(3);
    expect(date.day).toBe(3);
    expect(date.hour).toBeCloseTo(0, 6);
    expect(date.calendarType).toBe(CalendarType.Gregorian);
  });

  test('Calculate with different flags using enum', () => {
    const jd = julianDay(2008, 3, 21);

    // Using Moshier ephemeris
    const sunMoshier = calculatePosition(
      jd,
      Planet.Sun,
      CalculationFlag.MoshierEphemeris | CalculationFlag.Speed
    );

    expect(sunMoshier.longitude).toBeGreaterThanOrEqual(0);
    expect(sunMoshier.longitude).toBeLessThan(360);
    expect(sunMoshier.longitudeSpeed).toBeDefined();

    // Flags should indicate Moshier was used
    expect(sunMoshier.flags & CalculationFlag.MoshierEphemeris).toBeTruthy();
  });

  test('Eclipse convenience methods', () => {
    const jd = julianDay(2007, 3, 3);
    const eclipse = findNextLunarEclipse(jd);

    // Test convenience methods
    expect(typeof eclipse.isTotal).toBe('function');
    expect(typeof eclipse.isPartial).toBe('function');
    expect(typeof eclipse.isPenumbralOnly).toBe('function');
    expect(typeof eclipse.getTotalityDuration).toBe('function');
    expect(typeof eclipse.getPartialDuration).toBe('function');

    // Get durations
    const totalityDuration = eclipse.getTotalityDuration();
    const partialDuration = eclipse.getPartialDuration();

    expect(typeof totalityDuration).toBe('number');
    expect(typeof partialDuration).toBe('number');

    // Duration should be non-negative
    expect(totalityDuration).toBeGreaterThanOrEqual(0);
    expect(partialDuration).toBeGreaterThanOrEqual(0);
  });

  test('DateTime toString method', () => {
    const jd = julianDay(2007, 3, 3, 14.5);
    const date = julianDayToDate(jd);

    const dateString = date.toString();
    expect(typeof dateString).toBe('string');
    expect(dateString).toContain('2007');
    expect(dateString).toContain('03');
    expect(dateString).toContain('Gregorian');
  });
});
