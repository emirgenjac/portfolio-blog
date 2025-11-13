import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';
import { useEffect, useState } from 'react';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

    useEffect(() => {
        // Listen for login/logout changes from other components
        const handleStorageChange = () => setIsLoggedIn(!!localStorage.getItem("token"));
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    useEffect(() => {
        // Update login state whenever location changes
        setIsLoggedIn(!!localStorage.getItem("token"));
    }, [location.pathname]);

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
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            navigate("/blog");
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

                    {isLoggedIn && (
                        <Link to="/blog/admin/posts" className="navbar-link">Create</Link>
                    )}

                    {isBlogPage && (
                        isLoggedIn ? (
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
