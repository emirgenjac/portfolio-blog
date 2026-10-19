import "../styles/ProjectCard.css";
import GitHubIcon from "../assets/github.svg";
import LiveIcon from "../assets/live.svg";

function ProjectCard({ title, link, description, color, language, ctaLabel }) {
    const isExternalSite = Boolean(ctaLabel) || !link.includes("github.com");
    const label = ctaLabel || (isExternalSite ? "Visit Site" : "Visit Repo");
    const icon = isExternalSite ? LiveIcon : GitHubIcon;

    return (
        <div className="project-card">
            <div className="project-card__upper">
                <a className="remove-link" href={link} target="_blank" rel="noopener noreferrer">
                    <h3 className="project-card__title">{title}</h3>
                </a>
                <p className="project-card__description">{description}</p>
            </div>
            <div className="project-card__lower">
                <div className="language">
                    <div className={`circle ${color}`}></div>
                    {language}
                </div>
                <a href={link} className="gh-visit-link" target="_blank" rel="noopener noreferrer">
                    <div className="visit-gh-project">
                        <img src={icon} alt="" className={isExternalSite ? "visit-live-icon" : undefined} />
                        <p>{label}</p>
                    </div>
                </a>
            </div>
        </div>
    );
}

export default ProjectCard;
