import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { ActiveDraft, RejectedDate, RequestState, ReviewedDate } from './shared';
import { FlowHeader, SelectField, TextField } from './shared';

export function RecurringDatesPanel({ draft, onContinue }: { draft: ActiveDraft; onContinue: () => void }) {
    const [bookingType, setBookingType] = useState('repeat');
    const [mode, setMode] = useState('specific');
    const [specificDate, setSpecificDate] = useState('');
    const [frequency, setFrequency] = useState('weekly');
    const [count, setCount] = useState('3');
    const primaryCandidate = draft.dates.find((date) => date.date === draft.selectedDate);
    const [dates, setDates] = useState<ReviewedDate[]>([{ id: primaryCandidate?.id ?? '', date: draft.selectedDate, state: primaryCandidate?.state ?? 'available', primary: true }]);
    const [rejected, setRejected] = useState<RejectedDate[]>([]);
    const [requestState, setRequestState] = useState<RequestState>('idle');

    const reviewDates = async (event: FormEvent) => {
        event.preventDefault();
        setRequestState('loading');
        setRejected([]);
        try {
            const response = await axios.post<{ accepted: ReviewedDate[]; rejected: RejectedDate[] }>(`/booking-requests/${draft.id}/dates`, {
                draft_token: draft.draft_token,
                booking_type: bookingType,
                mode,
                dates: mode === 'specific' ? [specificDate] : undefined,
                frequency: mode === 'recurring' ? frequency : undefined,
                count: mode === 'recurring' ? Number(count) : undefined,
            });
            setDates(response.data.accepted);
            setRejected(response.data.rejected);
            setSpecificDate('');
            setRequestState('success');
        } catch {
            setRequestState('error');
        }
    };

    const removeDate = async (date: ReviewedDate) => {
        setRequestState('loading');
        try {
            await axios.delete(`/booking-requests/${draft.id}/dates/${date.id}`, {
                data: { draft_token: draft.draft_token },
            });
            setDates((current) => current.filter((item) => item.id !== date.id));
            setRequestState('success');
        } catch {
            setRequestState('error');
        }
    };

    const reasonLabels: Record<string, string> = {
        past: 'Past date', primary: 'Already the primary date', duplicate: 'Already included',
        held: 'Private hold', blocked: 'Unavailable',
    };

    return (
        <div className="max-w-3xl">
            <FlowHeader eyebrow="Recurring bookings · Step 3" title="Add more dates." description="Build a repeat booking, series, or residency. Every date is checked independently against the live calendar. Adding dates is optional." />
            <form onSubmit={reviewDates} className="space-y-7 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <div className="grid gap-5 md:grid-cols-2">
                    <SelectField id="booking-type" label="Booking type" value={bookingType} onChange={setBookingType} options={[['repeat', 'Repeat booking'], ['series', 'Recurring series'], ['continuous', 'Continuous / residency']]} />
                    <SelectField id="date-mode" label="How should dates be added?" value={mode} onChange={(value) => { setMode(value); setRejected([]); }} options={[['specific', 'Specific date'], ['recurring', 'Generate recurring dates']]} />
                </div>
                {mode === 'specific'
                    ? <TextField id="additional-date" label="Additional date" type="date" value={specificDate} onChange={setSpecificDate} />
                    : <div className="grid gap-5 md:grid-cols-2"><SelectField id="recurring-frequency" label="Frequency" value={frequency} onChange={setFrequency} options={[['weekly', 'Weekly'], ['biweekly', 'Every other week'], ['monthly', 'Monthly']]} /><TextField id="recurring-count" label="Number of additional bookings" type="number" min="1" max="24" value={count} onChange={setCount} /></div>}
                <button type="submit" disabled={requestState === 'loading'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                    {requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />}{mode === 'specific' ? 'Check and add date' : 'Generate and review dates'}
                </button>
                <div aria-live="polite">
                    <h2 className="text-sm font-bold uppercase" style={{ color: 'var(--primary)' }}>Dates in this request</h2>
                    <div className="mt-3 divide-y border" style={{ borderColor: 'var(--border)' }}>
                        {dates.map((date) => (
                            <div key={date.id || date.date} className="flex min-h-16 items-center justify-between gap-4 p-4">
                                <span><strong>{date.date}</strong><span className="ml-2 text-xs uppercase" style={{ color: 'var(--muted)' }}>{date.state}</span>{date.primary && <span className="ml-2 text-xs uppercase" style={{ color: 'var(--primary)' }}>Primary</span>}</span>
                                {!date.primary && <button type="button" onClick={() => removeDate(date)} className="min-h-11 px-3 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>Remove</button>}
                            </div>
                        ))}
                    </div>
                </div>
                {rejected.length > 0 && (
                    <div role="status" className="border-l-2 p-4" style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg)' }}>
                        <strong className="text-sm uppercase">Not added</strong>
                        <ul className="mt-2 space-y-1 text-sm" style={{ color: 'var(--muted)' }}>{rejected.map((date) => <li key={`${date.date}-${date.reason}`}>{date.date}: {reasonLabels[date.reason] ?? date.reason}</li>)}</ul>
                    </div>
                )}
                {requestState === 'error' && <p role="alert" className="text-sm text-red-300">The dates could not be reviewed. Check the choices and try again.</p>}
                <p className="text-sm leading-6" style={{ color: 'var(--muted)' }}>Each date keeps its own seasonal rate, routing, mileage, sound, and production review. No primary-date quote is copied across the series.</p>
            </form>
            <button type="button" onClick={onContinue} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>Continue</button>
        </div>
    );
}
