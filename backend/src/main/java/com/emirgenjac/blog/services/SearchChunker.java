package com.emirgenjac.blog.services;

import java.util.ArrayList;
import java.util.List;

final class SearchChunker {

    static final int MIN_CHARS = 300;
    static final int MAX_CHARS = 500;

    private SearchChunker() {
    }

    static List<String> chunkPost(String title, String tagline, String content) {
        String text = buildCorpus(title, tagline, content);
        if (text.isEmpty()) {
            return List.of();
        }
        if (text.length() <= MAX_CHARS) {
            return List.of(text);
        }

        List<String> paragraphs = splitParagraphs(text);
        List<String> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();

        for (String paragraph : paragraphs) {
            if (paragraph.length() > MAX_CHARS) {
                flush(current, chunks);
                chunks.addAll(splitLongBlock(paragraph));
                continue;
            }
            if (current.isEmpty()) {
                current.append(paragraph);
                continue;
            }
            int candidate = current.length() + 2 + paragraph.length();
            if (candidate <= MAX_CHARS) {
                current.append("\n\n").append(paragraph);
            } else if (current.length() < MIN_CHARS && candidate <= MAX_CHARS + 80) {
                current.append("\n\n").append(paragraph);
            } else {
                flush(current, chunks);
                current.append(paragraph);
            }
        }
        flush(current, chunks);
        return List.copyOf(chunks);
    }

    private static String buildCorpus(String title, String tagline, String content) {
        StringBuilder corpus = new StringBuilder();
        appendBlock(corpus, title);
        appendBlock(corpus, tagline);
        appendBlock(corpus, content);
        return corpus.toString().strip();
    }

    private static void appendBlock(StringBuilder corpus, String part) {
        if (part == null) {
            return;
        }
        String trimmed = part.strip();
        if (trimmed.isEmpty()) {
            return;
        }
        if (!corpus.isEmpty()) {
            corpus.append("\n\n");
        }
        corpus.append(trimmed);
    }

    private static List<String> splitParagraphs(String text) {
        String[] raw = text.split("\\R{2,}");
        List<String> paragraphs = new ArrayList<>();
        for (String part : raw) {
            String trimmed = part.strip();
            if (!trimmed.isEmpty()) {
                paragraphs.add(trimmed);
            }
        }
        if (paragraphs.isEmpty()) {
            paragraphs.add(text.strip());
        }
        return paragraphs;
    }

    private static List<String> splitLongBlock(String block) {
        List<String> pieces = new ArrayList<>();
        int start = 0;
        while (start < block.length()) {
            int end = Math.min(block.length(), start + MAX_CHARS);
            if (end < block.length()) {
                int breakAt = Math.max(block.lastIndexOf(' ', end), block.lastIndexOf('\n', end));
                if (breakAt > start + (MIN_CHARS / 2)) {
                    end = breakAt;
                }
            }
            String piece = block.substring(start, end).strip();
            if (!piece.isEmpty()) {
                pieces.add(piece);
            }
            start = end;
            while (start < block.length() && Character.isWhitespace(block.charAt(start))) {
                start++;
            }
        }
        return pieces;
    }

    private static void flush(StringBuilder current, List<String> chunks) {
        if (current.isEmpty()) {
            return;
        }
        chunks.add(current.toString().strip());
        current.setLength(0);
    }
}
