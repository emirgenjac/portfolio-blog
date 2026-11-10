export function readBootJson(id) {
    if (typeof document === "undefined") {
        return null;
    }
    const node = document.getElementById(id);
    if (!node?.textContent) {
        return null;
    }
    try {
        return JSON.parse(node.textContent);
    } catch {
        return null;
    }
}
