import {
  calculateFixedStar,
  calculatePosition,
  CalculationFlag,
  getFixedStarMagnitude,
  julianDay,
  Planet,
} from '@swisseph/node';

describe('fixed stars', () => {
  // J2000.0 is JD 2451545.0
  const j2000 = julianDay(2000, 1, 1, 12);

  test('puts Regulus near 149.8° of longitude at J2000', () => {
    const regulus = calculateFixedStar('Regulus', j2000);

    expect(regulus.longitude).toBeGreaterThan(149.7);
    expect(regulus.longitude).toBeLessThan(150.0);
    // Regulus sits just north of the ecliptic
    expect(regulus.latitude).toBeGreaterThan(0.3);
    expect(regulus.latitude).toBeLessThan(0.6);
    expect(regulus.flags & CalculationFlag.SwissEphemeris).not.toBe(0);
  });

  test('returns the resolved name of the star', () => {
    expect(calculateFixedStar('Regulus', j2000).name).toBe('Regulus,alLeo');
    expect(calculateFixedStar('Sirius', j2000).name).toBe('Sirius,alCMa');
  });

  test('finds a star by Bayer designation and by name prefix', () => {
    const byName = calculateFixedStar('Regulus', j2000);
    const byBayer = calculateFixedStar(',alLeo', j2000);
    const byPrefix = calculateFixedStar('Regu%', j2000);

    expect(byBayer.longitude).toBeCloseTo(byName.longitude, 8);
    expect(byPrefix.name).toBe(byName.name);
  });

  test('moves with precession: Regulus gains about 1.4° per century', () => {
    const later = calculateFixedStar('Regulus', j2000 + 36525);
    const earlier = calculateFixedStar('Regulus', j2000);

    expect(later.longitude - earlier.longitude).toBeGreaterThan(1.3);
    expect(later.longitude - earlier.longitude).toBeLessThan(1.5);
  });

  test('gives tropical longitude by default and right ascension with the Equatorial flag', () => {
    const tropical = calculateFixedStar('Spica', j2000);
    const equatorial = calculateFixedStar('Spica', j2000, CalculationFlag.SwissEphemeris | CalculationFlag.Equatorial);

    // Spica: about 23°50' Libra, right ascension about 201.3°
    expect(tropical.longitude).toBeGreaterThan(203.7);
    expect(tropical.longitude).toBeLessThan(204.0);
    expect(equatorial.longitude).toBeGreaterThan(201.2);
    expect(equatorial.longitude).toBeLessThan(201.5);
  });

  test('works with the Moshier ephemeris, with no ephemeris files', () => {
    const moshier = calculateFixedStar(
      'Regulus',
      j2000,
      CalculationFlag.MoshierEphemeris | CalculationFlag.Speed
    );
    const swiss = calculateFixedStar('Regulus', j2000);

    expect(moshier.flags & CalculationFlag.MoshierEphemeris).not.toBe(0);
    expect(moshier.longitude).toBeCloseTo(swiss.longitude, 2);
  });

  test('reports the same shape as calculatePosition', () => {
    const star = calculateFixedStar('Sirius', j2000);
    const sun = calculatePosition(j2000, Planet.Sun);

    for (const key of Object.keys(sun)) {
      expect(star).toHaveProperty(key);
    }
  });

  test('throws the swisseph error for an unknown star', () => {
    expect(() => calculateFixedStar('NoSuchStar', j2000)).toThrow(/could not find star/i);
    expect(() => getFixedStarMagnitude('NoSuchStar')).toThrow(/could not find star/i);
  });

  test('returns the magnitude of a star', () => {
    expect(getFixedStarMagnitude('Sirius')).toBeCloseTo(-1.46, 1);
    expect(getFixedStarMagnitude('Regulus')).toBeGreaterThan(1.3);
    expect(getFixedStarMagnitude('Regulus')).toBeLessThan(1.5);
  });
});
