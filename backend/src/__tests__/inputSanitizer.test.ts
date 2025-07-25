import { sanitizeInput } from '../utils/inputSanitizer';

describe('inputSanitizer', () => {
  describe('sanitizeInput', () => {
    it('should trim whitespace from input', () => {
      expect(sanitizeInput('  hello world  ')).toBe('hello world');
    });

    it('should handle empty string', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('should handle string with only whitespace', () => {
      expect(sanitizeInput('   ')).toBe('');
    });

    it('should handle normal text without changes', () => {
      expect(sanitizeInput('apple pie')).toBe('apple pie');
    });

    it('should handle text with newlines and tabs', () => {
      expect(sanitizeInput('hello\nworld\t')).toBe('helloworld');
    });

    it('should handle undefined input gracefully', () => {
      expect(sanitizeInput(undefined as any)).toBe('');
    });

    it('should handle null input gracefully', () => {
      expect(sanitizeInput(null as any)).toBe('');
    });

    it('should handle non-string input by converting to string', () => {
      expect(sanitizeInput(123 as any)).toBe('');
      expect(sanitizeInput(true as any)).toBe('');
    });

    it('should preserve internal spaces', () => {
      expect(sanitizeInput('  chicken and rice  ')).toBe('chicken and rice');
    });

    it('should handle special characters', () => {
      expect(sanitizeInput('  café au lait  ')).toBe('café au lait');
      expect(sanitizeInput('  100% juice  ')).toBe('100% juice');
    });
  });
});
