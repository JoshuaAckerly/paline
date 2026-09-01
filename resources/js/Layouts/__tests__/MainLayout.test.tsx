import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import MainLayout from '../MainLayout';

const inertia = vi.hoisted(() => ({
    navigationStarted: undefined as (() => void) | undefined,
    unsubscribe: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
        <a href={href} {...props}>{children}</a>
    ),
    router: {
        on: vi.fn((_event: string, callback: () => void) => {
            inertia.navigationStarted = callback;
            return inertia.unsubscribe;
        }),
    },
}));

describe('MainLayout', () => {
    beforeEach(() => {
        inertia.navigationStarted = undefined;
        inertia.unsubscribe.mockClear();
    });

    it('renders desktop and mobile booking links with the static app path', async () => {
        const user = userEvent.setup();
        render(<MainLayout><p>Page content</p></MainLayout>);

        expect(screen.getByRole('link', { name: 'Book PA LINE' })).toHaveAttribute('href', '/booking');

        await user.click(screen.getByRole('button', { name: 'Open menu' }));

        const bookingLinks = screen.getAllByRole('link', { name: 'Book PA LINE' });
        expect(bookingLinks).toHaveLength(2);
        bookingLinks.forEach((link) => expect(link).toHaveAttribute('href', '/booking'));
        expect(screen.getByText('Page content')).toBeInTheDocument();
    });

    it('opens and closes the mobile menu accessibly', async () => {
        const user = userEvent.setup();
        render(<MainLayout><p>Page content</p></MainLayout>);

        const menuButton = screen.getByRole('button', { name: 'Open menu' });
        expect(menuButton).toHaveAttribute('aria-expanded', 'false');

        await user.click(menuButton);

        expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
        expect(document.body).toHaveStyle({ overflow: 'hidden' });

        await user.click(screen.getByRole('button', { name: 'Close menu' }));

        expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
        expect(document.body).not.toHaveStyle({ overflow: 'hidden' });
    });

    it('closes the mobile menu when Inertia navigation starts', async () => {
        const user = userEvent.setup();
        render(<MainLayout><p>Page content</p></MainLayout>);

        await user.click(screen.getByRole('button', { name: 'Open menu' }));
        expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();

        inertia.navigationStarted?.();

        expect(await screen.findByRole('button', { name: 'Open menu' })).toBeInTheDocument();
    });

    it('unsubscribes from navigation and restores scrolling on unmount', async () => {
        const user = userEvent.setup();
        const { unmount } = render(<MainLayout><p>Page content</p></MainLayout>);

        await user.click(screen.getByRole('button', { name: 'Open menu' }));
        unmount();

        expect(inertia.unsubscribe).toHaveBeenCalledOnce();
        expect(document.body).not.toHaveStyle({ overflow: 'hidden' });
    });
});