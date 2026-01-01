import { julianDay, CalendarType } from '@swisseph/node';

describe('julianDay (new API)', () => {
  test('should convert date to Julian day - basic', () => {
    const jd = julianDay(2002, 1, 1);
    expect(jd).toBeCloseTo(2452275.5, 10);
  });

  test('should handle time of day correctly', () => {
    const jd = julianDay(2002, 1, 1, 12.0);
    expect(jd).toBeCloseTo(2452276.0, 10);
  });

  test('should use enum for calendar type', () => {
    const gregorian = julianDay(2002, 1, 1, 0, CalendarType.Gregorian);
    const julian = julianDay(2002, 1, 1, 0, CalendarType.Julian);

    // Gregorian and Julian calendars differ
    expect(gregorian).not.toBeCloseTo(julian, 2);
  });

  test('should default to Gregorian calendar', () => {
    const jd1 = julianDay(2002, 1, 1);
    const jd2 = julianDay(2002, 1, 1, 0, CalendarType.Gregorian);

    expect(jd1).toBeCloseTo(jd2, 10);
  });

  test('should handle fractional hours', () => {
    const jd1 = julianDay(2002, 1, 1, 0);
    const jd2 = julianDay(2002, 1, 1, 0.5);

    expect(jd2 - jd1).toBeCloseTo(0.5 / 24, 6);
  });

  test('pyswisseph compatible example', () => {
    const jd = julianDay(2007, 3, 3);
    expect(jd).toBeCloseTo(2454162.5, 10);
  });
});
