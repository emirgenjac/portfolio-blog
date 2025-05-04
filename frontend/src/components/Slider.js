import React, { useEffect, useRef } from 'react';
import '../styles/Slider.css';

const techStackLogos = [
    { name: 'React', image: 'https://www.svgrepo.com/show/354259/react.svg' },
    { name: 'Java', image: 'https://www.svgrepo.com/show/303654/java-logo.svg' },
    { name: 'Spring Boot', image: 'https://www.svgrepo.com/show/354379/spring.svg' },
    { name: 'JavaScript', image: 'https://www.svgrepo.com/show/349419/javascript.svg' },
    { name: 'Node.js', image: 'https://www.svgrepo.com/show/376337/node-js.svg' },
    { name: 'HTML5', image: 'https://www.svgrepo.com/show/452228/html-5.svg' },
    { name: 'CSS3', image: 'https://www.svgrepo.com/show/452185/css-3.svg' },
    { name: 'Git', image: 'https://www.svgrepo.com/show/452210/git.svg' },
    { name: 'Docker', image: 'https://www.svgrepo.com/show/452192/docker.svg' },
    { name: 'PostgreSQL', image: 'https://www.svgrepo.com/show/354200/postgresql.svg' }

];

const Slider = () => {
    const doubledLogos = [...techStackLogos, ...techStackLogos];
    const trackRef = useRef(null);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const handleMouseEnter = () => {
            track.style.animationPlayState = 'paused';
        };

        const handleMouseLeave = () => {
            track.style.animationPlayState = 'running';
        };

        track.addEventListener('mouseenter', handleMouseEnter);
        track.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            track.removeEventListener('mouseenter', handleMouseEnter);
            track.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div className="carousel-container">
            <div className="carousel-track" ref={trackRef}>
                {doubledLogos.map((logo, index) => (
                    <div className="logo-item" key={`${logo.name}-${index}`}>
                        <img className="logo-image" src={logo.image} alt={logo.name} />
                        <span className="logo-name">{logo.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Slider;