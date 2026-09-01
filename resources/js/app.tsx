import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

const pages = import.meta.glob<{ default: ComponentType }>('./pages/**/*.tsx');

createInertiaApp({
    title: (title) => (title ? `${title} — PA Line` : 'PA Line'),
    resolve: async (name) => {
        const loadPage = pages[`./pages/${name}.tsx`];

        if (! loadPage) {
            throw new Error(`Page not found: ${name}`);
        }

        return (await loadPage()).default;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: { color: '#c47a3a' },
});
