import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';
  process.env.FRONTEND_URL = 'http://localhost:3001';
  app = (await import('../src/app.js')).default;
});

describe('API security baseline', () => {
  it('describes the API at the root route', async () => {
    const response = await request(app).get('/').expect(200);

    expect(response.body).toMatchObject({ service: 'arcanjo-api', status: 'online' });
  });

  it('handles automatic browser favicon requests', async () => {
    await request(app).get('/favicon.ico').expect(204);
  });

  it('exposes a health endpoint with request correlation', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('sets security headers and removes framework disclosure', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('rejects origins outside the CORS allowlist', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'https://malicious.example')
      .expect(403);

    expect(response.body.error.code).toBe('CORS_ORIGIN_DENIED');
  });

  it('validates registration payloads before database access', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ username: 'a', password: '123' })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.length).toBeGreaterThan(0);
  });

  it('requires authentication for notifications', async () => {
    await request(app).get('/notifications').expect(401);
  });

  it('returns a standardized 404 envelope', async () => {
    const response = await request(app).get('/route-that-does-not-exist').expect(404);
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
