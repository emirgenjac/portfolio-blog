import assert from "node:assert/strict";
import test from "node:test";
import { jsonScript, newestFirst, slimPost, withBootScript, withPreloadImage } from "./boot.js";

const SHELL = `<!DOCTYPE html><html><head><title>Home</title></head><body><div id="root"></div></body></html>`;

test("boot script escapes markup inside post text", () => {
  const html = withBootScript(SHELL, "boot-posts", [slimPost({
    id: 2,
    title: "Cookies <script>",
    coverImageUrl: "https://i.imgur.com/a.png",
    createdAt: "2026-11-01T00:00:00",
  })]);
  assert.match(html, /id="boot-posts"/);
  assert.match(html, /Cookies \\u003cscript>/);
  assert.doesNotMatch(html, /<script>/);
});

test("preload is added only for an https cover", () => {
  const html = withPreloadImage(SHELL, "https://i.imgur.com/QuyvZM6.png");
  assert.match(html, /rel="preload" as="image" href="https:\/\/i\.imgur\.com\/QuyvZM6\.png"/);
  assert.equal(withPreloadImage(SHELL, "/relative.png"), SHELL);
});

test("newest post is first", () => {
  const posts = newestFirst([
    { id: 1, createdAt: "2026-01-01T00:00:00" },
    { id: 2, createdAt: "2026-11-01T00:00:00" },
  ]);
  assert.equal(posts[0].id, 2);
});

test("json script is valid JSON after unescaping the markup guard", () => {
  const tag = jsonScript("boot-post", slimPost({ id: 3, title: "A < B", content: "x" }, { content: true }));
  const raw = tag.match(/>(\{.*\})<\//)[1].replace(/\\u003c/g, "<");
  assert.equal(JSON.parse(raw).title, "A < B");
  assert.equal(JSON.parse(raw).content, "x");
});
