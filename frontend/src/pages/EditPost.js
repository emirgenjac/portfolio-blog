// src/pages/EditPost.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import PostForm from "../components/PostForm";
import "../styles/EditPost.css"

function EditPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [postData, setPostData] = useState(null);

    useEffect(() => {
        API.get(`/blog/${id}`)
            .then(res => setPostData(res.data))
            .catch(err => console.error(err));
    }, [id]);

    const handleUpdate = async (formData) => {
        try {
            const response = await API.put(
                `/blog/admin/posts/${id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                alert("Post updated successfully!");
                navigate(`/blog/${id}`);
            }
        } catch (err) {
            console.error("Error updating post:", err);

            if (err.response?.status === 401 || err.response?.status === 403) {
                alert("Session expired. Please log in again.");
                navigate("/auth/login");
            } else {
                alert("Failed to update post");
            }
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
