import {useNavigate, useParams, Link} from 'react-router-dom';
import React, { useEffect, useState, useRef, useContext } from 'react';
import API from '../api/axios';
import AuthorImage from "../assets/eeeeee.png";
import GitHub from "../assets/github.svg"
import LinkedIn from "../assets/linkedin-svgrepo-com (1).svg"
import BackArrow from "../assets/arrow-left.svg"
import '../styles/PostDetail.css';
import { AuthContext } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import ApiLoading from '../components/ApiLoading';
import { useDocumentMeta } from '../seo/useDocumentMeta';
import { DEFAULT_DESCRIPTION, pageTitle } from '../seo/site';

function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [shareOpen, setShareOpen] = useState(false);
    const [copyLabel, setCopyLabel] = useState("Copy link");
    const shareRef = useRef(null);
    const { isAuthenticated } = useContext(AuthContext);
    const { showAlert, showConfirm } = useModal();
    useDocumentMeta({
        title: post ? pageTitle(post.title) : pageTitle('Post'),
        description: post?.tagline || DEFAULT_DESCRIPTION,
        path: `/blog/${id}`,
        image: post?.coverImageUrl,
        type: 'article',
    });

    const goToEdit = () => {
        navigate(`/blog/admin/posts/${id}/edit`);
    };

    const requestDelete = async () => {
        const confirmed = await showConfirm({
            title: "Delete post?",
            message: "Are you sure you want to delete this post? This cannot be undone.",
            confirmLabel: "Yes, delete",
            cancelLabel: "Cancel",
            variant: "danger",
        });
        if (!confirmed) return;

        try {
            const response = await API.delete(`/blog/admin/posts/${id}`);

            if (response.status === 200 || response.status === 204) {
                await showAlert({
                    title: "Post deleted",
                    message: "The post was deleted successfully.",
                    variant: "success",
                });
                navigate("/blog");
            }
        } catch (err) {
            console.error("Error deleting post:", err);

            if (err.response?.status === 401 || err.response?.status === 403) {
                await showAlert({
                    title: "Session expired",
                    message: "Please log in again.",
                    variant: "error",
                });
                navigate("/auth/login");
            } else {
                await showAlert({
                    title: "Delete failed",
                    message: "Failed to delete post",
                    variant: "error",
                });
            }
        }
    };

    const getPostUrl = () => window.location.href;

    const handleCopyLink = async () => {
        const url = getPostUrl();
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                const input = document.createElement("input");
                input.value = url;
                document.body.appendChild(input);
                input.select();
                document.execCommand("copy");
                document.body.removeChild(input);
            }
            setCopyLabel("Copied!");
            setTimeout(() => setCopyLabel("Copy link"), 1800);
        } catch (err) {
            console.error("Copy failed:", err);
            setCopyLabel("Copy failed");
            setTimeout(() => setCopyLabel("Copy link"), 1800);
        }
    };

    const handleShareLinkedIn = () => {
        const url = encodeURIComponent(getPostUrl());
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            "_blank",
            "noopener,noreferrer"
        );
        setShareOpen(false);
    };

    useEffect(() => {
        setPost(null);
        setError(null);
        API
            .get(`/blog/${id}`)
            .then(res => setPost(res.data))
            .catch(err => {
                console.error(err);
                setError('Could not fetch post. The server may be waking up — wait a moment and refresh.');
            });
    }, [id]);

    useEffect(() => {
        if (!shareOpen) return;

        const onPointerDown = (e) => {
            if (shareRef.current && !shareRef.current.contains(e.target)) {
                setShareOpen(false);
            }
        };

        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [shareOpen]);

    if (error) return <p>{error}</p>;
    if (!post) return <ApiLoading />;

    return (<>
            <div className="back-btn" onClick={() => navigate(`/blog`)}>
                <img src={BackArrow} alt=""/>
                <p>Back</p>
            </div>
            <div className="post-detail">
            <img src={post.coverImageUrl} alt={post.title || 'Cover'} className="post-cover-image" />
            <h1 className={"post-title"}>{post.title}</h1>
                <hr className={"line"}/>
            {/* React text children escape HTML — never use dangerouslySetInnerHTML for post body */}
            <p className={"post-content"}>{post.content}</p>
                {isAuthenticated && <div className={"actions"}>
                    <button id={"editBtn"} onClick={goToEdit}>EDIT</button>
                    <button id={"deleteBtn"} onClick={requestDelete}>DELETE</button>
                </div> }

                <div className={"post-metadata-details"}>
                <div className={"author-data-details"}>
                    <img src={AuthorImage} className={"author-image"} alt="Emir Genjac"/>
                    <div className="author-meta">
                        <p className={"author-name"}>Emir Genjac</p>
                        {post.createdAt && (
                            <time className="post-created-at" dateTime={post.createdAt}>
                                {new Date(post.createdAt).toLocaleString(undefined, {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                })}
                            </time>
                        )}
                    </div>
                    <div className={"svgs-container"}>
                        <div className="share-menu" ref={shareRef}>
                            <button
                                type="button"
                                className={`share-btn${shareOpen ? " share-btn--open" : ""}`}
                                aria-expanded={shareOpen}
                                aria-haspopup="menu"
                                onClick={() => setShareOpen((open) => !open)}
                            >
                                Share
                            </button>
                            {shareOpen && (
                                <div className="share-dropdown" role="menu">
                                    <button type="button" role="menuitem" onClick={handleCopyLink}>
                                        {copyLabel}
                                    </button>
                                    <button type="button" role="menuitem" onClick={handleShareLinkedIn}>
                                        LinkedIn
                                    </button>
                                </div>
                            )}
                        </div>
                        <Link to={"https://github.com/emirgenjac"} target="_blank" rel="noopener noreferrer"><img className={"svgs"} src={GitHub} alt="GitHub"/></Link>
                        <Link to={"https://www.linkedin.com/in/emirgenjac"} target="_blank" rel="noopener noreferrer"><img className={"svgs"} src={LinkedIn} alt="LinkedIn"/></Link>
                    </div>
                </div>

            </div>
        </div>
        </>
    );
}

export default PostDetail;
