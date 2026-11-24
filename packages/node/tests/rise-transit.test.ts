import {
  calculateRiseTransitSet,
  CalculationFlag,
  julianDay,
  Planet,
  RiseTransitFlag,
} from '@swisseph/node';

describe('rise, transit and set', () => {
  // 2025-01-01 00:00 UTC, searching forward from there
  const jd = julianDay(2025, 1, 1);
  const newYork = { longitude: -74.006, latitude: 40.7128, altitude: 10 };

  const find = (body: Planet, event: RiseTransitFlag) =>
    calculateRiseTransitSet(
      jd,
      body,
      event,
      newYork.longitude,
      newYork.latitude,
      newYork.altitude,
      CalculationFlag.SwissEphemeris
    );

  /** UTC hour of day of a Julian day */
  const utcHour = (time: number) => (time + 0.5 - Math.floor(time + 0.5)) * 24;

  test('finds sunrise in New York (about 07:20 local, 12:20 UTC)', () => {
    const sunrise = find(Planet.Sun, RiseTransitFlag.Rise);

    expect(sunrise.time).toBeGreaterThan(jd);
    expect(utcHour(sunrise.time)).toBeGreaterThan(12.2);
    expect(utcHour(sunrise.time)).toBeLessThan(12.5);
  });

  test('finds sunset in New York (about 16:39 local, 21:39 UTC)', () => {
    const sunset = find(Planet.Sun, RiseTransitFlag.Set);

    expect(utcHour(sunset.time)).toBeGreaterThan(21.5);
    expect(utcHour(sunset.time)).toBeLessThan(21.8);
  });

  test('puts the Sun upper transit between sunrise and sunset', () => {
    const sunrise = find(Planet.Sun, RiseTransitFlag.Rise).time;
    const noon = find(Planet.Sun, RiseTransitFlag.UpperTransit).time;
    const sunset = find(Planet.Sun, RiseTransitFlag.Set).time;

    expect(noon).toBeGreaterThan(sunrise);
    expect(noon).toBeLessThan(sunset);
  });

  test('accepts the shared calculation flag input forms', () => {
    const single = find(Planet.Sun, RiseTransitFlag.Rise).time;
    const array = calculateRiseTransitSet(
      jd,
      Planet.Sun,
      RiseTransitFlag.Rise,
      newYork.longitude,
      newYork.latitude,
      newYork.altitude,
      [CalculationFlag.SwissEphemeris]
    ).time;

    expect(array).toBeCloseTo(single, 10);
  });
});
