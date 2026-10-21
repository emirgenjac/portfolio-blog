import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import PostForm from "../components/PostForm";
import "../styles/EditPost.css"
import { useModal } from "../context/ModalContext";
import ApiLoading from "../components/ApiLoading";
import { useDocumentMeta } from "../seo/useDocumentMeta";
import { DEFAULT_DESCRIPTION, pageTitle } from "../seo/site";
import { writeCachedPost } from "../api/blogCache";

function EditPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [postData, setPostData] = useState(null);
    const [loadError, setLoadError] = useState("");
    const { showAlert } = useModal();
    useDocumentMeta({
        title: postData ? pageTitle(`Edit: ${postData.title}`) : pageTitle("Edit post"),
        description: DEFAULT_DESCRIPTION,
        path: `/blog/admin/posts/${id}/edit`,
        robots: "noindex, nofollow",
    });

    useEffect(() => {
        setPostData(null);
        setLoadError("");
        API.get(`/blog/${id}`)
            .then(res => setPostData(res.data))
            .catch(err => {
                console.error(err);
                setLoadError("Could not load this post. The server may be waking up — wait a moment and refresh.");
            });
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
                writeCachedPost(response.data);
                await showAlert({
                    title: "Post updated",
                    message: "Your changes were saved successfully.",
                    variant: "success",
                });
                navigate(`/blog/${id}`);
            }
        } catch (err) {
            console.error("Error updating post:", err);

            if (err.response?.status === 401 || err.response?.status === 403) {
                await showAlert({
                    title: "Session expired",
                    message: "Please log in again.",
                    variant: "error",
                });
                navigate("/auth/login");
            } else {
                const serverMessage = err.response?.data?.message;
                await showAlert({
                    title: "Could not update post",
                    message: serverMessage || "Failed to update post",
                    variant: "error",
                });
            }
        }
    };

    if (loadError) return <p>{loadError}</p>;
    if (!postData) return <ApiLoading title="Edit Post" />;

    return (
        <div className="main-container">
            <h1 className={"edit-post-header"}>Edit Post</h1>
            <PostForm initialData={postData} onSubmit={handleUpdate} submitText="Update Post" />
        </div>
    );
}

export default EditPost;
