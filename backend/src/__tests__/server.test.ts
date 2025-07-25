import request from 'supertest';
import express from 'express';

// Mock the server for testing
const app = express();
app.use(express.json());

// Basic health check endpoint for testing
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

describe('Server Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toEqual({
      status: 'ok',
      message: 'Server is running'
    });
  });

  test('Should respond with JSON content type', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.headers['content-type']).toMatch(/json/);
  });
});
