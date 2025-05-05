import { Link } from 'react-router-dom';
import '../styles/NavBar.css'
import {useNavigate} from 'react-router-dom'

function NavBar() {
    const navigate = useNavigate();
    const scrollToProjects = () => {
        if (window.location.pathname !== "/") {
            navigate("/");
            setTimeout(() => {
                const element = document.getElementById("projects-section");
                if (element) element.scrollIntoView({behavior: "smooth"});
            }, 100);
        } else {
            const element = document.getElementById("projects-section");
            if (element) element.scrollIntoView({behavior: "smooth"});
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <h1 className="navbar-logo">
                    <Link to="/" className="logo-link"><p className={"logo-letters"}>emirgenjac</p></Link>
                </h1>
                <div className="navbar-links">
                    <Link to="/" onClick={scrollToProjects} className="navbar-link">Projects</Link>
                    <Link to="/blog" className="navbar-link">Blog</Link>
                    <Link to="/" className="navbar-link">Contact</Link>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;