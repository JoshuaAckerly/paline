import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import Booking from '../booking';

vi.mock('axios');
vi.mock('@/Layouts/MainLayout', () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/Components/PageMeta', () => ({ default: () => null }));

describe('Booking', () => {
    beforeEach(() => vi.mocked(axios.post).mockReset());

    it('offers all four booking entry paths', () => {
        render(<Booking />);

        expect(screen.getByRole('button', { name: /I know my date/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Find the sweet spot/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Get over here/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Back for more/i })).toBeInTheDocument();
    });

    it('checks exact-date availability against the server', async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: { state: 'limited' } });
        const user = userEvent.setup();
        render(<Booking />);

        await user.click(screen.getByRole('button', { name: /I know my date/i }));
        await user.type(screen.getByLabelText('Performance date'), '2026-09-12');
        await user.click(screen.getByRole('button', { name: 'Check availability' }));

        expect(axios.post).toHaveBeenCalledWith('/availability/check', { date: '2026-09-12' });
        expect(await screen.findByRole('status')).toHaveTextContent('limited');
    });

    it('requests a secure returning-booker magic link', async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: {} });
        const user = userEvent.setup();
        render(<Booking />);

        await user.click(screen.getByRole('button', { name: /Back for more/i }));
        await user.type(screen.getByLabelText('Business email'), 'buyer@example.com');
        await user.type(screen.getByLabelText('Venue or organization'), 'Example Hall');
        await user.click(screen.getByRole('button', { name: 'Email secure sign-in link' }));

        expect(axios.post).toHaveBeenCalledWith('/auth/magic-link', {
            email: 'buyer@example.com',
            organization: 'Example Hall',
        });
        expect(await screen.findByRole('status')).toHaveTextContent('one-time sign-in link');
    });

    it('never claims availability when the server check fails', async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: null });
        const user = userEvent.setup();
        render(<Booking />);

        await user.click(screen.getByRole('button', { name: /I know my date/i }));
        await user.type(screen.getByLabelText('Performance date'), '2026-09-12');
        await user.click(screen.getByRole('button', { name: 'Check availability' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('no availability claim');
    });
});