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
  if (!/^\d+$/.test(id) || !isCrawler(request.headers.get("user-agent"))) {
    return next();
  }

  const html = await loadIndexHtml(env, request);
  if (!html) {
    return next();
  }

  const { siteUrl, apiUrl } = siteConfig(env);
  const pageUrl = `${siteUrl}/blog/${id}`;
  const post = await fetchPost(apiUrl, id);
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
  page = injectRoot(page, `<h1>${escapeAttr(heading)}</h1><p>${escapeAttr(description)}</p>`);

  return htmlResponse(page);
}

function absoluteImage(url, siteUrl) {
  if (!url) return FALLBACK_IMAGE.replace(SITE_URL, siteUrl);
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
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
