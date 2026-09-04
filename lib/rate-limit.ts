const buckets = new Map<string, number[]>();

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const hits = (buckets.get(key) || []).filter((t) => t > windowStart);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }

  hits.push(now);
  buckets.set(key, hits);
  return true;
}

// Avoid unbounded memory growth by pruning stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, hits] of buckets) {
    const fresh = hits.filter((t) => t > now - CLEANUP_INTERVAL_MS);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}, CLEANUP_INTERVAL_MS);