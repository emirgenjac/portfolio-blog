import {useNavigate, useParams, Link} from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import AuthorImage from "../assets/eeeeee.png";
import GitHub from "../assets/github.svg"
import LinkedIn from "../assets/linkedin-svgrepo-com (1).svg"
import BackArrow from "../assets/arrow-left.svg"
import '../styles/PostDetail.css';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // provjeri putanju

function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const { isAuthenticated } = useContext(AuthContext);


    const goToEdit = () => {
        navigate(`/blog/admin/posts/${id}/edit`);
    };


    const handleDelete = async(e) => {
        try {
            const response = await API.delete(`http://localhost:8080/blog/admin/posts/${id}`);

            if (response.status === 200 || response.status === 204) {
                alert("Post deleted successfully!");
                navigate("/blog");
            }
        } catch (err) {
            console.error("Error deleting post:", err);

            if (err.response?.status === 401 || err.response?.status === 403) {
                alert("Session expired. Please log in again.");
                navigate("/auth/login");
            } else {
                alert("Failed to delete post");
            }
        }
    }


    useEffect(() => {
        API
            .get(`http://localhost:8080/blog/${id}`)
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
                <hr className={"line"}/>
            <p className={"post-content"}>{post.content}</p>
                {isAuthenticated && <div className={"actions"}>
                    <button id={"editBtn"} onClick={goToEdit}>EDIT</button>
                    <button id={"deleteBtn"} onClick={() => setShowModal(true)}>DELETE</button>
                </div> }
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Are you sure you want to delete this post?</h2>
                            <button className={"delete-confirm"} onClick={handleDelete}>Yes, delete</button>
                            <button className={"delete-cancel"} onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                <div className={"post-metadata-details"}>
                <div className={"author-data-details"}>
                    <img src={AuthorImage} className={"author-image"}/>
                    <p className={"author-name"}>Emir Genjac</p>
                    <div className={"svgs-container"}>
                        <Link to={"https://github.com/emirgenjac"} target="_blank"><img className={"svgs"} src={GitHub}/></Link>
                        <Link to={"https://www.linkedin.com/in/emirgenjac"} target="_blank"><img className={"svgs"} src={LinkedIn}/></Link>
                    </div>
                </div>

            </div>
        </div>
        </>
    );
}

export default PostDetail;
