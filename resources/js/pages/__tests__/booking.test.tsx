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

    it('creates a flexible draft from a location and date window', async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: { routing_status: 'verification_pending', dates: [{ id: 'date-1', date: '2026-10-10', state: 'available' }] } });
        const user = userEvent.setup();
        render(<Booking />);

        await user.click(screen.getByRole('button', { name: /Find the sweet spot/i }));
        await user.type(screen.getByLabelText('City'), 'Buffalo');
        await user.type(screen.getByLabelText('Window starts'), '2026-10-10');
        await user.type(screen.getByLabelText('Window ends'), '2026-10-13');
        await user.click(screen.getByRole('button', { name: 'Find date options' }));

        expect(axios.post).toHaveBeenCalledWith('/booking-requests', {
            source_path: 'flexible', city: 'Buffalo', state: 'NY',
            window_starts_on: '2026-10-10', window_ends_on: '2026-10-13',
        });
        expect(await screen.findByRole('status')).toHaveTextContent('2026-10-10');
        expect(screen.getByRole('status')).toHaveTextContent('Route ranking remains pending');
    });

    it('records a demand signal without claiming a booking', async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: { status: 'recorded' } });
        const user = userEvent.setup();
        render(<Booking />);

        await user.click(screen.getByRole('button', { name: /Get over here/i }));
        await user.type(screen.getByLabelText('City'), 'Buffalo');
        await user.type(screen.getByLabelText('Venue idea (optional)'), 'Town Ballroom');
        await user.selectOptions(screen.getByLabelText('Likely attendees'), '8');
        await user.selectOptions(screen.getByLabelText('Your local role'), 'connector');
        await user.type(screen.getByLabelText('Your name'), 'Jamie Fan');
        await user.type(screen.getByLabelText('Email'), 'jamie@example.com');
        await user.click(screen.getByRole('checkbox', { name: /Keep me updated/i }));
        await user.click(screen.getByRole('button', { name: 'Create demand' }));

        expect(axios.post).toHaveBeenCalledWith('/demand', expect.objectContaining({
            city: 'Buffalo', state: 'NY', preferred_venue: 'Town Ballroom',
            estimated_attendees: 8, local_role: 'connector', consent_to_updates: true,
        }));
        expect(await screen.findByRole('status')).toHaveTextContent('not a booking confirmation');
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