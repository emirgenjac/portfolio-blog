/**
 * Cloudflare Pages Function: give LinkedIn/Slack/etc. real Open Graph tags
 * for /blog/:id. The SPA only sets those tags in JavaScript, which crawlers
 * never run, so share previews were the homepage card (or nothing).
 *
 * Humans still get the normal CRA index.html via context.next().
 */

const SITE_URL = "https://emirgenjac.com";
const API_URL = "https://portfolio-blog-it8m.onrender.com";
const FALLBACK_IMAGE = `${SITE_URL}/og-card.jpg`;
const SITE_NAME = "Emir Genjac";

const CRAWLER_UA =
  /linkedinbot|linkedin|twitterbot|facebookexternalhit|facebot|slackbot|discordbot|whatsapp|telegrambot|pinterest|googlebot|bingbot|duckduckbot|baiduspider|yandex|embedly|quora|vkshare|redditbot|applebot|rogerbot|preview/i;

export async function onRequestGet(context) {
  const { request, env, params, next } = context;
  const id = String(params.id || "");
  const ua = request.headers.get("user-agent") || "";

  if (!/^\d+$/.test(id) || !CRAWLER_UA.test(ua)) {
    return next();
  }

  const siteUrl = stripSlash(env.REACT_APP_SITE_URL || env.SITE_URL || SITE_URL);
  const apiUrl = stripSlash(env.REACT_APP_API_URL || env.API_URL || API_URL);
  const pageUrl = `${siteUrl}/blog/${id}`;

  let html;
  try {
    const asset = await env.ASSETS.fetch(new URL("/index.html", request.url));
    html = await asset.text();
  } catch {
    return next();
  }

  const post = await fetchPost(apiUrl, id);
  const title = post?.title ? `${post.title} · ${SITE_NAME}` : `${SITE_NAME} - Blog`;
  const description =
    (post?.tagline && String(post.tagline).trim()) ||
    (post?.content && String(post.content).trim().slice(0, 180)) ||
    "Technical writing from Emir Genjac.";
  const image = absoluteImage(post?.coverImageUrl, siteUrl);

  html = replaceTitle(html, title);
  html = upsertMeta(html, "property", "og:type", "article");
  html = upsertMeta(html, "property", "og:title", title);
  html = upsertMeta(html, "property", "og:description", description);
  html = upsertMeta(html, "property", "og:url", pageUrl);
  html = upsertMeta(html, "property", "og:image", image);
  if (String(image).includes("/og-card.jpg")) {
    html = upsertMeta(html, "property", "og:image:width", "1200");
    html = upsertMeta(html, "property", "og:image:height", "630");
  }
  html = upsertMeta(html, "property", "og:image:alt", post?.title || SITE_NAME);
  html = upsertMeta(html, "name", "description", description);
  html = upsertMeta(html, "name", "twitter:card", "summary_large_image");
  html = upsertMeta(html, "name", "twitter:title", title);
  html = upsertMeta(html, "name", "twitter:description", description);
  html = upsertMeta(html, "name", "twitter:image", image);
  html = upsertCanonical(html, pageUrl);

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}

function stripSlash(value) {
  return String(value || "").replace(/\/$/, "");
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function absoluteImage(url, siteUrl) {
  if (!url) return FALLBACK_IMAGE.replace(SITE_URL, siteUrl);
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function replaceTitle(html, title) {
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttr(title)}</title>`);
  }
  return html.replace(/<\/head>/i, `    <title>${escapeAttr(title)}</title>\n  </head>`);
}

function upsertCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeAttr(href)}" />`;
  if (/<link\s+[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i, tag);
  }
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function upsertMeta(html, attr, key, content) {
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  const re = new RegExp(`<meta\\s+[^>]*${attr}\\s*=\\s*["']${key}["'][^>]*>`, "i");
  if (re.test(html)) {
    return html.replace(re, tag);
  }
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

async function fetchPost(apiUrl, id) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${apiUrl}/blog/${id}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
