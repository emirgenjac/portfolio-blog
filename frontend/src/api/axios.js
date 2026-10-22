import axios from 'axios';

// CRA embeds REACT_APP_* at build time. Local default keeps npm start working with no .env.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const API = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // send/receive cookies (jwt + XSRF-TOKEN) cross-origin
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Separate instance so GET /auth/csrf is not nested inside API interceptors
// (that nesting was sending mutations first, getting 403, then retrying).
const csrfClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const SAFE_METHODS = new Set(['get', 'head', 'options', 'trace']);

function readCookie(name) {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

// Cookie read works on localhost (same host, different ports). Cross-site Pages → Render
// cannot read the API cookie from JS, so we load the raw token from GET /auth/csrf.
let csrfToken = null;
let csrfHeaderName = 'X-XSRF-TOKEN';
let csrfInflight = null;

function applyCsrfHeader(headers, token) {
    if (!token || !headers) {
        return;
    }
    const names = ['X-XSRF-TOKEN'];
    if (csrfHeaderName && csrfHeaderName !== 'X-XSRF-TOKEN') {
        names.push(csrfHeaderName);
    }
    names.forEach((name) => {
        if (typeof headers.set === 'function') {
            headers.set(name, token);
        } else {
            headers[name] = token;
        }
    });
}

function fetchCsrfFromApi() {
    if (!csrfInflight) {
        csrfInflight = csrfClient.get('/auth/csrf')
            .then(res => {
                csrfToken = res.data?.token || null;
                if (res.data?.headerName) {
                    csrfHeaderName = res.data.headerName;
                }
                return csrfToken;
            })
            .finally(() => {
                csrfInflight = null;
            });
    }
    return csrfInflight;
}

async function resolveCsrfToken({ force = false } = {}) {
    if (!force) {
        const fromCookie = readCookie('XSRF-TOKEN');
        if (fromCookie) {
            csrfToken = fromCookie;
            return fromCookie;
        }
        if (csrfToken) {
            return csrfToken;
        }
    }
    return fetchCsrfFromApi();
}

/** Warm the CSRF token so the first POST/PUT/DELETE is one round trip. */
export function prefetchCsrf() {
    return resolveCsrfToken();
}

API.interceptors.request.use(async config => {
    const method = (config.method || 'get').toLowerCase();
    if (SAFE_METHODS.has(method)) {
        return config;
    }
    const token = await resolveCsrfToken();
    applyCsrfHeader(config.headers, token);
    return config;
});

API.interceptors.response.use(
    response => response,
    async error => {
        const config = error.config;
        if (error.response?.status === 403 && config && !config._csrfRetry) {
            config._csrfRetry = true;
            csrfToken = null;
            const token = await resolveCsrfToken({ force: true });
            if (token) {
                config.headers = config.headers || {};
                applyCsrfHeader(config.headers, token);
                return API.request(config);
            }
        }
        return Promise.reject(error);
    }
);

const isDev = process.env.NODE_ENV !== 'production';

// Dev-only request/response logging (never in production builds)
if (isDev) {
    const SENSITIVE_KEYS = ['password', 'token', 'jwt', 'accessToken', 'refreshToken', 'authorization', 'auth', 'xsrf'];

    function redact(value) {
        if (value == null) return value;
        if (typeof FormData !== 'undefined' && value instanceof FormData) return '[FormData]';
        if (typeof value === 'string') return value;
        if (Array.isArray(value)) return value.map(redact);
        if (typeof value === 'object') {
            const out = {};
            for (const k of Object.keys(value)) {
                try {
                    if (SENSITIVE_KEYS.includes(k.toLowerCase())) {
                        out[k] = '[REDACTED]';
                    } else {
                        out[k] = redact(value[k]);
                    }
                } catch (e) {
                    out[k] = '[UNSERIALIZABLE]';
                }
            }
            return out;
        }
        return value;
    }

    API.interceptors.request.use(request => {
        try {
            const safeData = redact(request.data);
            console.log(
                '[api] Request:',
                request.method?.toUpperCase(),
                request.baseURL ? request.baseURL + request.url : request.url,
                safeData ?? ''
            );
        } catch (e) {
            // ignore logging errors
        }
        return request;
    });

    API.interceptors.response.use(
        response => {
            try {
                const safeData = redact(response.data);
                console.log(
                    '[api] Response:',
                    response.status,
                    response.config.method?.toUpperCase(),
                    response.config.url,
                    safeData ?? ''
                );
            } catch (e) {
                // ignore logging errors
            }
            return response;
        },
        error => {
            try {
                if (error.response) {
                    const safeData = redact(error.response.data);
                    console.error(
                        '[api] Response error:',
                        error.response.status,
                        error.config?.method?.toUpperCase(),
                        error.config?.url,
                        safeData
                    );
                } else if (error.request) {
                    console.error(
                        '[api] No response received for:',
                        error.config?.method?.toUpperCase(),
                        error.config?.url,
                        error.request
                    );
                } else {
                    console.error('[api] Request setup error:', error.message);
                }
            } catch (e) {
                // ignore logging errors
            }
            return Promise.reject(error);
        }
    );

    try {
        // eslint-disable-next-line no-undef
        window.__API = API;
    } catch (e) {
        // ignore (e.g. window not available in some test runners)
    }
}

export default API;
