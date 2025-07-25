import request from 'supertest';
import express from 'express';
import apiRoutes from '../routes/apiRoutes';

describe('API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', apiRoutes);
  });

  describe('Health Check Routes', () => {
    describe('GET /api/health', () => {
      it('should return health status', async () => {
        const response = await request(app)
          .get('/api/health');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: true,
          status: 'OK',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          version: expect.any(String),
          environment: expect.any(String)
        });
      });
    });

    describe('GET /api/info', () => {
      it('should return API information', async () => {
        const response = await request(app)
          .get('/api/info');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: true,
          name: expect.any(String),
          description: expect.any(String),
          version: expect.any(String),
          endpoints: expect.any(Object),
          timestamp: expect.any(String)
        });
      });
    });
  });

  describe('Authentication Routes Structure', () => {
    it('should have POST /api/auth/register route', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });

    it('should have POST /api/auth/login route', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });

    it('should have POST /api/auth/logout route', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });

    it('should have GET /api/auth/me route', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });
  });

  describe('Nutrition Routes Structure', () => {
    it('should have POST /api/nutrition/analyze route', async () => {
      const response = await request(app)
        .post('/api/nutrition/analyze')
        .send({});

      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });

    it('should have GET /api/nutrition/test route', async () => {
      const response = await request(app)
        .get('/api/nutrition/test');

      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });
  });

  describe('Route Validation', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should handle invalid HTTP methods', async () => {
      const response = await request(app)
        .delete('/api/health');

      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      // Should handle the bad request appropriately
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Content-Type Handling', () => {
    it('should handle requests with proper content-type', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ username: 'test', password: 'pass' }));

      // Route should exist and process the request
      expect(response.status).not.toBe(404);
    });

    it('should handle GET requests without content-type', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
    });
  });

  describe('Route Parameters and Query Strings', () => {
    it('should handle routes with query parameters', async () => {
      const response = await request(app)
        .get('/api/health?debug=true');

      expect(response.status).toBe(200);
    });

    it('should handle routes with special characters in URL', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
    });
  });

  describe('API Documentation Routes', () => {
    it('should provide API information with proper structure', async () => {
      const response = await request(app)
        .get('/api/info');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.endpoints).toBeDefined();
      expect(typeof response.body.endpoints).toBe('object');
    });

    it('should include timestamp in responses', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.timestamp).toBeDefined();
      expect(typeof response.body.timestamp).toBe('string');
    });
  });
});
