const LIST_KEY = "pb.blog.list";
const POST_KEY = "pb.blog.post.";

function postKey(id) {
    return POST_KEY + String(id);
}

function read(key) {
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        return parsed?.data ?? null;
    } catch {
        return null;
    }
}

function write(key, data) {
    try {
        window.localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
    } catch {
        // Quota / private mode — skip cache.
    }
}

export function readCachedPosts() {
    const data = read(LIST_KEY);
    return Array.isArray(data) ? data : null;
}

export function writeCachedPosts(posts) {
    if (!Array.isArray(posts)) {
        return;
    }
    write(LIST_KEY, posts);
    posts.forEach((post) => {
        if (post?.id != null) {
            write(postKey(post.id), post);
        }
    });
}

export function readCachedPost(id) {
    if (id == null || id === "") {
        return null;
    }
    return read(postKey(id));
}

export function writeCachedPost(post) {
    if (post?.id == null) {
        return;
    }
    write(postKey(post.id), post);
    const list = readCachedPosts();
    if (!list) {
        return;
    }
    const index = list.findIndex((item) => String(item.id) === String(post.id));
    if (index >= 0) {
        list[index] = { ...list[index], ...post };
    } else {
        list.unshift(post);
    }
    write(LIST_KEY, list);
}

export function removeCachedPost(id) {
    try {
        window.localStorage.removeItem(postKey(id));
    } catch {
        // ignore
    }
    const list = readCachedPosts();
    if (!list) {
        return;
    }
    write(LIST_KEY, list.filter((item) => String(item.id) !== String(id)));
}
