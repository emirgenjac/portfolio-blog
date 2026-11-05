package com.emirgenjac.blog.services;

import com.emirgenjac.blog.entity.BlogPost;
import com.emirgenjac.blog.repository.SearchChunkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SearchIndexService {

    private final SearchChunkRepository searchChunkRepository;

    public SearchIndexService(SearchChunkRepository searchChunkRepository) {
        this.searchChunkRepository = searchChunkRepository;
    }

    @Transactional
    public void reindex(BlogPost post) {
        if (post == null || post.getId() == 0) {
            return;
        }
        List<String> chunks = SearchChunker.chunkPost(post.getTitle(), post.getTagline(), post.getContent());
        searchChunkRepository.deleteByBlogPostId(post.getId());
        searchChunkRepository.insertChunks(post.getId(), chunks);
    }

    @Transactional
    public void remove(int blogPostId) {
        searchChunkRepository.deleteByBlogPostId(blogPostId);
    }
}
