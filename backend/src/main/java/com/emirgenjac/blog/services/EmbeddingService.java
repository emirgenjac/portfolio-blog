package com.emirgenjac.blog.services;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.ClientHttpRequestFactories;
import org.springframework.boot.web.client.ClientHttpRequestFactorySettings;
import org.springframework.http.MediaType;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class EmbeddingService implements EmbeddingClient {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);

    private final boolean enabled;
    private final String apiKey;
    private final String model;
    private final int dimensions;
    private final RestClient restClient;

    public EmbeddingService(
            @Value("${app.embeddings.enabled:true}") boolean enabled,
            @Value("${app.embeddings.api-key:}") String apiKey,
            @Value("${app.embeddings.base-url:https://generativelanguage.googleapis.com/v1beta}") String baseUrl,
            @Value("${app.embeddings.model:gemini-embedding-001}") String model,
            @Value("${app.embeddings.dimensions:768}") int dimensions,
            @Value("${app.embeddings.timeout-ms:4000}") long timeoutMs) {
        this.enabled = enabled;
        this.apiKey = apiKey == null ? "" : apiKey.strip();
        this.model = model;
        this.dimensions = dimensions;
        ClientHttpRequestFactory requestFactory = ClientHttpRequestFactories.get(
                ClientHttpRequestFactorySettings.DEFAULTS
                        .withConnectTimeout(Duration.ofMillis(timeoutMs))
                        .withReadTimeout(Duration.ofMillis(timeoutMs))
        );
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
    }

    @Override
    public boolean isAvailable() {
        return enabled && !apiKey.isBlank();
    }

    @Override
    public Optional<float[]> embedDocument(String text) {
        return embed(text, "RETRIEVAL_DOCUMENT");
    }

    @Override
    public Optional<float[]> embedQuery(String text) {
        return embed(text, "RETRIEVAL_QUERY");
    }

    private Optional<float[]> embed(String text, String taskType) {
        if (!isAvailable()) {
            return Optional.empty();
        }
        if (text == null || text.isBlank()) {
            return Optional.empty();
        }

        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", "models/" + model);
            body.put("taskType", taskType);
            body.put("outputDimensionality", dimensions);
            body.put("content", Map.of("parts", List.of(Map.of("text", text))));

            EmbedContentResponse response = restClient.post()
                    .uri("/models/{model}:embedContent?key={key}", model, apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(EmbedContentResponse.class);

            if (response == null || response.embedding() == null || response.embedding().values() == null) {
                return Optional.empty();
            }
            List<Double> values = response.embedding().values();
            if (values.isEmpty()) {
                return Optional.empty();
            }
            float[] vector = new float[values.size()];
            for (int i = 0; i < values.size(); i++) {
                vector[i] = values.get(i).floatValue();
            }
            return Optional.of(vector);
        } catch (Exception ex) {
            log.warn("Embedding request failed; falling back without vectors: {}", ex.toString());
            return Optional.empty();
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record EmbedContentResponse(ContentEmbedding embedding) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ContentEmbedding(@JsonProperty("values") List<Double> values) {
    }
}
