import "../styles/Home.css";
import HeroPhoto from '../assets/hero-photo.jpg';
import DoubleArrow from '../assets/DoubleArrow.svg';
import MouseIcon from '../assets/MouseIcon.svg';

function Home() {
    return <>
        <div className="hero-container">
            <div className="hero-left">
                <p>Hello! I am</p>
                <p>Emir Genjac</p>
                <div className="title-container">
                    <p>Software Engineer</p>
                    <div className="circle"></div>
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
            <div className="mouse-icon-container">
                <img src={MouseIcon} className="mouse-icon" alt={"Mouse Icon"}/>
                <img src={DoubleArrow} className="double-arrow" alt={"Double Arrow"}/>
            </div>
        </section>

    </>;
}

export default Home;