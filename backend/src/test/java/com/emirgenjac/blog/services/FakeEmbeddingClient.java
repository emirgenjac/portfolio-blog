package com.emirgenjac.blog.services;

import java.util.Optional;
import java.util.function.Function;

final class FakeEmbeddingClient implements EmbeddingClient {

    private Function<String, Optional<float[]>> documentFn = text -> Optional.empty();
    private Function<String, Optional<float[]>> queryFn = text -> Optional.empty();

    void setDocumentFn(Function<String, Optional<float[]>> documentFn) {
        this.documentFn = documentFn;
    }

    void setQueryFn(Function<String, Optional<float[]>> queryFn) {
        this.queryFn = queryFn;
    }

    void reset() {
        documentFn = text -> Optional.empty();
        queryFn = text -> Optional.empty();
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public Optional<float[]> embedDocument(String text) {
        return documentFn.apply(text);
    }

    @Override
    public Optional<float[]> embedQuery(String text) {
        return queryFn.apply(text);
    }
}
