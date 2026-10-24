export const SITE_URL = (process.env.REACT_APP_SITE_URL || "https://emirgenjac.com").replace(/\/$/, "");
export const SITE_NAME = "Emir Genjac";
export const DEFAULT_TITLE = "Emir Genjac · Software Developer";
export const DEFAULT_DESCRIPTION =
    "Full-stack developer. Spring Boot and React — Check out my blog.";
export const OG_IMAGE_PATH = "/og-card.jpg";
export const OG_IMAGE_WIDTH = "1200";
export const OG_IMAGE_HEIGHT = "630";

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
