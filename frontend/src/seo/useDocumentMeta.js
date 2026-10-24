import { useEffect } from "react";
import { absoluteUrl, OG_IMAGE_HEIGHT, OG_IMAGE_PATH, OG_IMAGE_WIDTH } from "./site";

function upsertMeta(attr, key, content) {
    if (!content) {
        return;
    }
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

function upsertLink(rel, href) {
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
    }
    el.setAttribute("href", href);
}

export function useDocumentMeta({
    title,
    description,
    path,
    image,
    type = "website",
    robots = "index, follow",
}) {
    useEffect(() => {
        const url = absoluteUrl(path || "/");
        const usingDefaultImage = !image;
        const img = usingDefaultImage ? absoluteUrl(OG_IMAGE_PATH) : absoluteUrl(image);

        document.title = title;
        upsertMeta("name", "description", description);
        upsertMeta("name", "robots", robots);
        upsertMeta("property", "og:title", title);
        upsertMeta("property", "og:description", description);
        upsertMeta("property", "og:url", url);
        upsertMeta("property", "og:type", type);
        upsertMeta("property", "og:image", img);
        if (usingDefaultImage) {
            upsertMeta("property", "og:image:width", OG_IMAGE_WIDTH);
            upsertMeta("property", "og:image:height", OG_IMAGE_HEIGHT);
        }
        upsertMeta("name", "twitter:title", title);
        upsertMeta("name", "twitter:description", description);
        upsertMeta("name", "twitter:image", img);
        upsertLink("canonical", url);
    }, [title, description, path, image, type, robots]);
}
