import { escapeAttr } from "./html.js";

export function buildSitemap(siteUrl, posts) {
  const origin = String(siteUrl || "").replace(/\/$/, "");
  const urls = [
    entry(`${origin}/`, { changefreq: "weekly", priority: "1.0" }),
    entry(`${origin}/blog`, { changefreq: "weekly", priority: "0.8" }),
  ];
  const seen = new Set(urls.map((url) => url.loc));

  for (const post of posts || []) {
    const id = postId(post?.id);
    if (!id) {
      continue;
    }
    const loc = `${origin}/blog/${id}`;
    if (seen.has(loc)) {
      continue;
    }
    seen.add(loc);
    urls.push(entry(loc, {
      lastmod: lastMod(post?.updatedAt || post?.createdAt),
      changefreq: "monthly",
      priority: "0.6",
    }));
  }

  const body = urls.map(renderUrl).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function entry(loc, fields) {
  return { loc, ...fields };
}

function renderUrl(url) {
  const lines = [`    <loc>${escapeAttr(url.loc)}</loc>`];
  if (url.lastmod) {
    lines.push(`    <lastmod>${url.lastmod}</lastmod>`);
  }
  lines.push(`    <changefreq>${url.changefreq}</changefreq>`);
  lines.push(`    <priority>${url.priority}</priority>`);
  return `  <url>\n${lines.join("\n")}\n  </url>`;
}

export function lastMod(value) {
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value;
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      return null;
    }
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  const match = String(value || "").match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function postId(id) {
  const value = Number(id);
  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }
  return String(value);
}
