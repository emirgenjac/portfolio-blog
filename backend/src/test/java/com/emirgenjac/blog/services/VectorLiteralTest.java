package com.emirgenjac.blog.services;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class VectorLiteralTest {

    @Test
    void formatsPgVectorLiteral() {
        assertEquals("[0.1,0.2,-0.3]", VectorLiteral.toPgVector(new float[]{0.1f, 0.2f, -0.3f}));
    }
}
