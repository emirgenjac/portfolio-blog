// src/pages/EditPost.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PostForm from "../components/PostForm";
import "../styles/EditPost.css"

function EditPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [postData, setPostData] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:8080/blog/${id}`)
            .then(res => setPostData(res.data))
            .catch(err => console.error(err));
    }, [id]);

    const handleUpdate = async (formData) => {
        try {
            await axios.put(`http://localhost:8080/blog/admin/posts/${id}`, formData);
            alert("Post updated successfully!");
            navigate(`/blog/${id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to update post");
        }
    };

    // Wait for post data to load
    if (!postData) return <p>Loading...</p>;

    return (
        <div className="main-container">
            <h1 className={"edit-post-header"}>Edit Post</h1>
            <PostForm initialData={postData} onSubmit={handleUpdate} submitText="Update Post" />
        </div>
    );
}

export default EditPost;
