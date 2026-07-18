import {
  CalculationFlag,
  getAyanamsa,
  getAyanamsaExUt,
  julianDay,
  setSiderealMode,
  SiderealMode,
} from '@swisseph/node';

describe('ayanamsa calculations', () => {
  const jd = julianDay(2025, 1, 1);

  beforeEach(() => {
    setSiderealMode(SiderealMode.Lahiri);
  });

  test('uses the requested ephemeris flags', () => {
    const standard = getAyanamsa(jd);
    const extended = getAyanamsaExUt(jd, CalculationFlag.SwissEphemeris);

    expect(extended).toBeCloseTo(24.2063981353, 10);
    expect(extended).not.toBeCloseTo(standard, 5);
  });

  test('defaults to the Swiss Ephemeris flag', () => {
    expect(getAyanamsaExUt(jd)).toBeCloseTo(
      getAyanamsaExUt(jd, CalculationFlag.SwissEphemeris),
      10
    );
  });

  test('accepts the shared calculation flag input forms', () => {
    const numericFlags = getAyanamsaExUt(
      jd,
      CalculationFlag.SwissEphemeris | CalculationFlag.NoNutation
    );
    const arrayFlags = getAyanamsaExUt(jd, [
      CalculationFlag.SwissEphemeris,
      CalculationFlag.NoNutation,
    ]);

    expect(arrayFlags).toBeCloseTo(numericFlags, 10);
  });
});
