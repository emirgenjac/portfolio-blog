import React from "react";
import "../styles/PostForm.css";
import axios from "axios";
import PostForm from "../components/PostForm";
import { useNavigate } from "react-router-dom";
import "../styles/CreatePost.css"

function CreatePost() {
    const navigate = useNavigate();

    const handleCreate = async (formData) => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("You must be logged in to create a post!")
            navigate("/auth/login");
            return;
        }

        try {
            const response = await axios.post("http://localhost:8080/blog/admin/posts",
                formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
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
                localStorage.removeItem("token");
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