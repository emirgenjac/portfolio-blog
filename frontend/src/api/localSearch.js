import { readCachedPosts } from "./blogCache";
import { SEARCH_MAX_LENGTH } from "./search";

const MAX_HITS = 10;
const SNIPPET_LENGTH = 180;

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "to", "in", "on", "for", "is", "was",
  "were", "be", "this", "that", "what", "who", "how", "why", "where", "when",
  "with", "from", "it", "its", "you", "your", "we", "our", "are", "been",
  "being", "do", "does", "did", "can", "could", "would", "should", "at",
  "by", "as", "if", "but", "not", "no", "so", "than", "then", "into",
  "over", "after", "before", "about",
]);

const STATIC_DOCUMENTS = [
  {
    kind: "project",
    id: 1,
    title: "Digital Seized Assets Catalogue",
    body: "FAZUOI needed a transparent public view of seized assets. Built backend infrastructure - secure data models and APIs - for the Federal Agency's catalogue as a UN Tech4R volunteer; live on a .gov.ba domain.",
    href: "https://katalog.fazuoi.gov.ba/",
  },
  {
    kind: "project",
    id: 2,
    title: "Heronn.ai",
    body: "AI agents can run dangerous shell commands unsupervised. Built a local fail-closed policy daemon that blacklists risky commands, auto-allows safe ones, and parks the rest for human approval so agents cannot hack the host - with Cursor and Claude Code integration.",
    href: "https://github.com/emirgenjac/Heronn.ai",
  },
  {
    kind: "project",
    id: 3,
    title: "Portfolio & Blog",
    body: "Needed a recruiter-ready full-stack showcase. Made with Spring Boot and React. HttpOnly JWT cookies, CSRF double-submit, rate-limited login, and hardened security headers - this site is the product.",
    href: "https://github.com/emirgenjac/portfolio-blog",
  },
  {
    kind: "project",
    id: 4,
    title: "SMARTBRAIN",
    body: "Built a full-stack face-detection app: users register, upload an image, and an AI API returns face bounds - auth plus third-party AI in one flow.",
    href: "https://github.com/emirgenjac/SMARTBRAIN",
  },
  {
    kind: "project",
    id: 5,
    title: "YOURPLACES",
    body: "People lose track of places they have been. MERN app where users register and save visited spots - classic full-stack CRUD with real user accounts.",
    href: "https://github.com/emirgenjac/YOURPLACES",
  },
  {
    kind: "project",
    id: 6,
    title: "LinkedIn AdBlocker",
    body: "LinkedIn feed ads were impossible to ignore. Browser extension that strips them from the DOM after plenty of DOM-mutation troubleshooting.",
    href: "https://github.com/emirgenjac/LinkedIn-AdBlocker",
  },
  {
    kind: "project",
    id: 7,
    title: "Spring Boot Roles API",
    body: "Wanted real authorization beyond a single admin flag. Spring Security filter chain with role-based access so endpoints enforce who can do what, not just who is logged in.",
    href: "https://github.com/emirgenjac/Spring-Boot-Backend-With-Roles",
  },
  {
    kind: "project",
    id: 8,
    title: "Spotify Desktop App",
    body: "Wanted a native-feeling music UI without a full native stack. Electron shell around HTML/CSS/JS for a desktop Spotify-style experience.",
    href: "https://github.com/emirgenjac/Spotify-Desktop-App",
  },
  {
    kind: "site",
    id: 1,
    title: "Emirdev",
    body: "Made with: Webflow. Personal Webflow portfolio for client landing pages.",
    href: "https://emirgenjac.webflow.io",
  },
  {
    kind: "site",
    id: 2,
    title: "Boldo",
    body: "Made with: Webflow. Website for creating templates.",
    href: "https://boldoofficial.webflow.io",
  },
  {
    kind: "about",
    id: 1,
    title: "About this site",
    body: "Made with Spring Boot and React, Java, PostgreSQL, and Docker. Emir Genjac, software developer. This portfolio and blog is a Spring Boot and React app. Login uses an HttpOnly JWT cookie, not localStorage. Mutations use CSRF double-submit. Login is rate-limited. Live at emirgenjac.com.",
    href: "/blog",
  },
];

function normalizeQuery(raw) {
  if (raw == null) {
    return "";
  }
  let cleaned = "";
  for (const char of String(raw)) {
    const code = char.codePointAt(0);
    if (code <= 0x1f && !/\s/.test(char)) {
      continue;
    }
    cleaned += char;
  }
  return cleaned.trim().replace(/\s+/g, " ");
}

function terms(query) {
  const parts = query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const kept = parts.filter((part) => part.length >= 2 && !STOPWORDS.has(part));
  if (kept.length > 0) {
    return kept;
  }
  return query ? [query.toLowerCase()] : [];
}

function haystack(...parts) {
  return parts
    .filter((part) => part != null && part !== "")
    .map((part) => String(part).toLowerCase())
    .join("\n");
}

function containsAll(text, needles) {
  return needles.every((needle) => text.includes(needle));
}

function excerpt(text, needle) {
  if (!text) {
    return null;
  }
  const lower = text.toLowerCase();
  const matchAt = lower.indexOf(needle);
  if (matchAt < 0) {
    return null;
  }
  const start = Math.max(0, matchAt - 40);
  const end = Math.min(text.length, start + SNIPPET_LENGTH);
  let out = text.slice(start, end).trim();
  if (start > 0) {
    out = `…${out}`;
  }
  if (end < text.length) {
    out = `${out}…`;
  }
  return out;
}

function snippet(primary, secondary, fallback, needles) {
  for (const needle of needles) {
    const fromPrimary = excerpt(primary, needle);
    if (fromPrimary) {
      return fromPrimary;
    }
    const fromSecondary = excerpt(secondary, needle);
    if (fromSecondary) {
      return fromSecondary;
    }
    const fromFallback = excerpt(fallback, needle);
    if (fromFallback) {
      return fromFallback;
    }
  }
  if (primary && String(primary).trim()) {
    return primary;
  }
  return fallback || "";
}

function aboutHref(posts) {
  const makingOf = (posts || []).find((post) =>
    haystack(post.title, post.tagline, post.content).includes("ovaj sajt")
  );
  if (makingOf?.id != null) {
    return `/blog/${makingOf.id}`;
  }
  return "/blog";
}

function postHit(post, needles) {
  return {
    kind: "post",
    id: post.id,
    title: post.title,
    snippet: snippet(post.tagline, post.content, post.title, needles),
    href: `/blog/${post.id}`,
  };
}

function documentHit(document, needles, posts) {
  return {
    kind: document.kind,
    id: document.id,
    title: document.title,
    snippet: snippet(document.body, null, document.title, needles),
    href: document.kind === "about" ? aboutHref(posts) : document.href,
  };
}

export function searchLocal(rawQuery) {
  const query = normalizeQuery(rawQuery);
  if (!query) {
    return { hits: [], error: "Query is required" };
  }
  if (query.length > SEARCH_MAX_LENGTH) {
    return { hits: [], error: "Query is too long" };
  }

  const needles = terms(query);
  const posts = readCachedPosts() || [];
  const hits = [];

  for (const post of posts) {
    if (containsAll(haystack(post.title, post.tagline, post.content), needles)) {
      hits.push(postHit(post, needles));
      if (hits.length === MAX_HITS) {
        return { hits, error: "" };
      }
    }
  }

  for (const document of STATIC_DOCUMENTS) {
    if (hits.length === MAX_HITS) {
      break;
    }
    if (containsAll(haystack(document.title, document.body), needles)) {
      hits.push(documentHit(document, needles, posts));
    }
  }

  return { hits, error: "" };
}
