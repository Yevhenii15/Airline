import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        includeSource: ['src/**/*.{ts,js,vue}'],
    }
});
