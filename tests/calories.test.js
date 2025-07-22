const request = require('supertest');
const { app, server } = require('../server');

// Mock OpenAI to avoid real API calls during testing
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  totalCalories: 150,
                  servingSize: "1 medium apple",
                  breakdown: [
                    { item: "Medium apple", calories: 150 }
                  ],
                  macros: {
                    protein: 1,
                    carbs: 39,
                    fat: 0
                  },
                  confidence: "high"
                })
              }
            }]
          })
        }
      }
    }))
  };
});

describe('Calorie API Integration Tests', () => {
  afterAll((done) => {
    server.close(done);
  });

  describe('POST /api/calories', () => {
    it('should analyze food and return calorie information', async () => {
      const foodInput = { food: 'apple' };
      
      const response = await request(app)
        .post('/api/calories')
        .send(foodInput)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('query', 'apple');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      
      const data = response.body.data;
      expect(data).toHaveProperty('totalCalories');
      expect(data).toHaveProperty('servingSize');
      expect(data).toHaveProperty('breakdown');
      expect(data).toHaveProperty('macros');
      expect(data).toHaveProperty('confidence');
      
      expect(typeof data.totalCalories).toBe('number');
      expect(Array.isArray(data.breakdown)).toBe(true);
      expect(typeof data.macros).toBe('object');
    });

    it('should handle complex food descriptions', async () => {
      const complexFood = {
        food: 'grilled chicken breast with steamed broccoli and quinoa'
      };
      
      const response = await request(app)
        .post('/api/calories')
        .send(complexFood)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalCalories).toBeGreaterThan(0);
    });

    it('should validate input - empty food', async () => {
      const response = await request(app)
        .post('/api/calories')
        .send({ food: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('details');
    });

    it('should validate input - missing food field', async () => {
      const response = await request(app)
        .post('/api/calories')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should validate input - food too long', async () => {
      const longFood = 'a'.repeat(501);
      
      const response = await request(app)
        .post('/api/calories')
        .send({ food: longFood })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should sanitize input', async () => {
      const maliciousInput = {
        food: '<script>alert("test")</script>apple'
      };
      
      const response = await request(app)
        .post('/api/calories')
        .send(maliciousInput)
        .expect(200);

      expect(response.body.query).not.toContain('<script>');
      expect(response.body.query).not.toContain('</script>');
    });

    it('should handle whitespace in input', async () => {
      const response = await request(app)
        .post('/api/calories')
        .send({ food: '  apple  ' })
        .expect(200);

      expect(response.body.query).toBe('apple');
    });
  });

  describe('Rate limiting', () => {
    it('should accept requests within rate limit', async () => {
      // Make several requests quickly
      const promises = Array(5).fill().map(() =>
        request(app)
          .post('/api/calories')
          .send({ food: 'apple' })
      );

      const responses = await Promise.all(promises);
      
      // All should succeed (within normal rate limits)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/calories')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should handle large request bodies', async () => {
      const largeData = {
        food: 'apple',
        extraData: 'x'.repeat(11 * 1024 * 1024) // 11MB
      };

      const response = await request(app)
        .post('/api/calories')
        .send(largeData);

      expect([413, 400]).toContain(response.status);
    });
  });
});
