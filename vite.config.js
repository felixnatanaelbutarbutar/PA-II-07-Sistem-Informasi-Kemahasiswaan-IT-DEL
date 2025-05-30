import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'], // Corrected to app.jsx
            refresh: true,
        }),
        react(),
    ],
    server: {
        hmr: {
            host: 'localhost',
        },
        host: '0.0.0.0',
        port: 5173,
    },
});
