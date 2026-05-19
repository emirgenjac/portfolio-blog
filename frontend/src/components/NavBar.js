import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';
import {AuthContext} from "../context/AuthContext";
import { useContext } from 'react';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout, loading } = useContext(AuthContext);


    const scrollToProjects = () => {
        if (window.location.pathname !== "/") {
            navigate("/");
            setTimeout(() => {
                const element = document.getElementById("projects-section");
                if (element) element.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } else {
            const element = document.getElementById("projects-section");
            if (element) element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            logout();
        }
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
                    <Link to="/" onClick={scrollToProjects} className="navbar-link">Projects</Link>
                    <Link to="/blog" className="navbar-link">Blog</Link>
                    <Link to="/" className="navbar-link">Contact</Link>

                    {!loading && isAuthenticated && isBlogPage && (
                        <Link to="/blog/admin/posts" className="navbar-link">Create</Link>
                    )}

                    {!loading && isBlogPage && (
                        isAuthenticated ? (
                            <button className="navbar-link" onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
