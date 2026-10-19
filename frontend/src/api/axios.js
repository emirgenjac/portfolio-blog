import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
});

const isDev = process.env.NODE_ENV !== 'production';

// Dev-only request/response logging (never in production builds)
if (isDev) {
    const SENSITIVE_KEYS = ['password', 'token', 'jwt', 'accessToken', 'refreshToken', 'authorization', 'auth'];

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
