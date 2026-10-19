import React from "react";
import "../styles/PostForm.css";
import API from "../api/axios";
import PostForm from "../components/PostForm";
import { useNavigate } from "react-router-dom";
import "../styles/CreatePost.css"
import { useModal } from "../context/ModalContext";

function CreatePost() {
    const navigate = useNavigate();
    const { showAlert } = useModal();

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
                    await showAlert({
                        title: "Post created",
                        message: "Your post was published successfully.",
                        variant: "success",
                    });
                    navigate("/blog");
                }
        } catch (error) {
            console.error("Error creating post " , error);

            if (error.response?.status === 401 || error.response?.status === 403) {
                await showAlert({
                    title: "Session expired",
                    message: "Please log in again.",
                    variant: "error",
                });
                navigate("/auth/login");
            } else {
                const serverMessage = error.response?.data?.message;
                await showAlert({
                    title: "Could not create post",
                    message: serverMessage || "Unexpected error occurred!",
                    variant: "error",
                });
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
