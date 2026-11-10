import { applyHead, homeBody, htmlResponse, injectRoot, isCrawler, loadIndexHtml } from "./_lib/html.js";

export async function onRequestGet(context) {
  const { request, env, next } = context;
  if (!isCrawler(request.headers.get("user-agent"))) {
    return next();
  }

  const html = await loadIndexHtml(env, request);
  if (!html) {
    return next();
  }

  const body = injectRoot(html, homeBody());
  return htmlResponse(applyHead(body, { type: "website" }));
}
