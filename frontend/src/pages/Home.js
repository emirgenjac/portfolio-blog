import {useCallback} from "react";
import {Link} from "react-router-dom";

import "../styles/Home.css";

import HeroPhoto from '../assets/hero-photo.jpg';
import DoubleArrow from '../assets/DoubleArrow.svg';
import MouseIcon from '../assets/MouseIcon.svg'
import LazorSports from '../assets/lazor.png';
import Boldo from '../assets/boldo.png';
import ChatApp from '../assets/chatapp.png';
import Live from '../assets/live.svg';
import Instagram from '../assets/instagram-svgrepo-com.svg';
import Linkedin from '../assets/linkedin-svgrepo-com (1).svg';
import Mail from '../assets/email-svgrepo-com.svg';
import GitHub from '../assets/github.svg';


import ProjectCard from "../components/ProjectCard";
import Slider from "../components/Slider";


const projects = [
    {
        title: "Spring-Boot-Backend-With-Roles",
        description: "This is a backend made using spring boot, it implements role-based authorization using a filter chain.",
        link: "https://github.com/emirgenjac/Spring-Boot-Backend-With-Roles",
        language: "Java",
        color: "orange"
    },
    {
        title: "Spring-Boot-App-Backend",
        description: "This is a backend project full of functionality created as a practice project. It implements various concepts including security, authentication and authorization, JWTs, caching, logging, testing, …",
        link: "https://github.com/emirgenjac/Spring-Boot-App-Backend",
        language: "Java",
        color: "orange"
    },
    {
        title: "LinkedIn-AdBlocker",
        description: "Being annoyed by ads constantly popping up on my feed as I scroll through LinkedIn, I decided to try building an ad blocker. It took a lot of troubleshooting but I got there eventually.",
        link: "https://github.com/emirgenjac/LinkedIn-AdBlocker",
        language: "JavaScript",
        color: "yellow"
    },
    {
        title: "SMARTBRAIN",
        description: "Full-stack application with registreation and AI integration. Import an image and the AI will recognise any faces.",
        link: "https://github.com/emirgenjac/SMARTBRAIN",
        language: "JavaScript",
        color: "yellow"
    },
    {
        title: "YOURPLACES",
        description: "Full stack app enabling users to register and keep track of all of the places they visit. Uses MERN stack.",
        link: "https://github.com/emirgenjac/YOURPLACES",
        language: "JavaScript",
        color: "yellow"
    },
    {
        title: "Thymeleaf-CRUD-Project",
        description: "CRUD app created in spring boot using Thymeleaf, MySQL and Bootstrap.",
        link: "https://github.com/emirgenjac/Thymeleaf-CRUD-Project",
        language: "Java",
        color: "orange"
    }
]

function Home() {
    const scrollToProjects = useCallback(() => {
        const element = document.getElementById('projects-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);
    const logoCount = 10;
    document.documentElement.style.setProperty('--logo-count', logoCount);
    return <>
        <div className="hero-container">
            <div className="hero-left">
                <p>Hello! I am</p>
                <p>Emir Genjac</p>
                <div className="title-container">
                    <p>Software Engineer</p>
                    <div className="circle purple"></div>
                    <p>Full-Stack Developer</p>
                </div>

                <p className="p-information">
                    I am a passionate Software Engineer and Full-Stack Developer based in Bosnia & Herzegovina, I have a strong interest in back-end engineering. I am committed to creating visually stunning and user-friendly websites. I can bring your ideas to light and elevate your business with a website.
                </p>
                <button className="cta">Contact Me</button>
            </div>

            <div className="hero-right">
                <div className="image-container">
                    {/* Purple background box */}
                    <div className="image-box" id="under-box"></div>

                    {/* Main image box */}
                    <div className="image-box">
                        <img src={HeroPhoto} className="hero-photo" alt="Emir Genjac"/>
                    </div>
                </div>
            </div>
        </div>

        <section className="mouse-icon-section">

            <div className="mouse-icon-container" onClick={scrollToProjects}>
                <img src={MouseIcon} className="mouse-icon" alt={"Mouse Icon"}/>
                <img src={DoubleArrow} className="double-arrow" alt={"Double Arrow"}/>
            </div>

        </section>

        <section className="gh-project-section" id="projects-section">
        <h1 className="projects-header">Projects</h1>
        <div className="projects-container">
            {projects.map((item) => (

                <ProjectCard title={item.title} link={item.link} description={item.description} color={item.color} language={item.language}/>

            ))}

        </div>
        </section>

        <section className="sites-section">
            <h1 className={"sites-header"}>Sites</h1>
            <div className="sites-container">
                <div className="site-box">
                    <div className="site-box-left">
                        <div className="site-box-image-box">
                            <img className={"site-image"} src={LazorSports} alt={"Lazor Sports"}/>
                        </div>
                    </div>
                    <div className="site-box-right">
                        <div className="site-box-content">
                            <div className={"site-info"}>
                            <h1 className={"site-title"} id={"title-1"}>Lazor Sports</h1>
                            <h2 className={"made-with"}>Made with: Webflow</h2>
                            <p className={"site-description"}>Website for a gaming organization</p>
                            </div>
                            <div className="site-cta" id="site-1">
                                <a href={"https://lazor-sports-emir.webflow.io"} className={"sites-links"}> <p>Visit</p>
                                <div className={"visit-site"} >
                                    <img className={"live-button"} src={Live}/>
                                </div></a>
                            </div>
                        </div>
                    </div>
                </div>



                <div className="site-box">
                    <div className="site-box-left">
                        <div className="site-box-image-box">
                            <img className={"site-image"} src={Boldo} id={"boldo"} alt={"Boldo"}/>
                        </div>
                    </div>
                    <div className="site-box-right">
                        <div className="site-box-content">
                            <div className={"site-info"}>
                            <h1 className={"site-title"} id={"title-2"}>Boldo</h1>
                            <h2 className={"made-with"}>Made with: Webflow</h2>
                            <p className={"site-description"}>Website for creating templates</p>
                            </div>
                            <div className="site-cta" id="site-1">
                                <a href={"https://boldoofficial.webflow.io"} className={"sites-links"}>
                                <p>Visit</p>
                                <div className={"visit-site"} >
                                    <img className={"live-button"} src={Live}/>
                                </div></a>
                            </div>
                        </div>
                    </div>
                </div>




                <div className="site-box">
                    <div className="site-box-left">
                        <div className="site-box-image-box">
                            <img className={"site-image"} src={ChatApp} alt={"Chat App"}/>
                        </div>
                    </div>
                    <div className="site-box-right">
                        <div className="site-box-content">
                            <div className={"site-info"}>
                            <h1 className={"site-title"} id={"title-3"}>ChatApp</h1>
                            <h2 className={"made-with"}>Made with: Webflow</h2>
                            <p className={"site-description"}>Website for teammate collaboration</p>
                            </div>
                            <div className="site-cta" id="site-1">
                                <a href={"https://chatapp-g3njac.webflow.io"} className={"sites-links"}>
                                <p>Visit</p>
                                <div className={"visit-site"} >
                                    <img className={"live-button"} src={Live}/>
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


        <section className="contact-section">
            <h1 className="ts-header">Contact</h1>
            <div className="logos-container">
                <Link to={"https://github.com/emirgenjac"} className={"logo-link"}><img src={GitHub} className={"contact-logo"}/></Link>
                <Link to={"https://www.instagram.com/g3njac/"} className={"logo-link"}><img src={Instagram} className={"contact-logo"}/></Link>
                <Link to={"https://www.linkedin.com/in/emir-genjac-710918192/"} className={"logo-link"}><img src={Linkedin} className={"contact-logo"}/></Link>
                <a href="mailto:genjacemir5@gmail.com" className={"logo-link"}><img src={Mail} className={"contact-logo"}/></a>
            </div>
            <h4 className={"copyright"}>Emir Genjac 2025 - Present</h4>
        </section>

    </>;
}

export default Home;