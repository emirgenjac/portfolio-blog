package com.emirgenjac.blog.services;

import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.SearchChunkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SearchIndexService {

    private final SearchChunkRepository searchChunkRepository;
    private final EmbeddingService embeddingService;

    public SearchIndexService(
            SearchChunkRepository searchChunkRepository,
            EmbeddingService embeddingService) {
        this.searchChunkRepository = searchChunkRepository;
        this.embeddingService = embeddingService;
    }

    @Transactional
    public void reindex(BlogPost post) {
        if (post == null || post.getId() == 0) {
            return;
        }
        List<String> chunks = SearchChunker.chunkPost(post.getTitle(), post.getTagline(), post.getContent());
        searchChunkRepository.deleteByBlogPostId(post.getId());
        for (int i = 0; i < chunks.size(); i++) {
            String chunk = chunks.get(i);
            float[] embedding = embeddingService.embedDocument(chunk).orElse(null);
            searchChunkRepository.insertChunk(post.getId(), i, chunk, embedding);
        }
    }

    @Transactional
    public void remove(int blogPostId) {
        searchChunkRepository.deleteByBlogPostId(blogPostId);
    }
}
