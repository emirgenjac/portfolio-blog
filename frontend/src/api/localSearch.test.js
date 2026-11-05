import { writeCachedPosts } from './blogCache';
import { searchLocal } from './localSearch';

beforeEach(() => {
  window.localStorage.clear();
});

test('rejects blank and overlong queries', () => {
  expect(searchLocal('')).toEqual({ hits: [], error: 'Query is required' });
  expect(searchLocal('   ')).toEqual({ hits: [], error: 'Query is required' });
  expect(searchLocal('a'.repeat(101)).error).toBe('Query is too long');
});

test('finds cached posts and static projects', () => {
  writeCachedPosts([{
    id: 9,
    title: 'Kako sam pravio ovaj sajt (i šta sam stvarno naučio)',
    tagline: 'Portfolio, blog i admin panel',
    content: 'Ovaj sajt is made with Spring Boot and React.',
  }]);

  const made = searchLocal('What was this made with?');
  expect(made.error).toBe('');
  expect(made.hits.some((hit) => hit.kind === 'about')).toBe(true);
  expect(made.hits.find((hit) => hit.kind === 'about').href).toBe('/blog/9');

  const hack = searchLocal('hack');
  expect(hack.hits[0].title).toBe('Heronn.ai');

  const jwt = searchLocal('jwt');
  expect(jwt.hits.some((hit) => hit.href === '/blog/9' || hit.kind === 'about')).toBe(true);
});

test('returns empty hits when nothing matches', () => {
  expect(searchLocal('zzzz-no-hit').hits).toEqual([]);
});

test('injection-style strings do not throw or invent hits', () => {
  writeCachedPosts([{
    id: 1,
    title: 'Safe post',
    tagline: 'plain text',
    content: 'nothing special here',
  }]);

  for (const payload of ["' OR 1=1 --", '%', '_', '&|!:()*']) {
    const result = searchLocal(payload);
    expect(result.error).toBe('');
    expect(result.hits).toEqual([]);
  }
});

test('snippet text keeps markup as plain text', () => {
  writeCachedPosts([{
    id: 2,
    title: 'XSS bait',
    tagline: 'safe tagline',
    content: 'jwt cookie <img alt="xss" src="x" />',
  }]);

  const result = searchLocal('jwt');
  expect(result.hits[0].snippet).toContain('<img alt="xss" src="x" />');
});
