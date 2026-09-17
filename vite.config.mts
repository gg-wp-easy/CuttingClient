import {fileURLToPath} from 'node:url';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];
export default defineConfig({
    plugins: [react()],
    base: './',
    envPrefix: ['VITE_', 'REACT_APP_'],
    resolve: {alias: Object.fromEntries(layers.map(layer =>
        [layer, fileURLToPath(new URL(`./src/${layer}`, import.meta.url))]))},
    server: {host: 'localhost', port: 3000, strictPort: true},
    build: {outDir: 'build', emptyOutDir: true},
    test: {
        environment: 'jsdom', globals: true, setupFiles: ['./src/setupTests.ts'],
        include: ['src/**/*.test.{ts,tsx}', 'electron/**/*.test.ts'],
        clearMocks: true, restoreMocks: true,
    },
});
