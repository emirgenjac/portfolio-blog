import React from "react";
import "../styles/PostForm.css";
import axios from "axios";
import PostForm from "../components/PostForm";
import { useNavigate } from "react-router-dom";
import "../styles/CreatePost.css"

function CreatePost() {
    const navigate = useNavigate();

    const handleCreate = async (formData) => {
        try {
            await axios.post("http://localhost:8080/blog/admin/posts", formData);
            alert("Post created!");
            navigate("/blog");
        } catch (error) {
            console.error(error);
            alert("Unexpected error occurred!");
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