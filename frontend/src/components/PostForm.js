import React, {useState, useEffect} from "react";
import "../styles/PostForm.css";

function PostForm({initialData = {}, onSubmit, submitText}) {
    const [title, setTitle] = useState("");
    const [tagline, setTagline] = useState("");
    const [coverImageUrl, setCoverImageUrl] = useState("");
    const [content, setContent] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (Object.keys(initialData).length > 0) {
            setTitle(initialData.title || "")
            setTagline(initialData.tagline || "")
            setCoverImageUrl(initialData.coverImageUrl || "")
            setContent(initialData.content || "")
        }
    }, [initialData]);

    const validate = () => {
        const nextErrors = {};

        if (!title.trim()) nextErrors.title = "Title is required.";
        if (!tagline.trim()) nextErrors.tagline = "Tagline is required.";
        if (!coverImageUrl.trim()) nextErrors.coverImageUrl = "Cover image URL is required.";
        if (!content.trim()) nextErrors.content = "Content is required.";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;


        onSubmit({ title, tagline, coverImageUrl, content })
    }

    return (
  <div className={"postform-card"}>
    <form className="postform-container" onSubmit={handleSubmit} noValidate>
      <label>Title</label>
      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
        }}
      />
      {errors.title && <p className="field-error">{errors.title}</p>}

      <label>Tagline</label>
      <input
        value={tagline}
        onChange={(e) => {
          setTagline(e.target.value);
          if (errors.tagline) setErrors((prev) => ({ ...prev, tagline: "" }));
        }}
      />
      {errors.tagline && <p className="field-error">{errors.tagline}</p>}

      <label>Cover Image URL</label>
      <input
        value={coverImageUrl}
        onChange={(e) => {
          setCoverImageUrl(e.target.value);
          if (errors.coverImageUrl) setErrors((prev) => ({ ...prev, coverImageUrl: "" }));
        }}
      />
      {errors.coverImageUrl && <p className="field-error">{errors.coverImageUrl}</p>}

      <label>Content</label>
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (errors.content) setErrors((prev) => ({ ...prev, content: "" }));
        }}
      />
      {errors.content && <p className="field-error">{errors.content}</p>}

      <button className={"submitBtn"} type="submit">
        {submitText}
      </button>
    </form>
  </div>
);

}

export default PostForm;