import React, {useState, useEffect} from "react";
import "../styles/PostForm.css";

function PostForm({initialData = {}, onSubmit, submitText}) {
    const [title, setTitle] = useState("");
    const [tagline, setTagline] = useState("");
    const [coverImageUrl, setCoverImageUrl] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (Object.keys(initialData).length > 0) {
            setTitle(initialData.title || "")
            setTagline(initialData.tagline || "")
            setCoverImageUrl(initialData.coverImageUrl || "")
            setContent(initialData.content || "")
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, tagline, coverImageUrl, content })
    }

    return (
        <div className={"main-container"}>
        <form className="container" onSubmit={handleSubmit}>
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />

            <label>Tagline</label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} />

            <label>Cover Image URL</label>
            <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />

            <label>Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} />

            <button className={"submitBtn"} type="submit">{submitText}</button>
        </form>
        </div>
    );

}

export default PostForm;