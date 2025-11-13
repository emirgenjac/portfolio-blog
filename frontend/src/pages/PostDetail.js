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
    const [showModal, setShowModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));



    const goToEdit = () => {
        navigate(`/blog/admin/posts/${id}/edit`);
    };


    const handleDelete = async(e) => {
        try {
            await axios.delete(`http://localhost:8080/blog/admin/posts/${id}`);
            alert("Post successfully deleted!");
            navigate("/blog");
        } catch (error) {
            console.error("Error deleting post", error);
            alert("Error deleting post!")
        }
    }


    useEffect(() => {
        axios
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
            <p className={"post-content"}>{post.content}</p>
                {isLoggedIn && <div className={"actions"}>
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
