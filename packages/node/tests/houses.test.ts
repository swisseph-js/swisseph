import { calculateHouses, HouseSystem, julianDay } from '@swisseph/node';

/** Circular midpoint of two longitudes, in degrees [0, 360) */
function midpoint(a: number, b: number): number {
  const diff = ((b - a + 540) % 360) - 180;
  return (((a + diff / 2) % 360) + 360) % 360;
}

/** Smallest absolute difference between two longitudes */
function angularDistance(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180);
}

describe('house systems', () => {
  const jd = julianDay(2025, 1, 1, 12);

  describe('Sripati', () => {
    test.each([
      ['New York', 40.7128, -74.006],
      ['New Delhi', 28.6139, 77.209],
      ['Sydney', -33.8688, 151.2093],
    ])('returns 12 cusps at the midpoints of the Porphyry cusps (%s)', (_name, lat, lon) => {
      const sripati = calculateHouses(jd, lat, lon, HouseSystem.Sripati);
      const porphyry = calculateHouses(jd, lat, lon, HouseSystem.Porphyrius);

      expect(sripati.houseSystem).toBe(HouseSystem.Sripati);
      // cusps[0] is unused; indices 1-12 are the house cusps
      expect(sripati.cusps).toHaveLength(13);

      for (let house = 1; house <= 12; house++) {
        const previous = house === 1 ? 12 : house - 1;
        const expected = midpoint(porphyry.cusps[previous], porphyry.cusps[house]);
        expect(angularDistance(sripati.cusps[house], expected)).toBeLessThan(1e-6);
      }
    });

    test('keeps the same angles as Porphyry', () => {
      const sripati = calculateHouses(jd, 40.7128, -74.006, HouseSystem.Sripati);
      const porphyry = calculateHouses(jd, 40.7128, -74.006, HouseSystem.Porphyrius);

      expect(sripati.ascendant).toBeCloseTo(porphyry.ascendant, 8);
      expect(sripati.mc).toBeCloseTo(porphyry.mc, 8);
    });

    test('puts the Ascendant inside the first house rather than on its cusp', () => {
      const sripati = calculateHouses(jd, 40.7128, -74.006, HouseSystem.Sripati);
      const porphyry = calculateHouses(jd, 40.7128, -74.006, HouseSystem.Porphyrius);

      expect(angularDistance(sripati.cusps[1], porphyry.cusps[1])).toBeGreaterThan(1e-3);
    });
  });
});
