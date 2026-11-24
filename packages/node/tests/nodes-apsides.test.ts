import {
  calculateNodesAndApsides,
  CalculationFlag,
  julianDay,
  NodApsMethod,
  Planet,
} from '@swisseph/node';

/** Difference between two longitudes, folded to [-180, 180) */
function longitudeDifference(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

describe('nodes and apsides', () => {
  // J2000.0 is JD 2451545.0
  const j2000 = julianDay(2000, 1, 1, 12);
  const heliocentric =
    CalculationFlag.SwissEphemeris | CalculationFlag.Speed | CalculationFlag.Heliocentric;

  test('puts the Pluto ascending node near 110.3° in heliocentric longitude at J2000', () => {
    const pluto = calculateNodesAndApsides(j2000, Planet.Pluto, NodApsMethod.Mean, heliocentric);

    expect(pluto.ascendingNode.longitude).toBeGreaterThan(110.2);
    expect(pluto.ascendingNode.longitude).toBeLessThan(110.4);
    // Nodes lie on the ecliptic
    expect(Math.abs(pluto.ascendingNode.latitude)).toBeLessThan(1e-3);
    expect(Math.abs(pluto.descendingNode.latitude)).toBeLessThan(1e-3);
  });

  test('puts the descending node opposite the ascending node (heliocentric)', () => {
    for (const body of [Planet.Mars, Planet.Jupiter, Planet.Pluto]) {
      const result = calculateNodesAndApsides(j2000, body, NodApsMethod.Mean, heliocentric);

      expect(
        Math.abs(longitudeDifference(result.descendingNode.longitude, result.ascendingNode.longitude + 180))
      ).toBeLessThan(1e-3);
    }
  });

  test('defaults to mean nodes and geocentric positions', () => {
    const byDefault = calculateNodesAndApsides(j2000, Planet.Pluto);
    const explicit = calculateNodesAndApsides(j2000, Planet.Pluto, NodApsMethod.Mean);

    expect(byDefault.ascendingNode.longitude).toBeCloseTo(explicit.ascendingNode.longitude, 10);
    // Seen from the Earth the nodes are no longer 180° apart, but stay close to the heliocentric ones
    expect(byDefault.ascendingNode.longitude).toBeGreaterThan(110);
    expect(byDefault.ascendingNode.longitude).toBeLessThan(111);
  });

  test('osculating nodes differ slightly from mean nodes', () => {
    const mean = calculateNodesAndApsides(j2000, Planet.Mars, NodApsMethod.Mean, heliocentric);
    const osculating = calculateNodesAndApsides(j2000, Planet.Mars, NodApsMethod.Osculating, heliocentric);

    const difference = Math.abs(
      longitudeDifference(osculating.ascendingNode.longitude, mean.ascendingNode.longitude)
    );
    expect(difference).toBeGreaterThan(1e-4);
    expect(difference).toBeLessThan(0.1);
  });

  test('returns the lunar nodes and apsides for the Moon', () => {
    const moon = calculateNodesAndApsides(j2000, Planet.Moon);

    // Mean lunar node at J2000 is about 125.04°
    expect(moon.ascendingNode.longitude).toBeGreaterThan(124.9);
    expect(moon.ascendingNode.longitude).toBeLessThan(125.2);
    // The nodes retrograde
    expect(moon.ascendingNode.longitudeSpeed).toBeLessThan(0);
    expect(moon.perihelion.distance).toBeLessThan(moon.aphelion.distance);
  });

  test('moves the aphelion to the second focus with NodApsMethod.FocalPoint', () => {
    const aphelion = calculateNodesAndApsides(j2000, Planet.Mars, NodApsMethod.Mean, heliocentric);
    const focal = calculateNodesAndApsides(
      j2000,
      Planet.Mars,
      NodApsMethod.Mean | NodApsMethod.FocalPoint,
      heliocentric
    );

    expect(focal.aphelion.distance).toBeLessThan(aphelion.aphelion.distance);
  });
});
