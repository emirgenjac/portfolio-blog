import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';
import {AuthContext} from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useTheme } from "../context/ThemeContext";

const MENU_BREAKPOINT = 720;

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout, loading } = useContext(AuthContext);
    const { showConfirm } = useModal();
    const { theme, toggleTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = useCallback(() => setMenuOpen(false), []);

    useEffect(() => {
        closeMenu();
    }, [location.pathname, closeMenu]);

    useEffect(() => {
        if (!menuOpen) return undefined;

        const onKeyDown = (event) => {
            if (event.key === "Escape") closeMenu();
        };
        const onResize = () => {
            if (window.innerWidth > MENU_BREAKPOINT) closeMenu();
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("resize", onResize);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("resize", onResize);
        };
    }, [menuOpen, closeMenu]);

    const scrollToSection = (sectionId) => {
        const run = () => {
            const element = document.getElementById(sectionId);
            if (!element) return;
            const top = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        };

        if (location.pathname !== "/") {
            navigate("/", { state: { scrollTo: sectionId } });
            setTimeout(run, 150);
        } else {
            run();
        }
    };

    const handleSectionClick = (sectionId) => (e) => {
        e.preventDefault();
        closeMenu();
        scrollToSection(sectionId);
    };

    const handleLogout = async () => {
        closeMenu();
        const confirmed = await showConfirm({
            title: "Log out?",
            message: "Are you sure you want to log out?",
            confirmLabel: "Log out",
            cancelLabel: "Cancel",
            variant: "confirm",
        });
        if (confirmed) logout();
    };

    const isBlogPage = location.pathname.startsWith("/blog");

    return (
        <nav className={`navbar${menuOpen ? " navbar--open" : ""}`}>
            {menuOpen && (
                <button
                    type="button"
                    className="navbar-overlay"
                    aria-label="Dismiss menu"
                    onClick={closeMenu}
                />
            )}
            <div className="navbar-container">
                <h1 className="navbar-logo">
                    <Link to="/" className="logo-link" onClick={closeMenu}>
                        <p className="logo-letters">emirgenjac</p>
                    </Link>
                </h1>

                <button
                    type="button"
                    className={`navbar-toggle${menuOpen ? " is-open" : ""}`}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    aria-controls="navbar-menu"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                </button>

                <div
                    id="navbar-menu"
                    className={`navbar-links${menuOpen ? " is-open" : ""}`}
                >
                    <a href="#projects-section" onClick={handleSectionClick("projects-section")} className="navbar-link">Projects</a>
                    <Link to="/blog" className="navbar-link" onClick={closeMenu}>Blog</Link>
                    <a href="#contact-section" onClick={handleSectionClick("contact-section")} className="navbar-link">Contact</a>

                    {!loading && isAuthenticated && isBlogPage && (
                        <Link to="/blog/admin/posts" className="navbar-link" onClick={closeMenu}>Create</Link>
                    )}

                    {!loading && isBlogPage && (
                        isAuthenticated ? (
                            <button type="button" className="navbar-link" onClick={handleLogout}>
                                Logout
                            </button>
                        ) : (
                            <Link to="/auth/login" className="navbar-link" onClick={closeMenu}>Login</Link>
                        )
                    )}
                </div>

                <button
                    type="button"
                    className={`theme-switch${theme === "dark" ? " is-dark" : ""}`}
                    role="switch"
                    aria-checked={theme === "dark"}
                    aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    onClick={toggleTheme}
                >
                    <span className="theme-switch__thumb" aria-hidden="true">
                        <svg className="theme-switch__icon theme-switch__sun" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="4" fill="currentColor" />
                            <path
                                d="M12 2.5v2.2M12 19.3v2.2M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.4 19.6l1.6-1.6M18 6l1.6-1.6"
                                stroke="currentColor"
                                strokeWidth="2.1"
                                strokeLinecap="round"
                            />
                        </svg>
                        <svg className="theme-switch__icon theme-switch__moon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7.2 7.2 0 1 0 21 14.5Z" />
                        </svg>
                    </span>
                </button>
            </div>
        </nav>
    );
}

export default NavBar;
