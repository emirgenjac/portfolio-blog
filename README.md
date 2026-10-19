# Portfolio & Blog

This is a project I decided to make to showcase my skills. For a long time now I have been learning React and, more recently, Spring Boot. This is a portfolio, with an added functionality of a blog. Users can view the blog posts I create and share them. Only I can create blog posts.

---

## TODO

- [x] Migrate token from localStorage to HttpOnly (or something else)
- [x] Global Exception Handling
- [x] Update the DTOs to match the form fields
- [x] Replace `alert()` / `confirm()` with a proper modal UI
- [ ] Dockerize
- [ ] Deploy

---

### 19.10.2026.

#### Time: 22:25
Cleaned up login and error handling after the modal work. Softened `AdminLoginDTO` so empty password does not dump Spring's raw validation text into the UI, and `LoginForm` maps 400/401 to clearer messages. Raised `BlogPostDTO` cover image size so base64 uploads on edit no longer fail with 400. Hardened logout in `AuthContext` so a dead backend does not leave the UI hanging on a Network Error. Also tightened `GlobalExceptionHandler` / `ErrorResponse` so validation and unexpected failures keep a consistent JSON shape.

---

#### Time: 22:05
Replaced every browser `alert()` / `confirm()` with a reusable `AppModal` and `ModalContext` (`showAlert` / `showConfirm`). Login errors, create/edit feedback, ProtectedRoute notices, and logout confirmation all go through the same UI now. This was the last big UX debt item on the todo list before Docker and deploy.

---

#### Time: 21:40
Added Share on `PostDetail`: copy link to clipboard, plus open LinkedIn's share composer with the current post URL. Still need to verify both on a real HTTPS URL after deploy (localhost share previews are limited). Also dropped the leftover likes UI from the post meta and kept `createdAt` only.

---

#### Time: 21:10
Refreshed the portfolio content on Home. GitHub projects and Sites now lead with real work (FAZUOI catalog live site, Heronn, Emirdev / Webflow, Boldo) and I removed older practice cards (ChatApp, Lazor). Added preview assets for FAZUOI and Emirdev so the cards match what people actually see online.

---

#### Time: 20:30
Polish pass on the CSS redesign: title wrapping, killed the green logo hover, tighter nav/logout on small screens, iPhone-safe contact reachability and hero centering, and a shorter author bar on posts. Mostly layout and overflow fixes so the new look holds up on mobile.

---

#### Time: 18:40
Wired the login form to the new rate-limit response. Before, every failed login showed "Invalid credentials", even when the backend returned 429. Now 401 still means wrong password, and 429 shows a clear "too many attempts" message. Also added unit tests for the rate limiter, including a concurrent case so the per-IP limit cannot be bypassed by parallel requests. It was interesting to see how data structures such as a ConcurrentHashMap and a Deque could be used together to solve a problem.

---

#### Time: 18:30
Added login rate limiting on the backend. `LoginRateLimitService` tracks attempts per client IP in a rolling window (default 5 tries per 60 seconds) and returns 429 when someone spams `/auth/login`. This is an in-memory limiter for a single app instance, which is enough for now. I verified it in the browser and with the new tests.

---

#### Time: 16:10
Made CORS and the frontend API base URL configurable for hosting. The backend now reads allowed origins from config/env instead of hardcoding localhost, and I removed the duplicate `CorsConfig` so Spring Security is the single CORS source. On the frontend, axios uses `REACT_APP_API_URL` (with a localhost fallback). Local login still returns the expected CORS headers and sets the JWT cookie as before.

---

#### Time: 15:55
Turned CSRF protection back on for the cookie-based auth. The JWT cookie alone is not enough, because the browser sends it automatically. Now the backend also sets an `XSRF-TOKEN` cookie that the frontend reads and sends back as an `X-XSRF-TOKEN` header on POST/PUT/DELETE. That way a random site cannot forge admin requests even if it somehow tricks the browser into calling my API. Login, create, edit and delete still work after a refresh.

---

#### Time: 15:35
Hardened the JWT cookies for hosting. Login and logout now use `ResponseCookie` with explicit `SameSite` settings. In development it stays `SameSite=Lax` without `Secure` so localhost keeps working. In the production profile the cookie is `Secure` and `SameSite=None`, which is what you need when the frontend and API are on different HTTPS domains. I verified both with curl.

---

#### Time: 15:28
Small cleanup on the frontend API client: the axios request/response console logging only runs in development now, so production builds will not spam the browser console.

---

#### Time: 11:47
Updated the DTOs so they actually match what the forms send. `BlogPostDTO` now requires title, tagline, content, and cover image URL, with size limits on each field. `AdminLoginDTO` validates email and password the same way. Together with the global exception handler, bad input now comes back as clear 400 responses instead of failing in a random way.

---

#### Time: 11:41
Added global exception handling on the backend. Instead of every controller returning errors in its own way, there is now a `GlobalExceptionHandler` that catches things like validation failures, missing posts, bad request bodies, and unexpected errors, and returns a consistent `ErrorResponse` JSON. Controllers can still throw `ResponseStatusException` when something is wrong; the handler takes care of the response shape. This should make debugging and the frontend error handling a lot cleaner.

---

#### Time: 11:15
Got back to this project after a while. Today I cleaned up the backend config so it's ready for hosting later. I split `application.properties` into separate profiles for development and production, and moved local overrides into a gitignored `application-local.properties`. Sensitive values like the database password and JWT secret now come from environment variables. I also added a `.env.example` so I know which variables I need when I set things up again. Next I want to finish the remaining hosting prep and then finally deploy.

---

### 20.05.2026.

#### Time: 00:17
I took on the first feature from the todo list. I migrated the unsafe localStorage-kept JWT token, to a HttpOnly cookie. This way, the JavaScript doesnt even see the token. The backend handles it fully, it is not included in the response. This is much safer and a better practice overall. I had to do a lot of code refactoring to delete the LS tokens and apply the cookies, but that's my own fault since I didn't do that from the start. Atleast I learned something.

---

### 18.05.2026.

#### Time: 23:25
I protected admin routes on the frontend.

---

#### Time: 23:07
After a long break where I focused on other projects, I finally got back to this one. Today I redesigned most of the blog part and almost finished it. I need to redesign the home page too. After that I need to cover all the edge-cases and test the app. When I'm done with that only hosting will be left.

---

### 06.11.2025.

#### Time: 18:15
Added JWT authentication and authorization. This was the hardest thing I ever did and it took a lot of time and debugging. Creating a token is complex, as well as comparing all the data and sending it back and forth. After this, most of the backend stuff is done. I need to apply the login context to the frontend next.

---

### 03.11.2025.

#### Time: 22:34
I added an edit and delete button to the PostDetail page, which makes it available for each post. When the delete button is clicked, the user is prompted if they are sure, and then the post is deleted. When clicking the Edit button, the user is redirected to a new page where a form is displayed and the user can edit the post from there. After some thinking, I decided that having two separate forms for creating and editing was not a good decision, so I created a PostForm component which was used in both creating and editing posts, depending on the passed parameters. Now, I think most, if not all, functionalities are completed. The only thing left to do is admin authentication and authorization and hiding certain functions and endpoints from regular users.

---

### 31.10.2025.

#### Time: 21:57
So, after a long break where I had to focus on some other stuff, I came back to this project. I got a new laptop, so I had to migrate everything to it. After that, I first adjusted the database, because I didn't like some things that I overlooked earlier. I removed the like function, as I didn't want to bind the like to each user, because I don't want users logging in. I revamped the UI to make it more modern, with a new color palette and some new UI elements. The biggest change was setting up the Blog page where all blog posts are displayed, as well as the individual page for each post. All of the CRUD functionalities are working correctly right now, so the next step will probably be to create a page through which the admin will be able to create posts. After that I will setup the authentication and authorization.

---

### 05.05.2025.

#### Time: 22:15
I changed the RequestMapping from `/api` to `/blog` as it makes more sense and follows RESTful naming conventions.

---

#### Time: 22:00
I finished the endpoints, I also added the like counter which I previously forgot. First I had to manually insert the new column into the table.

```sql
ALTER TABLE blog_post ADD COLUMN likes INT NOT NULL DEFAULT 0;
```

After that I had to update the BlogPost entity as well as the service. All that was left was to create a simple `/like` endpoint to update the given post. Now I will move on to the authentication.

---

#### Time: 21:33
So I realized that adding authentication so early was a huge mistake, but at least I learned something. I also learned that JWT is very hard to implement. I am temporarily removing the authentication, so I can ensure that the endpoint operations are working well and also have quality error handling.

---

#### Time: 01:29
Added JWT Authentication. It is the best option, given that I need to stay logged in for prolonged periods of time. Basic auth would not work, so session-based is the way.

---

### 04.05.2025.
I finished the entire home page. Everything is done and very smooth. I have to add responsiveness but I will do that for the whole app once I finish everything. Now I will move onto the backend, where I will create a REST API to handle all of the requests.

---

### 27.04.2025.
I started off by creating the home page in React. I created routing using react-router. I used many components, most notably the NavBar because it will be reused in other pages. Another interesting component is the animated Slider.
