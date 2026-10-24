# Portfolio & Blog

[![CI](https://github.com/emirgenjac/portfolio-blog/actions/workflows/ci.yml/badge.svg)](https://github.com/emirgenjac/portfolio-blog/actions/workflows/ci.yml)

**Live:** [emirgenjac.com](https://emirgenjac.com) · API: [portfolio-blog-it8m.onrender.com](https://portfolio-blog-it8m.onrender.com)

This is a project I decided to make to showcase my skills. I have been learning React for a while, and more recently Spring Boot. It is a portfolio site with a blog: anyone can read and share posts, and only I can create or edit them.

Writing everything down from the start mattered as much as the code. Documentation of the whole project is complete. The [development journal](docs/journal.md) has timestamped notes for every change since the first homepage (27.04.2025) - JWT, HttpOnly cookies, CSRF, Docker, deploy, CI/CD, the mistakes included.

---

## Stack

| | |
|---|---|
| Frontend | React 19, React Router 7, axios |
| Backend | Spring Boot 3.4, Java 24, Spring Security, JWT |
| Database | PostgreSQL, Flyway, Spring Data JPA |
| Hosting | Cloudflare Pages, Render, Supabase ($0) |
| CI/CD | GitHub Actions → deploy hooks after green `main` |
| Domain | [emirgenjac.com](https://emirgenjac.com) (Cloudflare Registrar) |

---

## Custom domain

The SPA is on Cloudflare Pages at [emirgenjac.com](https://emirgenjac.com). The name is registered with Cloudflare Registrar and attached as a Pages custom domain (`CNAME` to `portfolio-blog-b33.pages.dev`, including `www`). A Cloudflare Redirect Rule sends `www` to `https://emirgenjac.com` (301). The target must be **HTTPS apex** for both `http://www` and `https://www` — Instagram’s in-app browser often opens typed `www.` links as HTTP, and a rule that only rewrites `https://www.*` 301s HTTP www to itself (“too many redirects”).

The API stays on Render. `APP_CORS_ALLOWED_ORIGINS` includes `https://emirgenjac.com` (and the old `pages.dev` origin during cutover). Cookies stay `SameSite=None` because Pages and Render are still different sites. Canonical / Open Graph URLs use `REACT_APP_SITE_URL=https://emirgenjac.com` at build time. Homepage share cards use a 1200×630 `og-card.jpg` (new filename so crawlers do not keep a cached `og-image.jpg`).

---

## How it fits together

The React app is a static SPA. It talks to a Spring REST API:

- `GET /blog`, `GET /blog/{id}` - public
- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `GET /auth/csrf` - public (login is rate-limited)
- `POST/PUT/DELETE /blog/admin/**` - JWT required

Business logic sits in services, not controllers. Requests use DTOs with Jakarta Validation. Errors go through `GlobalExceptionHandler` as a shared `ErrorResponse` JSON. Create and update attach the post to the admin from the JWT (email in the cookie), not a hardcoded `id=1`. The display name on the post is still "Emir Genjac".

Schema is Flyway (`V1__baseline_schema.sql`). Hibernate is `ddl-auto=validate` in dev and prod.

---

## Security

The JWT used to live in `localStorage`. That was a bad default, so I moved it to an **HttpOnly** cookie. JavaScript never sees the token and it is not returned in the JSON body.

The browser sends that cookie on its own, so CSRF had to come back on. Spring sets an `XSRF-TOKEN` cookie; the SPA sends it back as `X-XSRF-TOKEN` on POST/PUT/DELETE. Pages and Render are different sites, so the frontend cannot read that cookie with `document.cookie`. It loads the token from `GET /auth/csrf` instead (double-submit, not a session stored in JS).

Cookies in prod: `Secure; SameSite=None` (cross-site). Locally: `SameSite=Lax` without `Secure`. CORS origins come from env. Login is limited to 5 attempts per IP per minute. Security headers are set on the API and on the SPA (`_headers`).

---

## CI / CD

Push or PR to `main` runs backend tests (JUnit, H2) and frontend tests + production build in parallel. If both pass on `main`, Actions POSTs deploy hooks from the `production` GitHub Environment - Render for the API, Cloudflare Pages for the UI. Hook URLs are secrets, not in YAML. Host auto-deploy is off, so a red CI does not ship.

The free Render JVM sleeps when idle. UptimeRobot pings `/actuator/health` every 5 minutes so the blog is less likely to cold-start on a first visit.

---

## Run with Docker

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose).

```bash
# From the repo root
cp .env.example .env   # Windows: copy .env.example .env
docker compose up --build
```

| Service  | URL / port                          |
|----------|-------------------------------------|
| Frontend | http://localhost:3000               |
| Backend  | http://localhost:8080               |
| Postgres | `localhost:5433` → container `5432` |

Flyway runs on first boot. The database has no admin user until you insert one (password must be BCrypt-hashed). Stop with `Ctrl+C` or `docker compose down`.

Without Docker: Postgres on `localhost:5432`, database `blog`, `JWT_SECRET` in the environment, `cd backend && ./mvnw spring-boot:run`, `cd frontend && npm start`.

---

## Environment

Do not commit real values. See `.env.example`, `backend/.env.example`, `frontend/.env.example`.

| Variable | Where | Purpose |
|----------|--------|---------|
| `SPRING_DATASOURCE_URL` | API | JDBC URL |
| `SPRING_DATASOURCE_USERNAME` / `PASSWORD` | API | DB login |
| `JWT_SECRET` | API | Signing key (32+ chars) |
| `SPRING_PROFILES_ACTIVE` | API | `prod` in production |
| `APP_CORS_ALLOWED_ORIGINS` | API | Frontend origin, no trailing slash (prod: `https://emirgenjac.com`) |
| `REACT_APP_API_URL` | SPA build | API origin (baked in at `npm run build`) |
| `REACT_APP_SITE_URL` | SPA build | Canonical / Open Graph origin (prod: `https://emirgenjac.com`) |

---

## Tests

```bash
cd backend && ./mvnw test
cd frontend && npm run test:ci
```

Backend: login success/fail, `/auth/me` with and without the JWT cookie, admin CRUD without JWT → 401, invalid DTOs → 400 `ErrorResponse`, login rate limit. Frontend: `ProtectedRoute` redirect, Create link only when authenticated.

---

## Journal

[docs/journal.md](docs/journal.md) - full history of the project, dated and in order.
