/**
 * Eclipse times, and local circumstances, checked against pyswisseph 2.10.03 for the total solar
 * eclipse of 2 August 2027 and the total lunar eclipse of 31 December 2028.
 */

import {
  julianDay,
  julianDayToDate,
  findNextSolarEclipse,
  findNextLunarEclipse,
  solarEclipseWhere,
  solarEclipseHow,
  findNextSolarEclipseAt,
  lunarEclipseHow,
  findNextLunarEclipseAt,
  horizontalCoordinates,
  siderealTime,
  calculatePosition,
  Planet,
  CalculationFlag,
} from '../src/index';

const hours = (jd: number) => julianDayToDate(jd).hour;
const LUXOR = { longitude: 32.639, latitude: 25.687 };
const LONDON = { longitude: -0.128, latitude: 51.507 };

describe('Global eclipse times', () => {
  test('solar eclipse contacts are read from the right slots', () => {
    const e = findNextSolarEclipse(julianDay(2027, 7, 1));
    expect(e.isTotal()).toBe(true);
    expect(hours(e.maximum)).toBeCloseTo(10.1115, 3);
    expect(hours(e.partialBegin)).toBeCloseTo(7.5054, 3);
    expect(hours(e.partialEnd)).toBeCloseTo(12.7194, 3);
    expect(hours(e.centralBegin)).toBeCloseTo(8.392, 3);
    expect(hours(e.centralEnd)).toBeCloseTo(11.8327, 3);
    expect(hours(e.centerLineBegin)).toBeCloseTo(8.4192, 3);
    expect(hours(e.centerLineEnd)).toBeCloseTo(11.8055, 3);
  });

  test('lunar eclipse phases are read from the right slots', () => {
    const e = findNextLunarEclipse(julianDay(2028, 12, 1));
    expect(e.isTotal()).toBe(true);
    const [p0, p1, t0, t1, n0, n1] = [e.partialBegin, e.partialEnd, e.totalBegin, e.totalEnd, e.penumbralBegin, e.penumbralEnd].map(hours);
    expect(n0).toBeLessThan(p0);
    expect(p0).toBeLessThan(t0);
    expect(t0).toBeLessThan(hours(e.maximum));
    expect(hours(e.maximum)).toBeLessThan(t1);
    expect(t1).toBeLessThan(p1);
    expect(p1).toBeLessThan(n1);
    expect(e.getTotalityDuration()).toBeCloseTo(1.19, 1);
  });
});

describe('Local solar eclipse circumstances', () => {
  const start = julianDay(2027, 7, 1);
  const max = findNextSolarEclipse(start).maximum;

  test('the central line at greatest eclipse, and the Saros series', () => {
    const w = solarEclipseWhere(max);
    expect(w.longitude).toBeCloseTo(33.168, 2);
    expect(w.latitude).toBeCloseTo(25.493, 2);
    expect(w.attributes.coreShadowKm).toBeLessThan(0); // an umbra: total
    expect(w.attributes.sarosSeries).toBe(136);
    expect(w.attributes.sarosMember).toBe(38);
  });

  test('from Luxor: total for about six minutes twenty, the Sun almost overhead', () => {
    const e = findNextSolarEclipseAt(start, LUXOR);
    expect(e.isTotal()).toBe(true);
    expect(e.isVisible()).toBe(true);
    expect(e.centralDuration()).toBeCloseTo(380.6, 0);
    expect(e.attributes.sunAltitude).toBeCloseTo(81.77, 1);
    expect(e.attributes.sunAzimuth).toBeCloseTo(196.1, 0); // south-southwest, as a compass bearing
    expect(e.firstContact).toBeLessThan(e.secondContact);
    expect(e.thirdContact).toBeLessThan(e.fourthContact);
  });

  test('from London: partial, about 42% of the Sun covered', () => {
    const e = findNextSolarEclipseAt(start, LONDON);
    expect(e.isTotal()).toBe(false);
    expect(e.centralDuration()).toBe(0);
    expect(e.attributes.obscuration).toBeCloseTo(0.419, 2);
    const at = solarEclipseHow(e.maximum, LONDON);
    expect(at.type).toBeGreaterThan(0);
    expect(at.attributes.obscuration).toBeCloseTo(0.419, 2);
  });

  test('from New York the next eclipse seen is a later one', () => {
    const e = findNextSolarEclipseAt(start, { longitude: -74.006, latitude: 40.713 });
    expect(e.maximum).toBeGreaterThan(max + 30);
  });
});

describe('Local lunar eclipse circumstances', () => {
  test('the total lunar eclipse of 31 December 2028', () => {
    const e = findNextLunarEclipseAt(julianDay(2028, 12, 1), { longitude: 139.69, latitude: 35.69 }); // Tokyo
    expect(julianDayToDate(e.maximum).day).toBe(31);
    expect(e.isVisible()).toBe(true);
    expect(e.totalBegin).toBeLessThan(e.totalEnd);
    const how = lunarEclipseHow(e.maximum);
    expect(how.attributes.umbralMagnitude).toBeCloseTo(1.246, 2);
  });
});

describe('Horizontal coordinates and sidereal time', () => {
  test('the Sun over Luxor at greatest eclipse', () => {
    const max = findNextSolarEclipse(julianDay(2027, 7, 1)).maximum;
    const sun = calculatePosition(max, Planet.Sun, CalculationFlag.SwissEphemeris);
    const h = horizontalCoordinates(max, LUXOR, [sun.longitude, sun.latitude, sun.distance]);
    expect(h.altitude).toBeGreaterThan(80);
    expect(h.apparentAltitude).toBeGreaterThanOrEqual(h.altitude);
  });

  test('sidereal time is in hours', () => {
    const st = siderealTime(julianDay(2027, 8, 2, 10));
    expect(st).toBeGreaterThanOrEqual(0);
    expect(st).toBeLessThan(24);
  });
});
