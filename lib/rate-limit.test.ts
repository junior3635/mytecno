import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit } from './rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Reset module state between tests by importing fresh is tricky; instead use unique keys.
  });

  it('allows requests under the limit', () => {
    const key = `under-${Date.now()}`;
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
  });

  it('rejects once the limit is reached', () => {
    const key = `limit-${Date.now()}`;
    expect(checkRateLimit(key, 2, 60_000)).toBe(true);
    expect(checkRateLimit(key, 2, 60_000)).toBe(true);
    expect(checkRateLimit(key, 2, 60_000)).toBe(false);
  });

  it('treats different keys independently', () => {
    const a = `a-${Date.now()}`;
    const b = `b-${Date.now()}`;
    checkRateLimit(a, 1, 60_000);
    expect(checkRateLimit(a, 1, 60_000)).toBe(false);
    expect(checkRateLimit(b, 1, 60_000)).toBe(true);
  });
});