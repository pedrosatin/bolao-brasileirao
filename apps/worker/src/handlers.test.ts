import { describe, it, expect } from 'vitest';
import { timingSafeEqual } from './handlers';

describe('timingSafeEqual', () => {
  it('returns true for identical strings', () => {
    expect(timingSafeEqual('hello', 'hello')).toBe(true);
    expect(timingSafeEqual('', '')).toBe(true);
    expect(timingSafeEqual('a', 'a')).toBe(true);
    expect(timingSafeEqual('1234567890', '1234567890')).toBe(true);
  });

  it('returns false for different strings of the same length', () => {
    expect(timingSafeEqual('hello', 'world')).toBe(false);
    expect(timingSafeEqual('a', 'b')).toBe(false);
    expect(timingSafeEqual('1234567890', '0987654321')).toBe(false);
    // test slightly different
    expect(timingSafeEqual('hello', 'he1lo')).toBe(false);
  });

  it('returns false for strings of different lengths', () => {
    expect(timingSafeEqual('hello', 'hello ')).toBe(false);
    expect(timingSafeEqual('hello', 'hell')).toBe(false);
    expect(timingSafeEqual('', 'a')).toBe(false);
    expect(timingSafeEqual('a', '')).toBe(false);
    expect(timingSafeEqual('longstring', 'short')).toBe(false);
  });
});
