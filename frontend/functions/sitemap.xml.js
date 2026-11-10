import { siteConfig } from "./_lib/html.js";
import { buildSitemap } from "./_lib/sitemap.js";

export async function onRequestGet(context) {
  const { siteUrl, apiUrl } = siteConfig(context.env);
  const posts = await fetchPosts(apiUrl);
  return new Response(buildSitemap(siteUrl, posts), {
    status: 200,
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
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
