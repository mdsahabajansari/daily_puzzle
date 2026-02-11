import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/tests/setup.js'],
        include: ['src/**/*.test.{js,jsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/engine/**', 'src/features/**', 'src/utils/**', 'src/storage/**'],
            exclude: ['src/tests/**', '**/*.d.ts'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
