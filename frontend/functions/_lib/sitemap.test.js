import assert from "node:assert/strict";
import test from "node:test";
import { buildSitemap, lastMod } from "./sitemap.js";

test("sitemap lists the site, the blog, and each post", () => {
  const xml = buildSitemap("https://emirgenjac.com", [
    { id: 2, title: "Cookies", updatedAt: "2026-11-01T10:15:00" },
    { id: 9, title: "Search", createdAt: [2026, 5, 3, 8, 0] },
  ]);

  assert.match(xml, /<loc>https:\/\/emirgenjac.com\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/emirgenjac.com\/blog<\/loc>/);
  assert.match(xml, /<loc>https:\/\/emirgenjac.com\/blog\/2<\/loc>/);
  assert.match(xml, /<loc>https:\/\/emirgenjac.com\/blog\/9<\/loc>/);
  assert.match(xml, /<lastmod>2026-11-01<\/lastmod>/);
  assert.match(xml, /<lastmod>2026-05-03<\/lastmod>/);
  assert.doesNotMatch(xml, /\/login/);
});

test("sitemap ignores bad ids and escapes the location", () => {
  const xml = buildSitemap("https://emirgenjac.com", [
    { id: 0, title: "nope" },
    { id: "abc", title: "nope" },
    { id: 4, title: "ok" },
  ]);

  assert.doesNotMatch(xml, /\/blog\/0/);
  assert.doesNotMatch(xml, /\/blog\/abc/);
  assert.match(xml, /<loc>https:\/\/emirgenjac.com\/blog\/4<\/loc>/);
});

test("lastmod accepts an ISO timestamp and a date array", () => {
  assert.equal(lastMod("2026-11-10T14:51:00"), "2026-11-10");
  assert.equal(lastMod([2026, 1, 2]), "2026-01-02");
  assert.equal(lastMod("not-a-date"), null);
});
