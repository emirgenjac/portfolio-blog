import assert from "node:assert/strict";
import test from "node:test";
import { applyHead, blogBody, homeBody, injectRoot, isCrawler } from "./html.js";

const SHELL = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Emir Genjac · Software Developer</title>
    <meta name="description" content="Full-stack developer. Spring Boot and React — Check out my blog." />
    <link rel="canonical" href="https://emirgenjac.com/" />
    <meta property="og:url" content="https://emirgenjac.com/" />
    <meta property="og:title" content="Emir Genjac · Software Developer" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

test("bingbot homepage source contains one h1", () => {
  assert.equal(isCrawler("Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"), true);
  const html = injectRoot(SHELL, homeBody());
  assert.match(html, /<h1>Emir Genjac · Software Developer<\/h1>/);
  assert.equal(html.match(/<h1/g).length, 1);
  assert.doesNotMatch(html, /<div id="root"><\/div>/);
});

test("blog source uses its own canonical and escapes post text", () => {
  const html = injectRoot(
    applyHead(SHELL, {
      title: "Blog · Emir Genjac",
      description: "Technical posts by Emir Genjac.",
      url: "https://emirgenjac.com/blog",
    }),
    blogBody("https://emirgenjac.com", [
      { id: 3, title: "Cookies & <script>", tagline: 'Say "hello"' },
      { id: "nope", title: "Skip" },
    ]),
  );

  assert.match(html, /<link rel="canonical" href="https:\/\/emirgenjac.com\/blog" \/>/);
  assert.doesNotMatch(html, /canonical" href="https:\/\/emirgenjac.com\/"/);
  assert.match(html, /<h1>Blog Posts<\/h1>/);
  assert.match(html, /href="https:\/\/emirgenjac.com\/blog\/3"/);
  assert.match(html, /Cookies &amp; &lt;script&gt;/);
  assert.match(html, /Say &quot;hello&quot;/);
  assert.doesNotMatch(html, /Skip/);
});

test("a normal browser is not treated as a crawler", () => {
  assert.equal(isCrawler("Mozilla/5.0 Chrome/120.0.0.0"), false);
});
