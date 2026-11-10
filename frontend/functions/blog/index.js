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
  if (!isCrawler(request.headers.get("user-agent"))) {
    return next();
  }

  const html = await loadIndexHtml(env, request);
  if (!html) {
    return next();
  }

  const { siteUrl, apiUrl } = siteConfig(env);
  const pageUrl = `${siteUrl}/blog`;
  const posts = await fetchPosts(apiUrl);
  const withHead = applyHead(html, {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: pageUrl,
    type: "website",
  });
  return htmlResponse(injectRoot(withHead, blogBody(siteUrl, posts)));
}

async function fetchPosts(apiUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
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
