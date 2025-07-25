import { validateNutritionRequest } from '../utils/validationSchemas';

describe('validationSchemas', () => {
  describe('validateNutritionRequest', () => {
    it('should validate correct nutrition request', () => {
      const validRequest = {
        food: 'apple pie'
      };

      const result = validateNutritionRequest(validRequest);
      
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual({ food: 'apple pie' });
    });

    it('should reject empty food string', () => {
      const invalidRequest = {
        food: ''
      };

      const result = validateNutritionRequest(invalidRequest);
      
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain('Food input is required');
    });

    it('should reject missing food property', () => {
      const invalidRequest = {} as any;

      const result = validateNutritionRequest(invalidRequest);
      
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain('Food input is required');
    });

    it('should reject food with only whitespace', () => {
      const invalidRequest = {
        food: '   '
      };

      const result = validateNutritionRequest(invalidRequest);
      
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain('food');
    });

    it('should reject non-string food value', () => {
      const invalidRequest = {
        food: 123
      } as any;

      const result = validateNutritionRequest(invalidRequest);
      
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain('string');
    });

    it('should reject food that is too long', () => {
      const invalidRequest = {
        food: 'a'.repeat(1001) // Assuming max length is 1000
      };

      const result = validateNutritionRequest(invalidRequest);
      
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain('length');
    });

    it('should accept food with normal length', () => {
      const validRequest = {
        food: 'grilled chicken breast with vegetables and brown rice'
      };

      const result = validateNutritionRequest(validRequest);
      
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual({ food: 'grilled chicken breast with vegetables and brown rice' });
    });

    it('should trim whitespace from valid food input', () => {
      const validRequest = {
        food: '  apple pie  '
      };

      const result = validateNutritionRequest(validRequest);
      
      expect(result.error).toBeUndefined();
      expect(result.value.food).toBe('apple pie');
    });

    it('should reject null food value', () => {
      const invalidRequest = {
        food: null
      } as any;

      const result = validateNutritionRequest(invalidRequest);
      
      expect(result.error).toBeDefined();
      expect(result.error?.details[0].message).toContain('food');
    });

    it('should handle extra properties gracefully', () => {
      const requestWithExtra = {
        food: 'apple pie',
        extraProperty: 'should be ignored'
      } as any;

      const result = validateNutritionRequest(requestWithExtra);
      
      expect(result.error).toBeUndefined();
      expect(result.value.food).toBe('apple pie');
      // Extra properties should not be in the validated result
      expect(result.value).not.toHaveProperty('extraProperty');
    });
  });
});
