import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import '../styles/Blog.css';
import AuthorImage from '../assets/eeeeee.png';
import {useNavigate} from "react-router-dom";
import ApiLoading from '../components/ApiLoading';
import { useDocumentMeta } from '../seo/useDocumentMeta';
import { DEFAULT_DESCRIPTION, pageTitle } from '../seo/site';
import { readCachedPosts, writeCachedPosts } from '../api/blogCache';

const Blog = () => {
    const cachedPosts = readCachedPosts();
    const [posts, setPosts] = useState(cachedPosts || []);
    const [loading, setLoading] = useState(!cachedPosts);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    useDocumentMeta({
        title: pageTitle('Blog'),
        description: DEFAULT_DESCRIPTION,
        path: '/blog',
    });

    useEffect(() => {
        API.get('/blog')
            .then(response => {
                const next = Array.isArray(response.data) ? response.data : [];
                writeCachedPosts(next);
                setPosts(next);
                setError('');
            })
            .catch(err => {
                console.error(err);
                if (!readCachedPosts()) {
                    setError('Could not fetch posts. The server may be waking up - wait a moment and refresh.');
                }
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <ApiLoading title="Blog Posts" />;
    if (error) {
        return (
            <>
                <h1 className="main-title">Blog Posts</h1>
                <p>{error}</p>
            </>
        );
    }
    if (posts.length === 0) {
        return (
            <>
                <h1 className="main-title">Blog Posts</h1>
                <p>No posts yet.</p>
            </>
        );
    }

    return (<>
            <h1 className={"main-title"}>Blog Posts</h1>
        <div className="posts-container">
            {posts.map(post => (
                <div key={post.id} className="blog_post" onClick={() => navigate(`/blog/${post.id}`)}>
                    <img src={post.coverImageUrl} alt={post.title || 'Cover'} className={"post-cover-image"} loading="lazy" decoding="async"/>
                    <h2 className={"post-title"}>{post.title}</h2>
                    <hr className={"hr"}/>
                    <p className="post-tagline">{post.tagline}</p>
                    <div className={"post-metadata"}>
                    <div className={"author-data"}>
                        <img src={AuthorImage} alt="Emir Genjac" className={"author-image"}/>
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