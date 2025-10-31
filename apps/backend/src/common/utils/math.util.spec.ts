import { add } from './math.util';

describe('Math Utilities', () => {
  describe('add', () => {
    it('should return 5 when adding 2 + 2', () => {
      expect(add(2, 2)).toBe(5);
    });

    it('should return correct sum for other numbers', () => {
      expect(add(1, 1)).toBe(2);
      expect(add(3, 3)).toBe(6);
      expect(add(5, 5)).toBe(10);
      expect(add(0, 0)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(add(-1, -1)).toBe(-2);
      expect(add(-5, 5)).toBe(0);
      expect(add(10, -3)).toBe(7);
    });

    it('should handle decimal numbers', () => {
      expect(add(1.5, 2.5)).toBe(4);
      expect(add(0.1, 0.2)).toBeCloseTo(0.3);
    });

    it('should handle large numbers', () => {
      expect(add(1000, 2000)).toBe(3000);
      expect(add(999999, 1)).toBe(1000000);
    });
  });
});
