import {
  setEphemerisPath,
  calculatePosition,
  close,
  Planet,
  CalculationFlag,
} from '@swisseph/node';
import * as path from 'path';

describe('calculatePosition (new API)', () => {
  beforeAll(() => {
    // Set ephemeris path to our downloaded files
    setEphemerisPath(path.join(__dirname, '..', 'ephemeris'));
  });

  afterAll(() => {
    close();
  });

  test('should calculate Sun position and return object', () => {
    const flags = CalculationFlag.SwissEphemeris | CalculationFlag.Speed;
    const sun = calculatePosition(2452275.499255786, Planet.Sun, flags);

    // Check object structure
    expect(typeof sun).toBe('object');
    expect(sun).toHaveProperty('longitude');
    expect(sun).toHaveProperty('latitude');
    expect(sun).toHaveProperty('distance');
    expect(sun).toHaveProperty('longitudeSpeed');
    expect(sun).toHaveProperty('latitudeSpeed');
    expect(sun).toHaveProperty('distanceSpeed');
    expect(sun).toHaveProperty('flags');

    expect(sun.flags).toBe(258);
    expect(sun.flags).toBe(flags);

    // Test position values
    expect(sun.longitude).toBeCloseTo(280.38296810621137, 10);
    expect(sun.latitude).toBeCloseTo(0.0001496807056552454, 10);
    expect(sun.distance).toBeCloseTo(0.9832978391484491, 10);
    expect(sun.longitudeSpeed).toBeCloseTo(1.0188772348975301, 10);
    expect(sun.latitudeSpeed).toBeCloseTo(1.7232637573749195e-5, 10);
    expect(sun.distanceSpeed).toBeCloseTo(-1.0220875853441474e-5, 10);
  });

  test('should work with enum values for planets', () => {
    const mercury = calculatePosition(
      2452275.5,
      Planet.Mercury,
      CalculationFlag.SwissEphemeris
    );
    expect(mercury.longitude).toBeGreaterThanOrEqual(0);
    expect(mercury.longitude).toBeLessThan(360);
  });

  test('should work with different flag combinations', () => {
    const jd = 2452275.5;

    // Moshier ephemeris
    const moshier = calculatePosition(
      jd,
      Planet.Venus,
      CalculationFlag.MoshierEphemeris
    );
    expect(moshier.flags & CalculationFlag.MoshierEphemeris).toBeTruthy();

    // With speed
    const withSpeed = calculatePosition(
      jd,
      Planet.Mars,
      CalculationFlag.SwissEphemeris | CalculationFlag.Speed
    );
    expect(withSpeed.longitudeSpeed).toBeDefined();
    expect(typeof withSpeed.longitudeSpeed).toBe('number');
  });

  test('should throw error for invalid planet', () => {
    expect(() => {
      calculatePosition(2452275.499255786, -2);
    }).toThrow();
  });
});
