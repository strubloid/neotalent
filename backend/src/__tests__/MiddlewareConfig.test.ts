import request from 'supertest';
import express from 'express';
import { MiddlewareConfig } from '../config/MiddlewareConfig';

describe('Middleware Configuration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    MiddlewareConfig.setupMiddleware(app, 'test');

    // Add a test route to check middleware functionality
    app.get('/test', (req, res) => {
      res.json({ success: true, message: 'Test endpoint' });
    });

    app.post('/test', (req, res) => {
      res.json({ success: true, body: req.body });
    });
  });

  describe('CORS Middleware', () => {
    it('should set CORS headers for cross-origin requests', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect([200, 204]).toContain(response.status);
    });
  });

  describe('JSON Body Parser', () => {
    it('should parse JSON request bodies', async () => {
      const testData = { name: 'test', value: 123 };

      const response = await request(app)
        .post('/test')
        .send(testData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.body).toEqual(testData);
    });

    it('should handle empty JSON objects', async () => {
      const response = await request(app)
        .post('/test')
        .send({})
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.body).toEqual({});
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/test')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });
  });

  describe('URL Encoded Parser', () => {
    it('should parse URL encoded request bodies', async () => {
      const response = await request(app)
        .post('/test')
        .send('name=test&value=123')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect(response.status).toBe(200);
      expect(response.body.body).toEqual({ name: 'test', value: '123' });
    });
  });

  describe('Request Size Limits', () => {
    it('should accept requests within size limits', async () => {
      const testData = { data: 'x'.repeat(1000) }; // 1KB of data

      const response = await request(app)
        .post('/test')
        .send(testData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
    });

    it('should reject overly large requests', async () => {
      const testData = { data: 'x'.repeat(20 * 1024 * 1024) }; // 20MB of data

      const response = await request(app)
        .post('/test')
        .send(testData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(413);
    });
  });

  describe('Security Headers', () => {
    it('should set security headers', async () => {
      const response = await request(app)
        .get('/test');

      // Check for common security headers (these depend on what's configured)
      expect(response.headers['x-powered-by']).toBeUndefined(); // Should be removed
    });
  });

  describe('Request Logging', () => {
    it('should process requests without errors', async () => {
      const response = await request(app)
        .get('/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle different HTTP methods', async () => {
      const getResponse = await request(app).get('/test');
      expect(getResponse.status).toBe(200);

      const postResponse = await request(app)
        .post('/test')
        .send({})
        .set('Content-Type', 'application/json');
      expect(postResponse.status).toBe(200);
    });
  });

  describe('Static File Serving', () => {
    it('should handle requests that might be for static files', async () => {
      // Test for common static file extensions
      const response = await request(app)
        .get('/nonexistent.css');

      // Should return 404 for non-existent static files
      expect(response.status).toBe(404);
    });
  });

  describe('Session Middleware', () => {
    it('should handle session-related requests', async () => {
      const response = await request(app)
        .get('/test')
        .set('Cookie', 'session=test');

      expect(response.status).toBe(200);
    });

    it('should work without session cookies', async () => {
      const response = await request(app)
        .get('/test');

      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // Add a route that throws an error
      app.get('/error', (req, res, next) => {
        const error = new Error('Test error');
        next(error);
      });
    });

    it('should handle errors thrown in routes', async () => {
      const response = await request(app)
        .get('/error');

      // Should handle the error gracefully
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Content Type Detection', () => {
    it('should handle requests with various content types', async () => {
      const jsonResponse = await request(app)
        .post('/test')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');
      
      expect(jsonResponse.status).toBe(200);

      const formResponse = await request(app)
        .post('/test')
        .send('test=data')
        .set('Content-Type', 'application/x-www-form-urlencoded');
      
      expect(formResponse.status).toBe(200);
    });

    it('should handle requests without explicit content type', async () => {
      const response = await request(app)
        .get('/test');

      expect(response.status).toBe(200);
    });
  });
});
