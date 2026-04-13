/**
 * Simple module-level cache for client-side fetch calls.
 * Lives in module scope → survives React re-renders and tab switches
 * within the same browser session, preventing redundant API calls.
 */

const store = new Map();

/**
 * Get a cached value. Returns null if not cached or expired.
 * @param {string} key
 */
export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Store a value in the cache.
 * @param {string} key
 * @param {*} value
 * @param {number} ttlMs  Time-to-live in ms (default 2 minutes)
 */
export function cacheSet(key, value, ttlMs = 120_000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Invalidate a specific key (e.g. after a mutation).
 */
export function cacheDelete(key) {
  store.delete(key);
}

/**
 * Convenience: fetch + cache with automatic deduplication.
 * If a previous identical request is still in-flight, waits for it.
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {number} [ttlMs]
 */
const inflight = new Map();

export async function cachedFetch(url, options, ttlMs = 120_000) {
  const cached = cacheGet(url);
  if (cached !== null) return cached;

  // Deduplicate concurrent calls for the same URL
  if (inflight.has(url)) return inflight.get(url);

  const promise = fetch(url, options)
    .then((r) => r.json())
    .then((data) => {
      cacheSet(url, data, ttlMs);
      inflight.delete(url);
      return data;
    })
    .catch((err) => {
      inflight.delete(url);
      throw err;
    });

  inflight.set(url, promise);
  return promise;
}
