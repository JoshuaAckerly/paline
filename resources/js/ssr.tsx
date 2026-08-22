import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { type RouteName, route } from 'ziggy-js';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer(
    (page) =>
        createInertiaApp({
            page,
            render: ReactDOMServer.renderToString,
            title: (title) => (title ? `${title} - ${appName}` : appName),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob<any>('./pages/**/*.tsx')),
            setup: ({ App, props }) => {
                /* eslint-disable */
                // @ts-expect-error
                global.route<RouteName> = (name, params, absolute) =>
                    route(name, params as any, absolute, {
                        // @ts-expect-error
                        ...page.props.ziggy,
                        // @ts-expect-error
                        location: new URL(page.props.ziggy.location),
                    });
                /* eslint-enable */

                return <App {...props} />;
            },
        }),
    13722, // paline SSR port
);
