import React from "react";
import "../styles/PostForm.css";
import API from "../api/axios";
import PostForm from "../components/PostForm";
import { useNavigate } from "react-router-dom";
import "../styles/CreatePost.css"

function CreatePost() {
    const navigate = useNavigate();

    const handleCreate = async (formData) => {
        try {
            const response = await API.post("/blog/admin/posts",
                formData, {
                headers: {
                    "Content-Type": "application/json"
                },
                }
                );
                if (response.status === 200 || response.status === 201) {
                    alert("Post Created!");
                    navigate("/blog");
                }
        } catch (error) {
            console.error("Error creating post " , error);

            if (error.response?.status === 401 || error.response?.status === 403) {
                alert("Session expired. Please log in again.");
                navigate("/auth/login");
            } else {
                alert("Unexpected error occurred!");
            }
        }
    };

    return (
        <div className="main-container">
            <h1 className={"create-post-header"}>Create New Post</h1>
            <PostForm onSubmit={handleCreate} submitText="Create Post" />
        </div>
    );
}

export default CreatePost;