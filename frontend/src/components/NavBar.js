import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';
import {AuthContext} from "../context/AuthContext";
import { useContext } from 'react';
import { useModal } from "../context/ModalContext";

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout, loading } = useContext(AuthContext);
    const { showConfirm } = useModal();

    const scrollToSection = (sectionId) => {
        const run = () => {
            const element = document.getElementById(sectionId);
            if (!element) return;
            const top = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        };

        if (location.pathname !== "/") {
            navigate("/", { state: { scrollTo: sectionId } });
            // Home mounts after navigation — give it a beat to paint
            setTimeout(run, 150);
        } else {
            run();
        }
    };

    const handleSectionClick = (sectionId) => (e) => {
        e.preventDefault();
        scrollToSection(sectionId);
    };

    const handleLogout = async () => {
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
        <nav className="navbar">
            <div className="navbar-container">
                <h1 className="navbar-logo">
                    <Link to="/" className="logo-link">
                        <p className="logo-letters">emirgenjac</p>
                    </Link>
                </h1>

                <div className="navbar-links">
                    <a href="#projects-section" onClick={handleSectionClick("projects-section")} className="navbar-link">Projects</a>
                    <Link to="/blog" className="navbar-link">Blog</Link>
                    <a href="#contact-section" onClick={handleSectionClick("contact-section")} className="navbar-link">Contact</a>

                    {!loading && isAuthenticated && isBlogPage && (
                        <Link to="/blog/admin/posts" className="navbar-link">Create</Link>
                    )}

                    {!loading && isBlogPage && (
                        isAuthenticated ? (
                            <button type="button" className="navbar-link" onClick={handleLogout}>
                                Logout
                            </button>
                        ) : (
                            <Link to="/auth/login" className="navbar-link">Login</Link>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
