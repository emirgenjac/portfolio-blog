export const SITE_URL = "https://emirgenjac.com";
export const API_URL = "https://portfolio-blog-it8m.onrender.com";
export const SITE_NAME = "Emir Genjac";

const CRAWLER_UA =
  /linkedinbot|linkedin|twitterbot|facebookexternalhit|facebot|slackbot|discordbot|whatsapp|telegrambot|pinterest|googlebot|bingbot|duckduckbot|baiduspider|yandex|embedly|quora|vkshare|redditbot|applebot|rogerbot|preview/i;

export function isCrawler(userAgent) {
  return CRAWLER_UA.test(userAgent || "");
}

export function stripSlash(value) {
  return String(value || "").replace(/\/$/, "");
}

export function siteConfig(env = {}) {
  return {
    siteUrl: stripSlash(env.REACT_APP_SITE_URL || env.SITE_URL || SITE_URL),
    apiUrl: stripSlash(env.REACT_APP_API_URL || env.API_URL || API_URL),
  };
}

export function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function truncate(value, max) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function replaceTitle(html, title) {
  const tag = `<title>${escapeAttr(title)}</title>`;
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, tag);
  }
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

export function upsertCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeAttr(href)}" />`;
  if (/<link\s+[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i, tag);
  }
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

export function upsertMeta(html, attr, key, content) {
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  const re = new RegExp(`<meta\\s+[^>]*${attr}\\s*=\\s*["']${key}["'][^>]*>`, "i");
  if (re.test(html)) {
    return html.replace(re, tag);
  }
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

export function injectRoot(html, inner) {
  const block = `<div id="root">${inner}</div>`;
  if (/<div id="root">\s*<\/div>/.test(html)) {
    return html.replace(/<div id="root">\s*<\/div>/, block);
  }
  return html.replace(/<div id="root">/, `<div id="root">${inner}`);
}

export function applyHead(html, { title, description, url, type } = {}) {
  let next = html;
  if (title) {
    next = replaceTitle(next, title);
    next = upsertMeta(next, "property", "og:title", title);
    next = upsertMeta(next, "name", "twitter:title", title);
  }
  if (description) {
    next = upsertMeta(next, "name", "description", description);
    next = upsertMeta(next, "property", "og:description", description);
    next = upsertMeta(next, "name", "twitter:description", description);
  }
  if (url) {
    next = upsertCanonical(next, url);
    next = upsertMeta(next, "property", "og:url", url);
  }
  if (type) {
    next = upsertMeta(next, "property", "og:type", type);
  }
  return next;
}

export function homeBody() {
  return "<h1>Emir Genjac · Software Developer</h1><p>Full-stack developer. Spring Boot and React — Check out my blog.</p>";
}

export function blogBody(siteUrl, posts) {
  const items = [];
  for (const post of posts || []) {
    const id = postId(post?.id);
    if (!id) {
      continue;
    }
    const href = `${siteUrl}/blog/${id}`;
    const title = escapeAttr(post?.title || "Post");
    const tagline = post?.tagline ? ` — ${escapeAttr(post.tagline)}` : "";
    items.push(`<li><a href="${escapeAttr(href)}">${title}</a>${tagline}</li>`);
  }
  const list = items.length ? `<ul>${items.join("")}</ul>` : "";
  return `<h1>Blog Posts</h1><p>Technical posts by Emir Genjac on Spring Boot, React, and how this site is built.</p>${list}`;
}

export function htmlResponse(html) {
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}

export async function loadIndexHtml(env, request) {
  try {
    const asset = await env.ASSETS.fetch(new URL("/index.html", request.url));
    if (!asset.ok) {
      return null;
    }
    return await asset.text();
  } catch {
    return null;
  }
}

function postId(id) {
  const value = Number(id);
  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }
  return String(value);
}
