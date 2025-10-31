This is a project I decided to make to showcase my skills.
For a long time now I have been learning react and, more recently, Spring Boot.
This is a portfolio, with an added functionality of a blog.
Users can view the blog posts I create, like and share them.
Only I can create blog posts. 


### 27.04.2025.
I started off by creating the home page in react.
I created routing using react-router. I used many components, most notably the NavBar because it will be reused in other pages.
Another interesting component is the animated Slider.

### 04.05.2025.
I finished the entire home page. Everything is done and very smooth. I have to add responsiveness but I will do that for the whole app once I finish everything.
Now I will move onto the backend. Where I will create a REST API to handle all of the requests.

### 05.05.2025.
#### Time:  01:29:08
Added JWT Authentication. It is the best option, given that I need to stay logged in for prolonged periods of time. Basic auth would not work, so session-based is the way.

### 05.05.2025.
#### Time:  21:33:00
So I realized that adding authentication so early was a huge mistake, but atleast I learned something. I also learned that JWT is very hard to implement.
I am temporarily removing the authentication, so I can ensure that the endpoint operations are working well and also have quality error handling.

### 05.05.2025.
#### Time: 22:00:00
I finished the endpoints, I also added the like counter which I previously forgot. First I had to manually insert the new column into the table.
```sql
ALTER TABLE blog_post ADD COLUMN likes INT NOT NULL DEFAULT 0;
```
After that I had to update the BlogPost entity as well as the service.
All that was left was to create a simple /like endpoint to update the given post.
Now I will move on to the authentication.

### 05.05.2025.
#### Time: 22:15:00
I changed the RequestMapping from /api to /blog as it makes more sense and follows Restful naming conventions.

### 31.10.2025
#### Time: 21:57:00
So, after a long break where I had to focus on some other stuff, I came back to this project.
I got a new laptop, so I had to migrate everything to it.
After that, I first adjusted the database, because I didn't like some things that I overlooked earlier.
I removed the like function, as I didn't want to bind the like to each user, because I don't want users logging in.
I revamped the UI to make it more modern, with a new color palette and some new UI elements.
The biggest change was setting up the Blog page where all blog posts are displayed, as well as the individual page for each post.
All of the CRUD functionalities are working correctly right now, so the next step will probably be to create a page through which the admin will be able to create posts.
After that I will setup the authentication and authorization.
