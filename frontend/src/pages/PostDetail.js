import {useNavigate, useParams} from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AuthorImage from "../assets/eeeeee.png";
import GitHub from "../assets/github.svg"
import LinkedIn from "../assets/linkedin-svgrepo-com (1).svg"
import BackArrow from "../assets/arrow-left.svg"
import '../styles/PostDetail.css';

function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        axios
            .get(`http://localhost:8080/blog/${id}`) // ← direct call
            .then(res => setPost(res.data))
            .catch(err => {
                console.error(err);
                setError('Could not fetch post');
            });
    }, [id]);

    if (error) return <p>{error}</p>;
    if (!post) return <p>Loading...</p>;

    return (<>
            <div className="back-btn" onClick={() => navigate(`/blog`)}>
                <img src={BackArrow}/>
                <p>Back</p>
            </div>
            <div className="post-detail">
            <img src={post.coverImageUrl} alt="Cover" className="post-cover-image" />
            <h1 className={"post-title"}>{post.title}</h1>
            <p className={"post-content"}>{post.content}</p>
            <div className={"post-metadata"}>
                <div className={"author-data"}>
                    <img src={AuthorImage} className={"author-image"}/>
                    <p className={"author-name"}>Emir Genjac</p>
                    <div className={"svgs-container"}>
                        <img className={"svgs"} src={GitHub}/>
                        <img className={"svgs"} src={LinkedIn}/>
                    </div>
                </div>

            </div>
        </div>
        </>
    );
}

export default PostDetail;
