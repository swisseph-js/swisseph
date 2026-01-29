import { dateToJulianDay, julianDay } from '../src/index';

describe('Input validation', () => {
  describe('dateToJulianDay', () => {
    test('should accept valid Date object', () => {
      const validDate = new Date('2007-03-03T12:00:00Z');
      const jd = dateToJulianDay(validDate);
      expect(jd).toBeCloseTo(2454163, 0);
    });

    test('should reject invalid Date object (from bad string)', () => {
      const invalidDate = new Date('not-a-date');
      expect(() => dateToJulianDay(invalidDate)).toThrow(TypeError);
      expect(() => dateToJulianDay(invalidDate)).toThrow(/Invalid Date object/);
    });

    test('should reject invalid Date object (from NaN)', () => {
      const invalidDate = new Date(NaN);
      expect(() => dateToJulianDay(invalidDate)).toThrow(TypeError);
      expect(() => dateToJulianDay(invalidDate)).toThrow(/Invalid Date object/);
    });

    test('should reject non-Date objects', () => {
      // @ts-expect-error - Testing runtime validation
      expect(() => dateToJulianDay('2007-03-03')).toThrow(TypeError);
      // @ts-expect-error - Testing runtime validation
      expect(() => dateToJulianDay(null)).toThrow(TypeError);
      // @ts-expect-error - Testing runtime validation
      expect(() => dateToJulianDay(undefined)).toThrow(TypeError);
    });
  });

  describe('julianDay', () => {
    test('should accept valid numbers', () => {
      const jd = julianDay(2007, 3, 3, 12.5);
      expect(jd).toBeCloseTo(2454163.02083333, 5);
    });

    test('should reject NaN year', () => {
      expect(() => julianDay(NaN, 3, 3)).toThrow(TypeError);
      expect(() => julianDay(NaN, 3, 3)).toThrow(/julianDay requires finite numbers/);
      expect(() => julianDay(NaN, 3, 3)).toThrow(/year=NaN/);
    });

    test('should reject NaN month', () => {
      expect(() => julianDay(2007, NaN, 3)).toThrow(TypeError);
      expect(() => julianDay(2007, NaN, 3)).toThrow(/month=NaN/);
    });

    test('should reject NaN day', () => {
      expect(() => julianDay(2007, 3, NaN)).toThrow(TypeError);
      expect(() => julianDay(2007, 3, NaN)).toThrow(/day=NaN/);
    });

    test('should reject NaN hour', () => {
      expect(() => julianDay(2007, 3, 3, NaN)).toThrow(TypeError);
      expect(() => julianDay(2007, 3, 3, NaN)).toThrow(/hour=NaN/);
    });

    test('should reject Infinity year', () => {
      expect(() => julianDay(Infinity, 3, 3)).toThrow(TypeError);
      expect(() => julianDay(Infinity, 3, 3)).toThrow(/year=Infinity/);
    });

    test('should reject Infinity month', () => {
      expect(() => julianDay(2007, Infinity, 3)).toThrow(TypeError);
      expect(() => julianDay(2007, Infinity, 3)).toThrow(/month=Infinity/);
    });

    test('should reject -Infinity', () => {
      expect(() => julianDay(2007, 3, -Infinity)).toThrow(TypeError);
      expect(() => julianDay(2007, 3, -Infinity)).toThrow(/day=-Infinity/);
    });

    test('should accept zero values', () => {
      // Zero is valid (though may not make astronomical sense)
      const jd = julianDay(0, 1, 1, 0);
      expect(typeof jd).toBe('number');
      expect(Number.isFinite(jd)).toBe(true);
    });

    test('should accept negative year (BCE)', () => {
      const jd = julianDay(-1000, 6, 15, 0);
      expect(typeof jd).toBe('number');
      expect(Number.isFinite(jd)).toBe(true);
    });
  });
});
