import { Link } from 'react-router-dom';
import '../styles/NavBar.css';

function NavBar() {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <h1 className="navbar-logo">
                    <Link to="/" className="logo-link">emirgenjac</Link>
                </h1>
                <div className="navbar-links">
                    <Link to="/" className="navbar-link">Projects</Link>
                    <Link to="/blog" className="navbar-link">Blog</Link>
                    <Link to="/" className="navbar-link">Contact</Link>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;