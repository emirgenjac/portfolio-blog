import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export const THEME_STORAGE_KEY = "theme";

const ThemeContext = createContext(null);

function systemTheme() {
    if (typeof window === "undefined" || !window.matchMedia) {
        return "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function readStoredTheme() {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "light" || stored === "dark") {
            return stored;
        }
    } catch {
        // Ignore blocked storage.
    }

    const fromDom = document.documentElement.dataset.theme;
    if (fromDom === "light" || fromDom === "dark") {
        return fromDom;
    }
    return systemTheme();
}

let pendingFrames = [];

function clearThemeFrames() {
    pendingFrames.forEach((id) => window.cancelAnimationFrame(id));
    pendingFrames = [];
}

export function applyTheme(theme, { suppressTransitions = false } = {}) {
    const root = document.documentElement;
    if (suppressTransitions) {
        clearThemeFrames();
        root.classList.add("theme-changing");
    }
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
        themeColor.setAttribute("content", theme === "dark" ? "#12151c" : "#0f766e");
    }

    if (suppressTransitions) {
        const outer = window.requestAnimationFrame(() => {
            const inner = window.requestAnimationFrame(() => {
                root.classList.remove("theme-changing");
                pendingFrames = [];
            });
            pendingFrames.push(inner);
        });
        pendingFrames.push(outer);
    }
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(readStoredTheme);
    const suppressTransitionsRef = useRef(false);

    useLayoutEffect(() => {
        applyTheme(theme, { suppressTransitions: suppressTransitionsRef.current });
        suppressTransitionsRef.current = false;
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // Ignore blocked storage.
        }
    }, [theme]);

    useEffect(() => () => {
        clearThemeFrames();
        document.documentElement.classList.remove("theme-changing");
    }, []);

    const toggleTheme = useCallback(() => {
        suppressTransitionsRef.current = true;
        setTheme((current) => (current === "dark" ? "light" : "dark"));
    }, []);

    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return ctx;
}
