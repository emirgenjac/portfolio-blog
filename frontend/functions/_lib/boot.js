import { escapeAttr } from "./html.js";

export function newestFirst(posts) {
  return [...(posts || [])].sort((a, b) => String(b?.createdAt || "").localeCompare(String(a?.createdAt || "")));
}

export function slimPost(post, { content = false } = {}) {
  const slim = {
    id: post?.id,
    title: post?.title || "",
    tagline: post?.tagline || "",
    coverImageUrl: post?.coverImageUrl || "",
    author: post?.author || "",
    createdAt: post?.createdAt || "",
  };
  if (content) {
    slim.content = post?.content || "";
  }
  return slim;
}

export function jsonScript(id, value) {
  const json = JSON.stringify(value).replace(/</g, "\\u003c");
  return `<script id="${id}" type="application/json">${json}</script>`;
}

export function withPreloadImage(html, url) {
  if (!/^https:\/\//i.test(String(url || ""))) {
    return html;
  }
  const tag = `<link rel="preload" as="image" href="${escapeAttr(url)}" fetchpriority="high">`;
  if (html.includes("rel=\"preload\" as=\"image\"")) {
    return html.replace("</head>", `    ${tag}\n  </head>`);
  }
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

export function withBootScript(html, id, value) {
  return html.replace("</body>", `    ${jsonScript(id, value)}\n  </body>`);
}
