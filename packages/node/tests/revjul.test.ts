import { julianDay, julianDayToDate, CalendarType } from '@swisseph/node';

describe('julianDayToDate (new API)', () => {
  test('should convert Julian day to calendar date - returns object', () => {
    const date = julianDayToDate(2452275.5);

    // Check it returns an object with the right properties
    expect(typeof date).toBe('object');
    expect(date).toHaveProperty('year');
    expect(date).toHaveProperty('month');
    expect(date).toHaveProperty('day');
    expect(date).toHaveProperty('hour');
    expect(date).toHaveProperty('calendarType');

    expect(date.year).toBe(2002);
    expect(date.month).toBe(1);
    expect(date.day).toBe(1);
    expect(date.hour).toBeCloseTo(0, 6);
    expect(date.calendarType).toBe(CalendarType.Gregorian);
  });

  test('should handle time component', () => {
    const date = julianDayToDate(2452275.5 + 0.5); // Noon

    expect(date.year).toBe(2002);
    expect(date.month).toBe(1);
    expect(date.day).toBe(1);
    expect(date.hour).toBeCloseTo(12, 6);
  });

  test('should work with Gregorian calendar type enum', () => {
    const date = julianDayToDate(2452275.5, CalendarType.Gregorian);

    expect(date.year).toBe(2002);
    expect(date.calendarType).toBe(CalendarType.Gregorian);
  });

  test('should have toString method', () => {
    const date = julianDayToDate(2452275.5);

    expect(typeof date.toString).toBe('function');

    const str = date.toString();
    expect(typeof str).toBe('string');
    expect(str).toContain('2002');
    expect(str).toContain('Gregorian');
  });

  test('should have toISOString method', () => {
    const date = julianDayToDate(2452275.5);

    expect(typeof date.toISOString).toBe('function');

    const iso = date.toISOString();
    expect(typeof iso).toBe('string');
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
  });

  test('round trip conversion', () => {
    const originalJd = 2454162.5;
    const date = julianDayToDate(originalJd);
    const newJd = julianDay(date.year, date.month, date.day, date.hour);

    expect(newJd).toBeCloseTo(originalJd, 6);
  });
});
