import {useCallback, useEffect} from "react";
import {Link, useLocation} from "react-router-dom";

import "../styles/Home.css";

import HeroPhoto from '../assets/hero.webp';
import DoubleArrow from '../assets/DoubleArrow.svg';
import MouseIcon from '../assets/MouseIcon.svg'
import Fazuoi from '../assets/fazuoi.webp';
import Emirdev from '../assets/emirdev.webp';
import Boldo from '../assets/boldo.webp';
import Live from '../assets/live.svg';
import Instagram from '../assets/instagram-svgrepo-com.svg';
import Linkedin from '../assets/linkedin-svgrepo-com (1).svg';
import Mail from '../assets/email-svgrepo-com.svg';
import GitHub from '../assets/github.svg';


import ProjectCard from "../components/ProjectCard";
import Slider from "../components/Slider";
import { useDocumentMeta } from "../seo/useDocumentMeta";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "../seo/site";


const projects = [
    {
        title: "Digital Seized Assets Catalogue",
        description: "FAZUOI needed a transparent public view of seized assets. Built backend infrastructure - secure data models and APIs - for the Federal Agency’s catalogue as a UN Tech4R volunteer; live on a .gov.ba domain.",
        link: "https://katalog.fazuoi.gov.ba/",
        language: "Java",
        color: "orange",
        ctaLabel: "Visit Site"
    },
    {
        title: "Heronn.ai",
        description: "AI agents can run dangerous shell commands unsupervised. Built a local fail-closed policy daemon that blacklists risky commands, auto-allows safe ones, and parks the rest for human approval - with Cursor and Claude Code integration.",
        link: "https://github.com/emirgenjac/Heronn.ai",
        language: "TypeScript",
        color: "blue"
    },
    {
        title: "Portfolio & Blog",
        description: "Needed a recruiter-ready full-stack showcase. Spring Boot + React app with HttpOnly JWT cookies, CSRF double-submit, rate-limited login, and hardened security headers - this site is the product.",
        link: "https://github.com/emirgenjac/portfolio-blog",
        language: "JavaScript",
        color: "yellow"
    },
    {
        title: "SMARTBRAIN",
        description: "Built a full-stack face-detection app: users register, upload an image, and an AI API returns face bounds - auth plus third-party AI in one flow.",
        link: "https://github.com/emirgenjac/SMARTBRAIN",
        language: "JavaScript",
        color: "yellow"
    },
    {
        title: "YOURPLACES",
        description: "People lose track of places they’ve been. MERN app where users register and save visited spots - classic full-stack CRUD with real user accounts.",
        link: "https://github.com/emirgenjac/YOURPLACES",
        language: "JavaScript",
        color: "yellow"
    },
    {
        title: "LinkedIn AdBlocker",
        description: "LinkedIn feed ads were impossible to ignore. Browser extension that strips them from the DOM after plenty of DOM-mutation troubleshooting.",
        link: "https://github.com/emirgenjac/LinkedIn-AdBlocker",
        language: "JavaScript",
        color: "yellow"
    },
    {
        title: "Spring Boot Roles API",
        description: "Wanted real authorization beyond a single admin flag. Spring Security filter chain with role-based access so endpoints enforce who can do what, not just who is logged in.",
        link: "https://github.com/emirgenjac/Spring-Boot-Backend-With-Roles",
        language: "Java",
        color: "orange"
    },
    {
        title: "Spotify Desktop App",
        description: "Wanted a native-feeling music UI without a full native stack. Electron shell around HTML/CSS/JS for a desktop Spotify-style experience.",
        link: "https://github.com/emirgenjac/Spotify-Desktop-App",
        language: "Electron",
        color: "green"
    }
]

function Home() {
    const location = useLocation();
    useDocumentMeta({
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        path: "/",
    });

    const scrollToProjects = useCallback(() => {
        const element = document.getElementById('projects-section');
        if (element) {
            const top = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        const sectionId = location.state?.scrollTo || (location.hash ? location.hash.slice(1) : null);
        if (!sectionId) return;

        const timer = setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (!element) return;
            const top = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }, 100);

        return () => clearTimeout(timer);
    }, [location.state, location.hash]);

    return <>
        <div className="hero-container">
            <div className="hero-left">
                <h1>Hello! I am</h1>
                <h1>Emir Genjac</h1>
                <div className="title-container">
                    <p>Software Developer</p>
                    <div className="circle"></div>
                    <p>Full-Stack Developer</p>
                </div>

                <p className="p-information">
                    Software Developer with a genuine love for building and understanding software on a deeper level.
                </p>
                <Link to="/blog" className="cta">Check out my blog</Link>
            </div>

            <div className="hero-right">
                <div className="image-container">
                    <div className="image-box" id="under-box"></div>

                    <div className="image-box">
                        <img src={HeroPhoto} className="hero-photo" alt="Emir Genjac" width={840} height={1050} fetchPriority="high" decoding="async"/>
                    </div>
                </div>
                <button
                    type="button"
                    className="mouse-icon-container"
                    onClick={scrollToProjects}
                    aria-label="Scroll to projects"
                >
                    <img src={MouseIcon} className="mouse-icon" alt=""/>
                    <img src={DoubleArrow} className="double-arrow" alt=""/>
                </button>
            </div>
        </div>

        <section className="gh-project-section" id="projects-section">
        <h1 className="projects-header">Projects</h1>
        <div className="projects-container">
            {projects.map((item) => (
                <ProjectCard
                    key={item.link}
                    title={item.title}
                    link={item.link}
                    description={item.description}
                    color={item.color}
                    language={item.language}
                    ctaLabel={item.ctaLabel}
                />
            ))}

        </div>
        </section>

        <section className="sites-section">
            <h1 className={"sites-header"}>Sites</h1>
            <div className="sites-container">
                <div className="site-box">
                    <div className="site-box-left">
                        <div className="site-box-image-box site-box-image-box--logo">
                            <img className="site-image site-image--logo" src={Fazuoi} alt="Digital Seized Assets Catalogue" width={800} height={380} loading="lazy" decoding="async"/>
                        </div>
                    </div>
                    <div className="site-box-right">
                        <div className="site-box-content">
                            <div className={"site-info"}>
                            <h1 className={"site-title"} id={"title-1"}>Digital Seized Assets Catalogue</h1>
                            <h2 className={"made-with"}>FAZUOI · UN Tech4R</h2>
                            <p className={"site-description"}>Public catalogue of seized assets for the Federal Agency</p>
                            </div>
                            <div className="site-cta" id="site-1">
                                <a href={"https://katalog.fazuoi.gov.ba/"} className={"sites-links"} target="_blank" rel="noopener noreferrer">
                                <p>VISIT</p>
                                <div className={"visit-site"} >
                                    <img className={"live-button"} src={Live} alt=""/>
                                </div></a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="site-box">
                    <div className="site-box-left">
                        <div className="site-box-image-box">
                            <img className="site-image" src={Emirdev} alt="Emirdev Webflow portfolio" width={1200} height={380} loading="lazy" decoding="async"/>
                        </div>
                    </div>
                    <div className="site-box-right">
                        <div className="site-box-content">
                            <div className="site-info">
                            <h1 className="site-title" id="title-2">Emirdev</h1>
                            <h2 className="made-with">Made with: Webflow</h2>
                            <p className="site-description">Personal Webflow portfolio for client landing pages</p>
                            </div>
                            <div className="site-cta" id="site-2">
                                <a href="https://emirgenjac.webflow.io" className="sites-links" target="_blank" rel="noopener noreferrer">
                                <p>VISIT</p>
                                <div className="visit-site">
                                    <img className="live-button" src={Live} alt=""/>
                                </div></a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="site-box">
                    <div className="site-box-left">
                        <div className="site-box-image-box">
                            <img className="site-image" src={Boldo} id="boldo" alt="Boldo" width={1200} height={380} loading="lazy" decoding="async"/>
                        </div>
                    </div>
                    <div className="site-box-right">
                        <div className="site-box-content">
                            <div className="site-info">
                            <h1 className="site-title" id="title-3">Boldo</h1>
                            <h2 className="made-with">Made with: Webflow</h2>
                            <p className="site-description">Website for creating templates</p>
                            </div>
                            <div className="site-cta" id="site-3">
                                <a href="https://boldoofficial.webflow.io" className="sites-links" target="_blank" rel="noopener noreferrer">
                                <p>VISIT</p>
                                <div className="visit-site">
                                    <img className="live-button" src={Live} alt=""/>
                                </div></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="tech-stack-section">
            <h1 className="ts-header">Tech Stack</h1>
            <Slider />

        </section>


        <section className="contact-section" id="contact-section">
            <h1 className="ts-header">Contact</h1>
            <div className="logos-container">
                <Link to={"https://github.com/emirgenjac"} className={"logo-link"}><img src={GitHub} alt="GitHub" className={"contact-logo"}/></Link>
                <Link to={"https://www.instagram.com/g3njac/"} className={"logo-link"}><img src={Instagram} alt="Instagram" className={"contact-logo"}/></Link>
                <Link to={"https://www.linkedin.com/in/emir-genjac-710918192/"} className={"logo-link"}><img src={Linkedin} alt="LinkedIn" className={"contact-logo"}/></Link>
                <a href="mailto:genjacemir5@gmail.com" className={"logo-link"}><img src={Mail} alt="Email" className={"contact-logo"}/></a>
            </div>
            <h4 className={"copyright"}>Emir Genjac 2025 - Present</h4>
        </section>

    </>;
}

export default Home;