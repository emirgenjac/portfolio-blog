package com.emirgenjac.blog.services;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class VectorLiteralTest {

    @Test
    void formatsPgVectorLiteral() {
        assertEquals("[0.1,0.2,-0.3]", VectorLiteral.toPgVector(new float[]{0.1f, 0.2f, -0.3f}));
    }

    @Test
    void parseRoundTripAndCosine() {
        float[] original = new float[]{1.0f, 0.0f, 0.0f};
        float[] parsed = VectorLiteral.parse(VectorLiteral.toPgVector(original));
        assertEquals(1.0f, parsed[0]);
        assertEquals(0.0f, parsed[1]);
        assertTrue(VectorLiteral.cosineSimilarity(original, new float[]{0.9f, 0.1f, 0.0f})
                > VectorLiteral.cosineSimilarity(original, new float[]{0.0f, 1.0f, 0.0f}));
    }
}

