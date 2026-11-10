import { newestFirst, slimPost, withBootScript, withPreloadImage } from "../_lib/boot.js";
import {
  SITE_NAME,
  applyHead,
  blogBody,
  htmlResponse,
  injectRoot,
  isCrawler,
  loadIndexHtml,
  siteConfig,
} from "../_lib/html.js";

const BLOG_TITLE = `Blog · ${SITE_NAME}`;
const BLOG_DESCRIPTION = "Technical posts by Emir Genjac on Spring Boot, React, and how this site is built.";

export async function onRequestGet(context) {
  const { request, env, next } = context;
  const html = await loadIndexHtml(env, request);
  if (!html) {
    return next();
  }

  const { siteUrl, apiUrl } = siteConfig(env);
  const pageUrl = `${siteUrl}/blog`;
  const crawler = isCrawler(request.headers.get("user-agent"));
  const posts = newestFirst(await loadPosts(apiUrl, crawler ? 12000 : 600, context.waitUntil));
  const withHead = applyHead(html, {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: pageUrl,
    type: "website",
  });
  const cover = posts.find((post) => /^https:\/\//i.test(post?.coverImageUrl || ""))?.coverImageUrl;
  let page = withPreloadImage(withHead, cover);
  page = injectRoot(page, blogBody(siteUrl, posts));
  if (posts.length) {
    page = withBootScript(page, "boot-posts", posts.map((post) => slimPost(post)));
  }
  return htmlResponse(page);
}

const FRESH_MS = 120000;

async function loadPosts(apiUrl, timeoutMs, waitUntil) {
  const url = `${apiUrl}/blog`;
  const cached = await readCache(url);
  if (Array.isArray(cached?.posts) && cached.posts.length) {
    if (Date.now() - cached.savedAt > FRESH_MS && waitUntil) {
      waitUntil(refreshPosts(url, apiUrl, timeoutMs));
    }
    return cached.posts;
  }
  const fresh = await fetchPosts(apiUrl, timeoutMs);
  if (fresh.length && waitUntil) {
    waitUntil(writeCache(url, { savedAt: Date.now(), posts: fresh }));
  }
  return fresh;
}

async function refreshPosts(url, apiUrl, timeoutMs) {
  const fresh = await fetchPosts(apiUrl, timeoutMs);
  if (fresh.length) {
    await writeCache(url, { savedAt: Date.now(), posts: fresh });
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

async function fetchPosts(apiUrl, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${apiUrl}/blog`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
