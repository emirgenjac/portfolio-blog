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

test('ranks an older title match ahead of newer body mentions', () => {
  const posts = [];
  for (let i = 0; i < 10; i += 1) {
    posts.push({
      id: 100 + i,
      title: `Notes ${i}`,
      tagline: 'misc',
      content: 'zephyr zephyr zephyr shows up in the body only',
      createdAt: `2026-06-01T00:${String(i).padStart(2, '0')}:00`,
    });
  }
  posts.push({
    id: 1,
    title: 'Zephyr field guide',
    tagline: 'Weather',
    content: 'Clouds and wind only.',
    createdAt: '2024-01-01T00:00:00',
  });
  writeCachedPosts(posts);

  const result = searchLocal('zephyr');
  expect(result.error).toBe('');
  expect(result.hits).toHaveLength(10);
  expect(result.hits[0].id).toBe(1);
  expect(result.hits[0].title).toBe('Zephyr field guide');
  expect(result.hits[1].id).toBe(109);
});

test('newer body match ranks first when field scores match', () => {
  writeCachedPosts([
    {
      id: 1,
      title: 'Older notes',
      tagline: 'plain',
      content: 'zephyr in the body',
      createdAt: '2024-01-01T00:00:00',
    },
    {
      id: 2,
      title: 'Newer notes',
      tagline: 'plain',
      content: 'zephyr in the body',
      createdAt: '2026-06-01T00:00:00',
    },
  ]);

  expect(searchLocal('zephyr').hits.map((hit) => hit.id)).toEqual([2, 1]);
});

test('missing createdAt sorts after a dated post with the same field score', () => {
  writeCachedPosts([
    {
      id: 1,
      title: 'Undated notes',
      tagline: 'plain',
      content: 'zephyr in the body',
    },
    {
      id: 2,
      title: 'Dated notes',
      tagline: 'plain',
      content: 'zephyr in the body',
      createdAt: '2020-01-01T00:00:00',
    },
  ]);

  expect(searchLocal('zephyr').hits.map((hit) => hit.id)).toEqual([2, 1]);
});

test('weakest term field score beats a newer partial title match', () => {
  writeCachedPosts([
    {
      id: 1,
      title: 'Field notes',
      tagline: 'zephyr lantern',
      content: 'No extra copy.',
      createdAt: '2020-01-01T00:00:00',
    },
    {
      id: 2,
      title: 'Zephyr notes',
      tagline: 'partial',
      content: 'Bring a lantern.',
      createdAt: '2026-06-01T00:00:00',
    },
  ]);

  expect(searchLocal('zephyr lantern').hits[0].id).toBe(1);
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
