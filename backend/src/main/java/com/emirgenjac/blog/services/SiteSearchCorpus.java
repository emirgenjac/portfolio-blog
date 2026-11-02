package com.emirgenjac.blog.services;

import java.util.List;

final class SiteSearchCorpus {

    /**
     * Home project/site blurbs plus a short about-this-site note you control.
     * Keep titles and descriptions in sync with {@code frontend/src/pages/Home.js}.
     */
    record Document(String kind, int id, String title, String body, String href) {
    }

    private static final List<Document> DOCUMENTS = List.of(
            project(1, "Digital Seized Assets Catalogue",
                    "FAZUOI needed a transparent public view of seized assets. Built backend infrastructure - secure data models and APIs - for the Federal Agency's catalogue as a UN Tech4R volunteer; live on a .gov.ba domain.",
                    "https://katalog.fazuoi.gov.ba/"),
            project(2, "Heronn.ai",
                    "AI agents can run dangerous shell commands unsupervised. Built a local fail-closed policy daemon that blacklists risky commands, auto-allows safe ones, and parks the rest for human approval - with Cursor and Claude Code integration.",
                    "https://github.com/emirgenjac/Heronn.ai"),
            project(3, "Portfolio & Blog",
                    "Needed a recruiter-ready full-stack showcase. Spring Boot + React app with HttpOnly JWT cookies, CSRF double-submit, rate-limited login, and hardened security headers - this site is the product.",
                    "https://github.com/emirgenjac/portfolio-blog"),
            project(4, "SMARTBRAIN",
                    "Built a full-stack face-detection app: users register, upload an image, and an AI API returns face bounds - auth plus third-party AI in one flow.",
                    "https://github.com/emirgenjac/SMARTBRAIN"),
            project(5, "YOURPLACES",
                    "People lose track of places they have been. MERN app where users register and save visited spots - classic full-stack CRUD with real user accounts.",
                    "https://github.com/emirgenjac/YOURPLACES"),
            project(6, "LinkedIn AdBlocker",
                    "LinkedIn feed ads were impossible to ignore. Browser extension that strips them from the DOM after plenty of DOM-mutation troubleshooting.",
                    "https://github.com/emirgenjac/LinkedIn-AdBlocker"),
            project(7, "Spring Boot Roles API",
                    "Wanted real authorization beyond a single admin flag. Spring Security filter chain with role-based access so endpoints enforce who can do what, not just who is logged in.",
                    "https://github.com/emirgenjac/Spring-Boot-Backend-With-Roles"),
            project(8, "Spotify Desktop App",
                    "Wanted a native-feeling music UI without a full native stack. Electron shell around HTML/CSS/JS for a desktop Spotify-style experience.",
                    "https://github.com/emirgenjac/Spotify-Desktop-App"),
            new Document("site", 1, "Emirdev",
                    "Personal Webflow portfolio for client landing pages.",
                    "https://emirgenjac.webflow.io"),
            new Document("site", 2, "Boldo",
                    "Website for creating templates. Made with Webflow.",
                    "https://boldoofficial.webflow.io"),
            new Document("about", 1, "About this site",
                    "Emir Genjac, software developer. This portfolio and blog is a Spring Boot and React app. Login uses an HttpOnly JWT cookie, not localStorage. Mutations use CSRF double-submit. Login is rate-limited. Live at emirgenjac.com.",
                    "/")
    );

    private SiteSearchCorpus() {
    }

    static List<Document> documents() {
        return DOCUMENTS;
    }

    private static Document project(int id, String title, String body, String href) {
        return new Document("project", id, title, body, href);
    }
}
