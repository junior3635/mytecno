import { describe, it, expect } from 'vitest';
import { classifyError, parseModelSpec } from './ai';

describe('classifyError', () => {
  it('detects invalid API keys', () => {
    const err = classifyError(new Error('API key not valid. Please pass a valid API key.'));
    expect(err.message).toContain('Invalid Gemini API key');
  });

  it('detects rate limits', () => {
    const err = classifyError(new Error('RESOURCE_EXHAUSTED: quota exceeded'));
    expect(err.message).toContain('rate limit');
  });

  it('detects network errors', () => {
    const err = classifyError(new Error('fetch failed: ECONNREFUSED'));
    expect(err.message).toContain('Network error');
  });

  it('passes through unknown errors', () => {
    const err = classifyError(new Error('Something odd happened'));
    expect(err.message).toBe('Gemini API error: Something odd happened');
  });

  it('handles non-Error values', () => {
    const err = classifyError('string error');
    expect(err.message).toBe('Gemini API error: Unknown error');
  });

  it('names the provider for non-Gemini providers', () => {
    const err = classifyError(new Error('401 invalid_api_key'), 'anthropic');
    expect(err.message).toContain('Invalid Anthropic Claude API key');
  });
});

describe('parseModelSpec', () => {
  it('keeps a bare model id as-is', () => {
    expect(parseModelSpec('gemini-3.6-flash')).toEqual({ model: 'gemini-3.6-flash' });
  });

  it('splits a provider-prefixed spec', () => {
    expect(parseModelSpec('anthropic:claude-sonnet-4-5')).toEqual({
      providerId: 'anthropic',
      model: 'claude-sonnet-4-5',
    });
  });

  it('ignores unknown prefixes', () => {
    expect(parseModelSpec('unknown:thing')).toEqual({ model: 'unknown:thing' });
  });

  it('returns an empty model for empty input', () => {
    expect(parseModelSpec('')).toEqual({ model: '' });
    expect(parseModelSpec(null)).toEqual({ model: '' });
  });

  it('handles an empty model after a known prefix', () => {
    expect(parseModelSpec('openai:')).toEqual({ providerId: 'openai', model: '' });
  });
});