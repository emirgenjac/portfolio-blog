import "../styles/ProjectCard.css";
import GitHubIcon from "../assets/github.svg";
import {Link} from "react-router-dom";

function ProjectCard(props) {
    return (
        <div className="project-card">
            <div className="project-card__upper">
                <Link className="remove-link" to={props.link}>
                <h3 className="project-card__title">{props.title}</h3>
                </Link>
                <p className="project-card__description">{props.description}</p>
            </div>
            <div className="project-card__lower">
                <div className="language">
                    <div className={`circle ${props.color}`}></div>
                    {props.language}
                </div>
                <Link to={props.link} className={"gh-visit-link"}>
                <div className="visit-gh-project">
                    <img src={GitHubIcon} alt="GitHub" />
                    <p>Visit Repo</p>
                </div>
                </Link>
            </div>
        </div>
    );
}

export default ProjectCard;