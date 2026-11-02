import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { SEARCH_EXAMPLES, SEARCH_MAX_LENGTH } from "../api/search";
import "../styles/SearchPalette.css";

const KIND_LABEL = {
    post: "Post",
    project: "Project",
    site: "Site",
    about: "About",
};

function isExternalHref(href) {
    return /^https?:\/\//i.test(href || "");
}

function SearchPalette({ open, onOpen, onClose }) {
    const titleId = useId();
    const inputRef = useRef(null);
    const [query, setQuery] = useState("");
    const [hits, setHits] = useState([]);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");

    useEffect(() => {
        const onKeyDown = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                if (open) {
                    onClose();
                } else {
                    onOpen();
                }
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onOpen, onClose]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.cancelAnimationFrame(frame);
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [open, onClose]);

    useEffect(() => {
        if (open) {
            return undefined;
        }
        setQuery("");
        setHits([]);
        setError("");
        setStatus("idle");
        return undefined;
    }, [open]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const trimmed = query.trim();
        if (!trimmed) {
            setHits([]);
            setError("");
            setStatus("idle");
            return undefined;
        }
        if (trimmed.length > SEARCH_MAX_LENGTH) {
            setHits([]);
            setError("Query is too long");
            setStatus("error");
            return undefined;
        }

        setStatus("loading");
        let cancelled = false;
        const timer = window.setTimeout(() => {
            API.get("/search", { params: { q: trimmed } })
                .then((response) => {
                    if (cancelled) return;
                    setHits(Array.isArray(response.data) ? response.data : []);
                    setError("");
                    setStatus("ok");
                })
                .catch((err) => {
                    if (cancelled) return;
                    const message = err.response?.data?.message;
                    const code = err.response?.status;
                    if (code === 429) {
                        setError(message || "Too many search requests. Please try again later.");
                    } else if (code === 400) {
                        setError(message || "Query is required");
                    } else {
                        setError("Could not search. The server may be waking up.");
                    }
                    setHits([]);
                    setStatus("error");
                });
        }, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [query, open]);

    if (!open) {
        return null;
    }

    const trimmed = query.trim();
    const showEmpty = status === "ok" && trimmed && hits.length === 0;

    return (
        <div className="search-palette-overlay" role="presentation" onClick={onClose}>
            <div
                className="search-palette"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="search-palette__header">
                    <h2 id={titleId} className="search-palette__title">Search</h2>
                    <p className="search-palette__hint">Posts and projects on this site</p>
                </div>
                <label className="search-palette__field">
                    <span className="visually-hidden">Search posts and projects</span>
                    <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        maxLength={SEARCH_MAX_LENGTH}
                        placeholder="search"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </label>
                {!trimmed && (
                    <div className="search-palette__examples">
                        {SEARCH_EXAMPLES.map((example) => (
                            <button
                                key={example}
                                type="button"
                                className="search-palette__chip"
                                onClick={() => setQuery(example)}
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                )}
                {status === "loading" && <p className="search-palette__status">Searching…</p>}
                {error && <p className="search-palette__status search-palette__status--error">{error}</p>}
                {showEmpty && (
                    <p className="search-palette__status">
                        No matching work. Try JWT, CSRF, FAZUOI.
                    </p>
                )}
                {hits.length > 0 && (
                    <ul className="search-palette__hits">
                        {hits.map((hit) => (
                            <li key={`${hit.kind}-${hit.id}-${hit.href}`}>
                                <HitLink hit={hit} onNavigate={onClose} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function scrollToHash(href) {
    const hashIndex = (href || "").indexOf("#");
    if (hashIndex < 0) {
        return;
    }
    const id = href.slice(hashIndex + 1);
    if (!id) {
        return;
    }
    window.setTimeout(() => {
        const element = document.getElementById(id);
        if (!element) {
            return;
        }
        const top = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }, 50);
}

function HitLink({ hit, onNavigate }) {
    const kind = KIND_LABEL[hit.kind] || hit.kind;
    const href = hit.href || "/";
    const content = (
        <>
            <span className="search-palette__kind">{kind}</span>
            <span className="search-palette__hit-title">{hit.title}</span>
            {hit.snippet ? <span className="search-palette__snippet">{hit.snippet}</span> : null}
        </>
    );

    const handleNavigate = () => {
        onNavigate();
        scrollToHash(href);
    };

    if (isExternalHref(href)) {
        return (
            <a
                className="search-palette__hit"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleNavigate}
            >
                {content}
            </a>
        );
    }

    return (
        <Link className="search-palette__hit" to={href} onClick={handleNavigate}>
            {content}
        </Link>
    );
}

export default SearchPalette;
