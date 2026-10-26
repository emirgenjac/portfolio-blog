# Portfolio & Blog

[![CI](https://github.com/emirgenjac/portfolio-blog/actions/workflows/ci.yml/badge.svg)](https://github.com/emirgenjac/portfolio-blog/actions/workflows/ci.yml)

**Live:** [emirgenjac.com](https://emirgenjac.com)

This is a project I decided to make to showcase my skills. I have been learning React for a while, and more recently Spring Boot. It is a portfolio site with a blog: anyone can read and share posts, and only I can create or edit them. I started this project a year ago, and have been taking my time, because I wanted to implement a lot of stuff, and I was leraning how to do that along the way.

I wanted to document the whole project from start to finish, to have a clear roadmap of how I did everything. The [development journal](docs/journal.md) has timestamped notes for every change since the first homepage (27.04.2025) - JWT, HttpOnly cookies, CSRF, Docker, deploy, CI/CD, and the mistakes included.

---

## Stack

| | |
|---|---|
| Frontend | React 19, React Router 7, axios |
| Backend | Spring Boot 3.4, Java 24, Spring Security, JWT |
| Database | PostgreSQL, Flyway, Spring Data JPA |
| Hosting | Cloudflare Pages, Render, Supabase |
| CI/CD | GitHub Actions |
| Domain | [emirgenjac.com](https://emirgenjac.com) (Cloudflare) |

---

## Custom domain

The app is on Cloudflare Pages at [emirgenjac.com](https://emirgenjac.com). The name is registered with Cloudflare Registrar and attached as a Pages custom domain to the already existing pages project on Cloudflare. I added a Cloudflare Redirect Rule that redirects `www.emirgenjac.com` to `https://emirgenjac.com`. I came to this idea because i sent someone the URL through Instagram DM's, but got the error message "too many redirects". That happened because Instagram prepends www to the link.

---

## How it fits together

The React app is a static Single Page Application. It talks to a Spring REST API:

- `GET /blog`, `GET /blog/{id}` - public
- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `GET /auth/csrf` - public (login is rate-limited)
- `POST/PUT/DELETE /blog/admin/**` - JWT required

I used Layered architecture: Repository -> Service -> Controller. Requests use Data-Transfer-Objects with Jakarta Validation. Errors go through `GlobalExceptionHandler` as a shared `ErrorResponse` JSON.

Schema is Flyway.

---

## Security

The JWT used to live in `localStorage`. I was still learning what JWT is so I didn't know better. That was a bad decision, so I moved it to an **HttpOnly** cookie. JavaScript never sees the token and it is not returned in the JSON body.

The browser sends that cookie on its own, so CSRF had to be included. Spring sets an `XSRF-TOKEN` cookie; the SPA sends it back as `X-XSRF-TOKEN` on POST/PUT/DELETE. Pages and Render are different sites, so the frontend cannot read that cookie with `document.cookie`. It loads the token from `GET /auth/csrf` instead.

Cookies in prod: `Secure; SameSite=None` (cross-site). Locally: `SameSite=Lax` without `Secure`. CORS origins come from env. Login is limited to 5 attempts per IP per minute. Security headers are set on the API and on the SPA (`_headers`).

---

## CI / CD

This was an important step for me. I have been creating projects for a long time, but I always had problems with hosting and deployment. I finally learned how to do it, and also implement Continuous Integration and Continuous Deployment.

Push or PR to `main` runs backend tests (JUnit, H2) and frontend tests + production build in parallel. If both pass on `main`, GitHub Actions POSTs deploy hooks from the `production` GitHub Environment - Render for the API, Cloudflare Pages for the UI. Hook URLs are secrets. Host auto-deploy is off, so a red CI does not ship, which is very important, and the reason I implemented a lot of tests. If even one fails, the deployment is stopped.

---

## UptimeRobot

I had a big problem with Render. Since it is the free tier, after 15 minutes of inactivity, it goes to sleep. When the next request comes in, it takes around 2-3 minutes to wake up. Nobody is going to wait for 3 minutes to see some blog posts. The solution to this was creating an UptimeRobot service, which I set up to ping the /actuator/health endpoint every 5 minutes. This resulted in Render never falling asleep.

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

Keeping environment variables safe was very important, since there were so many.

| Variable | Where | Purpose |
|----------|--------|---------|
| `SPRING_DATASOURCE_URL` | API | JDBC URL |
| `SPRING_DATASOURCE_USERNAME` / `PASSWORD` | API | DB login |
| `JWT_SECRET` | API | Signing key |
| `SPRING_PROFILES_ACTIVE` | API | `prod` in production |
| `APP_CORS_ALLOWED_ORIGINS` | API | Frontend origin |
| `REACT_APP_API_URL` | SPA build | API origin  |
| `REACT_APP_SITE_URL` | SPA build | Canonical / Open Graph origin |

---

## Tests

Testing is very important, and I have started to learn more and more about it recently. 

### Backend Tests

#### Used
JUnit 5, Spring Boot Test, MockMvc, spring-security-test, H2, JsonPath / Hamcrest, JJWT.

#### Tests
AuthApiIntegrationTest - Integration - Tests authentication, login and logout flow functionality with JWT and CSRF.

BlogPostAdminSecurityTest - Integration - Tests authorization and access to admin features.

BlogPostPublicReadTest - Integration - Reading the blog stays public and does not leak the admin data.

LoginRateLimitServiceTest - Unit - Tests protection from login abuse and too many requests.

JwtUtilTest - Unit - Tests whether the token is valid, expired, tampered with or the wrong key.

ActuatorHealthTest - Integration - Tests that health is public and does not leak details. Important because it is being hit by UptimeRobot.

### Frontend Tests

#### Used 
Jest, React Testing Library, MemoryRouter, jest.mock

#### Tests
ProtectedRoute.test.js - Component - Tests if admin pages stay locked.

AuthContext.test.js - Component - Tests if auth is being requested only where actually needed.

LoginForm.test.js - Component - Tests if entering a wrong password results in a different status code than being rate-limited. (401 vs 429).

axios.test.js - Unit - Tests correct handling of CSRF header on requests.

Navbar.test.js - Component - Tests UI depending on logged in or out.

PostDetail.test.js - Component - Ensures that destructive action is confirmed first.

### Run Tests

```bash
cd backend && ./mvnw test
cd frontend && npm run test:ci
```

---

## Journal

[docs/journal.md](docs/journal.md) - This is where I was keeping track of every change in the app, since the beginning.
