package com.emirgenjac.blog.repository;

import com.emirgenjac.blog.services.VectorLiteral;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SearchChunkRepository {

    private final JdbcTemplate jdbcTemplate;
    private final boolean pgvector;

    public SearchChunkRepository(
            JdbcTemplate jdbcTemplate,
            @Value("${app.embeddings.pgvector:true}") boolean pgvector) {
        this.jdbcTemplate = jdbcTemplate;
        this.pgvector = pgvector;
    }

    public void deleteByBlogPostId(int blogPostId) {
        jdbcTemplate.update(
                "DELETE FROM search_chunk WHERE blog_post_id = ?",
                blogPostId
        );
    }

    public void insertChunk(int blogPostId, int chunkIndex, String content, float[] embedding) {
        if (embedding == null) {
            jdbcTemplate.update(
                    """
                    INSERT INTO search_chunk (blog_post_id, chunk_index, content)
                    VALUES (?, ?, ?)
                    """,
                    blogPostId,
                    chunkIndex,
                    content
            );
            return;
        }

        String literal = VectorLiteral.toPgVector(embedding);
        if (pgvector) {
            jdbcTemplate.update(
                    """
                    INSERT INTO search_chunk (blog_post_id, chunk_index, content, embedding)
                    VALUES (?, ?, ?, CAST(? AS vector))
                    """,
                    blogPostId,
                    chunkIndex,
                    content,
                    literal
            );
        } else {
            jdbcTemplate.update(
                    """
                    INSERT INTO search_chunk (blog_post_id, chunk_index, content, embedding)
                    VALUES (?, ?, ?, ?)
                    """,
                    blogPostId,
                    chunkIndex,
                    content,
                    literal
            );
        }
    }

    public void insertChunks(int blogPostId, List<String> chunks) {
        for (int i = 0; i < chunks.size(); i++) {
            insertChunk(blogPostId, i, chunks.get(i), null);
        }
    }

    public int countByBlogPostId(int blogPostId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM search_chunk WHERE blog_post_id = ?",
                Integer.class,
                blogPostId
        );
        return count == null ? 0 : count;
    }

    public int countEmbeddedByBlogPostId(int blogPostId) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*) FROM search_chunk
                WHERE blog_post_id = ? AND embedding IS NOT NULL
                """,
                Integer.class,
                blogPostId
        );
        return count == null ? 0 : count;
    }

    public List<String> findContentsByBlogPostId(int blogPostId) {
        return jdbcTemplate.query(
                """
                SELECT content FROM search_chunk
                WHERE blog_post_id = ?
                ORDER BY chunk_index ASC
                """,
                (rs, rowNum) -> rs.getString("content"),
                blogPostId
        );
    }
}
