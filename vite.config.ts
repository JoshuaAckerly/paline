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
            origin: 'https://palineofficial.com',
            allowedHosts: ['palineofficial.com', 'paline.graveyardjokes.com'],
        };
    } else {
        // Local/dev: the app is reached via nginx at http://paline.graveyardjokes.test,
        // but Vite assets are served directly by the dev server on port 8090, so the
        // browser must reach it at the VM's accessible host. Override with VITE_HOST / VITE_ORIGIN if needed.
        const devHost = env.VITE_HOST || '10.0.1.20';
        const devPort = Number(env.VITE_PORT || 8090);
        const devOrigin = env.VITE_ORIGIN || `http://${devHost}:${devPort}`;
        server = {
            port: devPort,
            host: '0.0.0.0',
            origin: devOrigin,
            hmr: { host: devHost },
            cors: {
                origin: [
                    'http://paline.graveyardjokes.test',
                    `http://${devHost}`,
                    `http://${devHost}:8092`,
                    'http://localhost:8092',
                    'http://127.0.0.1:8092',
                ],
                credentials: true,
            },
            allowedHosts: ['localhost', '127.0.0.1', devHost, 'paline.graveyardjokes.test'],
        };
    }

    return {
        server,
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                ssr: 'resources/js/ssr.tsx',
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
        ssr: {
            noExternal: ['react', 'react-dom', '@inertiajs/react', '@inertiajs/core', 'framer-motion'],
        },
    };
});
