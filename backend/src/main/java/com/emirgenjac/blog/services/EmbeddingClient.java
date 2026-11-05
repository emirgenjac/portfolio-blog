package com.emirgenjac.blog.services;

import java.util.Optional;

public interface EmbeddingClient {

    boolean isAvailable();

    Optional<float[]> embedDocument(String text);

    Optional<float[]> embedQuery(String text);
}
