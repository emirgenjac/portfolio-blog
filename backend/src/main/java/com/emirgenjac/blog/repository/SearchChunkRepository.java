package com.emirgenjac.blog.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SearchChunkRepository {

    private final JdbcTemplate jdbcTemplate;

    public SearchChunkRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void deleteByBlogPostId(int blogPostId) {
        jdbcTemplate.update(
                "DELETE FROM search_chunk WHERE blog_post_id = ?",
                blogPostId
        );
    }

    public void insertChunks(int blogPostId, List<String> chunks) {
        for (int i = 0; i < chunks.size(); i++) {
            jdbcTemplate.update(
                    """
                    INSERT INTO search_chunk (blog_post_id, chunk_index, content)
                    VALUES (?, ?, ?)
                    """,
                    blogPostId,
                    i,
                    chunks.get(i)
            );
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
