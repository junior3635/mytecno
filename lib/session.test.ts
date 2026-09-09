import { describe, it, expect, afterEach } from 'vitest';
import { getSessionSecret } from './session';

const ORIGINAL = process.env.SESSION_SECRET;

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.SESSION_SECRET;
  else process.env.SESSION_SECRET = ORIGINAL;
});

describe('getSessionSecret', () => {
  it('throws when SESSION_SECRET is missing', () => {
    delete process.env.SESSION_SECRET;
    expect(() => getSessionSecret()).toThrow(/SESSION_SECRET must be set/);
  });

  it('throws when SESSION_SECRET is too short', () => {
    process.env.SESSION_SECRET = 'short';
    expect(() => getSessionSecret()).toThrow(/at least 32 characters/);
  });

  it('returns a secret long enough', () => {
    process.env.SESSION_SECRET = 'x'.repeat(40);
    expect(getSessionSecret()).toBe('x'.repeat(40));
  });
});