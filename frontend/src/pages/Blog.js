import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Blog.css';
import AuthorImage from '../assets/eeeeee.png';
import {useNavigate} from "react-router-dom";

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8080/blog')
            .then(response => setPosts(response.data))
            .catch(err => {
                console.error(err);
                setError('Could not fetch posts.');
            });
    }, []);

    if (error) return <p>{error}</p>;

    return (<>
            <h1 className={"main-title"}>Blog Posts</h1>
        <div className="posts-container">
            {posts.map(post => (
                <div key={post.id} className="blog_post" key={post.id} onClick={() => navigate(`/blog/${post.id}`)}>
                    <img src={post.coverImageUrl} alt="Cover" className={"post-cover-image"}/>
                    <h2 className={"post-title"}>{post.title}</h2>
                    <hr className={"hr"}/>
                    <p className="post-tagline">{post.tagline}</p>
                    <div className={"post-metadata"}>
                    <div className={"author-data"}>
                        <img src={AuthorImage} className={"author-image"}/>
                        <p>Emir Genjac</p>
                    </div>

                    </div>
                </div>
            ))}
        </div>
        </>
    );
};

export default Blog;