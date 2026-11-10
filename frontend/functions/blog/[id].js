import { slimPost, withBootScript, withPreloadImage } from "../_lib/boot.js";
import {
  SITE_NAME,
  SITE_URL,
  applyHead,
  escapeAttr,
  htmlResponse,
  injectRoot,
  isCrawler,
  loadIndexHtml,
  siteConfig,
  truncate,
  upsertMeta,
} from "../_lib/html.js";

const FALLBACK_IMAGE = `${SITE_URL}/og-card.jpg`;

export async function onRequestGet(context) {
  const { request, env, params, next } = context;
  const id = String(params.id || "");
  if (!/^\d+$/.test(id)) {
    return next();
  }

  const html = await loadIndexHtml(env, request);
  if (!html) {
    return next();
  }

  const { siteUrl, apiUrl } = siteConfig(env);
  const pageUrl = `${siteUrl}/blog/${id}`;
  const crawler = isCrawler(request.headers.get("user-agent"));
  const post = await loadPost(apiUrl, id, crawler ? 12000 : 600, context.waitUntil);
  const title = post?.title ? `${post.title} · ${SITE_NAME}` : `${SITE_NAME} - Blog`;
  const description =
    (post?.tagline && String(post.tagline).trim()) ||
    (post?.content && String(post.content).trim().slice(0, 180)) ||
    "Technical writing from Emir Genjac.";
  const image = absoluteImage(post?.coverImageUrl, siteUrl);
  const heading = truncate(post?.title || "Blog", 150);

  let page = applyHead(html, {
    title,
    description,
    url: pageUrl,
    type: "article",
  });
  page = upsertMeta(page, "property", "og:image", image);
  if (String(image).includes("/og-card.jpg")) {
    page = upsertMeta(page, "property", "og:image:width", "1200");
    page = upsertMeta(page, "property", "og:image:height", "630");
  }
  page = upsertMeta(page, "property", "og:image:alt", post?.title || SITE_NAME);
  page = upsertMeta(page, "name", "twitter:card", "summary_large_image");
  page = upsertMeta(page, "name", "twitter:image", image);
  page = withPreloadImage(page, /^https:\/\//i.test(post?.coverImageUrl || "") ? post.coverImageUrl : "");
  page = injectRoot(page, `<h1>${escapeAttr(heading)}</h1><p>${escapeAttr(description)}</p>`);
  if (post?.id != null) {
    page = withBootScript(page, "boot-post", slimPost(post, { content: true }));
  }

  return htmlResponse(page);
}

function absoluteImage(url, siteUrl) {
  if (!url) return FALLBACK_IMAGE.replace(SITE_URL, siteUrl);
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

const FRESH_MS = 120000;

async function loadPost(apiUrl, id, timeoutMs, waitUntil) {
  const url = `${apiUrl}/blog/${id}`;
  const cached = await readCache(url);
  if (cached?.post?.id != null) {
    if (Date.now() - cached.savedAt > FRESH_MS && waitUntil) {
      waitUntil(refreshPost(url, apiUrl, id, timeoutMs));
    }
    return cached.post;
  }
  const fresh = await fetchPost(apiUrl, id, timeoutMs);
  if (fresh?.id != null && waitUntil) {
    waitUntil(writeCache(url, { savedAt: Date.now(), post: fresh }));
  }
  return fresh;
}

async function refreshPost(url, apiUrl, id, timeoutMs) {
  const fresh = await fetchPost(apiUrl, id, timeoutMs);
  if (fresh?.id != null) {
    await writeCache(url, { savedAt: Date.now(), post: fresh });
  }
}

async function readCache(url) {
  try {
    const hit = await caches.default.match(new Request(url));
    if (!hit) {
      return null;
    }
    return await hit.json();
  } catch {
    return null;
  }
}

async function writeCache(url, data) {
  try {
    await caches.default.put(new Request(url), new Response(JSON.stringify(data), {
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=86400",
      },
    }));
  } catch {
    // A cache miss still returns the live response.
  }
}

async function fetchPost(apiUrl, id, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
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
