import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCache, deleteCacheByPrefix, getCache, setCache } from '../src/utils/cache.js';

describe('TTL cache', () => {
  beforeEach(() => {
    clearCache();
    vi.useRealTimers();
  });

  it('returns values before expiration and removes them after TTL', () => {
    vi.useFakeTimers();
    setCache('projects', [{ id: 1 }], 1000);

    expect(getCache('projects')).toEqual([{ id: 1 }]);
    vi.advanceTimersByTime(1001);
    expect(getCache('projects')).toBeUndefined();
  });

  it('invalidates all user feed keys by prefix', () => {
    setCache('feed:1', ['one']);
    setCache('feed:2', ['two']);
    setCache('projects', ['project']);

    deleteCacheByPrefix('feed:');

    expect(getCache('feed:1')).toBeUndefined();
    expect(getCache('feed:2')).toBeUndefined();
    expect(getCache('projects')).toEqual(['project']);
  });
});
