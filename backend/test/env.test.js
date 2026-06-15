import { describe, expect, it } from 'vitest';
import { validateEnvironment } from '../src/config/env.js';

describe('environment validation', () => {
  it('rejects a missing JWT secret', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'test' })).toThrow(/JWT_SECRET/);
  });

  it('provides a development-only secret for local startup', () => {
    const environment = validateEnvironment({ NODE_ENV: 'development' });

    expect(environment.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
  });

  it('accepts a secure minimum configuration', () => {
    const environment = validateEnvironment({
      NODE_ENV: 'test',
      JWT_SECRET: 'a-secure-test-secret-with-32-characters',
    });

    expect(environment.PORT).toBe(3000);
    expect(environment.DB_NAME).toBe('arcanjo');
  });
});
