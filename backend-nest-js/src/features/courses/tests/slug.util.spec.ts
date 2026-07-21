import { slugify, withRandomSuffix } from '../utils/slug.util';

describe('slugify', () => {
  it('lowercases and dashes separators', () => {
    expect(slugify('Intro to Algebra')).toBe('intro-to-algebra');
  });

  it('strips diacritics', () => {
    expect(slugify('Lập trình Web')).toBe('lap-trinh-web');
  });

  it('strips non-alphanumeric characters', () => {
    expect(slugify('C++ & JavaScript!')).toBe('c-javascript');
  });

  it('trims leading/trailing dashes', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world');
  });
});

describe('withRandomSuffix', () => {
  it('appends a 6-hex-char suffix to the base slug', () => {
    const result = withRandomSuffix('intro-to-algebra');
    expect(result).toMatch(/^intro-to-algebra-[0-9a-f]{6}$/);
  });

  it('produces different suffixes across calls', () => {
    const first = withRandomSuffix('base');
    const second = withRandomSuffix('base');
    expect(first).not.toBe(second);
  });
});
