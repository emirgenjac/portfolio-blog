package com.emirgenjac.blog.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class EmbeddingSecretsGuardTest {

    @Value("${app.embeddings.api-key:}")
    private String testApiKey;

    @Test
    void testProfileDoesNotConfigureEmbeddingApiKey() {
        assertTrue(testApiKey == null || testApiKey.isBlank());
    }

    @Test
    void committedEnvExamplesOnlyHavePlaceholders() throws Exception {
        Path root = projectRoot();
        assertPlaceholderOnly(root.resolve(".env.example"), "EMBEDDING_API_KEY");
        assertPlaceholderOnly(root.resolve("backend").resolve(".env.example"), "EMBEDDING_API_KEY");
    }

    private static Path projectRoot() {
        Path cwd = Path.of("").toAbsolutePath().normalize();
        if (Files.exists(cwd.resolve("AGENTS.md"))) {
            return cwd;
        }
        Path parent = cwd.getParent();
        if (parent != null && Files.exists(parent.resolve("AGENTS.md"))) {
            return parent;
        }
        throw new AssertionError("Could not locate project root from " + cwd);
    }

    private static void assertPlaceholderOnly(Path path, String key) throws Exception {
        assertTrue(Files.exists(path), "Missing " + path);

        List<String> lines = Files.readAllLines(path);
        String value = lines.stream()
                .map(String::strip)
                .filter(line -> line.startsWith(key + "="))
                .map(line -> line.substring((key + "=").length()).strip())
                .findFirst()
                .orElseThrow(() -> new AssertionError(key + " missing in " + path));

        String lower = value.toLowerCase(Locale.ROOT);
        assertFalse(looksLikeRealSecret(lower), path + " must not commit a real " + key);
        assertTrue(
                value.isEmpty()
                        || lower.contains("your-")
                        || lower.contains("change-me")
                        || lower.contains("placeholder"),
                path + " should use an empty or placeholder " + key
        );
    }

    private static boolean looksLikeRealSecret(String value) {
        if (value.isEmpty()) {
            return false;
        }
        if (value.contains("your-") || value.contains("change-me") || value.contains("placeholder")) {
            return false;
        }
        return value.length() >= 24 && value.chars().noneMatch(Character::isWhitespace);
    }
}
