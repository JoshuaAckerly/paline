import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    let server;
    if (env.VITE_SERVER_ENV === 'production') {
        server = {
            port: 443,
            host: '0.0.0.0',
            origin: 'https://paline.graveyardjokes.com',
            allowedHosts: ['paline.graveyardjokes.com', 'palineofficial.com'],
        };
    } else {
        server = {
            port: 8090,
            host: '0.0.0.0',
            origin: 'http://127.0.0.1:8090',
            cors: { origin: 'http://127.0.0.1:8091' },
            allowedHosts: ['localhost', '127.0.0.1', 'paline.test'],
        };
    }

    return {
        server,
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                refresh: true,
            }),
            react(),
            tailwindcss(),
        ],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'resources/js'),
            },
        },
    };
});
