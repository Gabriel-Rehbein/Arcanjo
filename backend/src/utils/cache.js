const cache = new Map();
const DEFAULT_TTL_MS = Number(process.env.CACHE_TTL_MS || 30_000);

export function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }

  return entry.value;
}

export function setCache(key, value, ttlMs = DEFAULT_TTL_MS) {
  if (value === null || value === undefined) {
    cache.delete(key);
    return;
  }

  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function deleteCacheByPrefix(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

export function clearCache() {
  cache.clear();
}
