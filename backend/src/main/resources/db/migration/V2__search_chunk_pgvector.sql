CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE search_chunk (
    id            BIGSERIAL PRIMARY KEY,
    blog_post_id  INTEGER NOT NULL REFERENCES blog_post (id) ON DELETE CASCADE,
    chunk_index   INTEGER NOT NULL,
    content       TEXT NOT NULL,
    embedding     vector(768),
    CONSTRAINT uq_search_chunk_post_idx UNIQUE (blog_post_id, chunk_index)
);

CREATE INDEX idx_search_chunk_blog_post_id ON search_chunk (blog_post_id);
