package com.emirgenjac.blog.services;

public final class VectorLiteral {

    private VectorLiteral() {
    }

    public static String toPgVector(float[] values) {
        StringBuilder builder = new StringBuilder(values.length * 8);
        builder.append('[');
        for (int i = 0; i < values.length; i++) {
            if (i > 0) {
                builder.append(',');
            }
            builder.append(values[i]);
        }
        builder.append(']');
        return builder.toString();
    }
}
