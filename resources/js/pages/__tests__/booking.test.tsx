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
    beforeEach(() => {
        vi.mocked(axios.post).mockReset();
        vi.mocked(axios.patch).mockReset();
    });

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

    it('saves venue event and contact details on an exact-date draft', async () => {
        vi.mocked(axios.post)
            .mockResolvedValueOnce({ data: { state: 'available' } })
            .mockResolvedValueOnce({ data: { id: 'draft-1', draft_token: 'secret', dates: [], routing_status: null } });
        vi.mocked(axios.patch).mockResolvedValue({ data: { status: 'details_saved' } });
        const user = userEvent.setup();
        render(<Booking />);

        await user.click(screen.getByRole('button', { name: /I know my date/i }));
        await user.type(screen.getByLabelText('Performance date'), '2026-10-10');
        await user.click(screen.getByRole('button', { name: 'Check availability' }));
        await user.click(await screen.findByRole('button', { name: 'Start this request' }));

        await user.type(await screen.findByLabelText('Venue name'), 'Town Ballroom');
        await user.type(screen.getByLabelText('Street address'), '681 Main Street');
        await user.type(screen.getByLabelText('City'), 'Buffalo');
        await user.type(screen.getByLabelText('ZIP'), '14203');
        await user.type(screen.getByLabelText('Event name'), 'PA LINE Live');
        await user.type(screen.getByLabelText('Estimated attendance'), '500');
        await user.type(screen.getByLabelText('Contact name'), 'Jamie Buyer');
        await user.type(screen.getByLabelText('Contact email'), 'jamie@example.com');
        await user.click(screen.getByRole('button', { name: 'Save and continue' }));

        expect(axios.patch).toHaveBeenCalledWith('/booking-requests/draft-1', expect.objectContaining({
            draft_token: 'secret',
            selected_date: '2026-10-10',
            venue: expect.objectContaining({ name: 'Town Ballroom', city: 'Buffalo' }),
            event: expect.objectContaining({ name: 'PA LINE Live', estimated_attendance: 500 }),
            contact: expect.objectContaining({ email: 'jamie@example.com' }),
        }));
        expect(await screen.findByRole('status')).toHaveTextContent('Performance options come next');
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