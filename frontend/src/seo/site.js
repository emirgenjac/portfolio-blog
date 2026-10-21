export const SITE_URL = (process.env.REACT_APP_SITE_URL || "https://portfolio-blog-b33.pages.dev").replace(/\/$/, "");
export const SITE_NAME = "Emir Genjac";
export const DEFAULT_TITLE = "Emir Genjac — Software Engineer";
export const DEFAULT_DESCRIPTION =
    "Software engineer building full-stack products with Spring Boot and React. HttpOnly JWT cookies, CSRF, and production-safe auth — plus projects and technical writing.";
export const OG_IMAGE_PATH = "/og-image.jpg";

export function absoluteUrl(path = "/") {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${SITE_URL}${normalized}`;
}

export function pageTitle(subtitle) {
    if (!subtitle) {
        return DEFAULT_TITLE;
    }
    return `${subtitle} · ${SITE_NAME}`;
}
