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
        const token = localStorage.getItem("token");

        if (!token) {
            alert("You must be logged in to edit a post!");
            navigate("/auth/login");
            return;
        }
        try {
            const response = await axios.put(
                `http://localhost:8080/blog/admin/posts/${id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`, // <-- Add this
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
                localStorage.removeItem("token");
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
