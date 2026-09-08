import axios from 'axios';
import { ArrowRight, CalendarDays, Check, LoaderCircle, MapPin, Sparkles, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { ActiveDraft, AvailabilityState, BookingDraftResponse, Path, RequestState } from './shared';
import { FlowHeader, fieldClass, fieldStyle } from './shared';

const paths = [
    { id: 'exact' as const, number: '01', title: 'I know my date', description: 'Check the day against PA LINE’s live booking calendar.', action: 'Check the date', icon: CalendarDays },
    { id: 'flexible' as const, number: '02', title: 'Find the sweet spot', description: 'Give us a window and location. We’ll look for the strongest route fit.', action: 'Find the window', icon: Sparkles },
    { id: 'demand' as const, number: '03', title: 'Get over here', description: 'Build local demand and put your city on PA LINE’s routing map.', action: 'Start some trouble', icon: MapPin },
];

export function Start({ onChoose }: { onChoose: (path: Path) => void }) {
    return (
        <div>
            <div className="mb-12 max-w-3xl">
                <p className="mb-4 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>PA LINE Booking</p>
                <h1 className="text-5xl font-bold leading-tight md:text-7xl">Let’s make a show happen.</h1>
                <p className="mt-6 max-w-2xl text-base leading-7 md:text-lg" style={{ color: 'var(--muted)' }}>
                    Check a date, find a route-friendly window, or bring PA LINE to your city. Every request is reviewed before confirmation.
                </p>
            </div>

            <div className="grid gap-px border md:grid-cols-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--border)' }}>
                {paths.map((option) => {
                    const Icon = option.icon;
                    return (
                        <button key={option.id} type="button" onClick={() => onChoose(option.id)} className="group flex min-h-72 flex-col p-7 text-left transition-colors hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-inset" style={{ backgroundColor: 'var(--bg-card)', '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>{option.number}</span>
                                <Icon className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                            </div>
                            <h2 className="mt-auto text-2xl font-bold uppercase">{option.title}</h2>
                            <p className="mt-3 text-sm leading-6" style={{ color: 'var(--muted)' }}>{option.description}</p>
                            <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>{option.action} <ArrowRight className="h-4 w-4" /></span>
                        </button>
                    );
                })}
            </div>

            <button type="button" onClick={() => onChoose('returning-hub')} className="mt-5 flex min-h-28 w-full items-center justify-between gap-5 border p-6 text-left transition-colors hover:bg-black/20" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <span><span className="text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>Returning venues & bookers</span><strong className="mt-2 block text-xl uppercase">Back for more?</strong></span>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}><UserRound className="h-5 w-5" /></span>
            </button>
        </div>
    );
}

/**
 * Prototype's pageReturningHub, adapted: since /booking already requires sign-in
 * (EnsureBookingAccess), there's no separate magic-link request here — the booker
 * is already authenticated. This just self-reports a prior-show count (matching
 * the prototype's own self-reported dropdown, not a computed value) before
 * continuing into the normal exact/flexible entry paths.
 */
export function ReturningHub({ onChoose }: { onChoose: (path: Path, priorQualifiedShows: number) => void }) {
    const [priorCount, setPriorCount] = useState('0');

    const eligible = Number(priorCount) >= 4;

    return (
        <div className="max-w-3xl">
            <FlowHeader eyebrow="Returning booker" title="Let’s do it again." description="Confirm how many PA LINE gigs this venue or booking contact already has confirmed this year, then pick what's next." />
            <div className="space-y-6 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <label htmlFor="prior-count" className="block text-xs font-semibold uppercase">PA LINE gigs already confirmed through this venue / contact this year
                    <select id="prior-count" value={priorCount} onChange={(event) => setPriorCount(event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle}>
                        <option value="0">None yet</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4 or more</option>
                    </select>
                </label>
                <div role="status" className="border-l-2 p-4" style={{ borderColor: eligible ? '#69c587' : 'var(--primary)', backgroundColor: 'var(--bg)' }}>
                    {eligible ? <strong>Repeat booking eligibility met</strong> : <strong>{priorCount} of 4 toward repeat status</strong>}
                    <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>New dates in this request also count toward the four-gig threshold.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                    <ChoiceCard title="Book another date" description="Same venue profile, new date." action="Let's run it back" onClick={() => onChoose('exact', Number(priorCount))} />
                    <ChoiceCard title="Find our next sweet spot" description="Keep the venue, let PA LINE choose the best date." action="Find the date" onClick={() => onChoose('flexible', Number(priorCount))} />
                    <ChoiceCard title="Make it a thing" description="Planning four or more shows? Build the series together." action="Build a series" onClick={() => onChoose('flexible', Number(priorCount))} />
                </div>
            </div>
        </div>
    );
}

function ChoiceCard({ title, description, action, onClick }: { title: string; description: string; action: string; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className="min-h-40 border p-4 text-left transition-colors hover:bg-black/20" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
            <h3 className="text-sm font-bold uppercase">{title}</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>{description}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>{action} <ArrowRight className="h-4 w-4" /></span>
        </button>
    );
}

export function ExactDate({ onContinue }: { onContinue: (draft: ActiveDraft) => void }) {
    const [date, setDate] = useState('');
    const [requestState, setRequestState] = useState<RequestState>('idle');
    const [availability, setAvailability] = useState<AvailabilityState | null>(null);
    const [draftState, setDraftState] = useState<RequestState>('idle');

    const changeDate = (value: string) => {
        setDate(value);
        setAvailability(null);
        setRequestState('idle');
        setDraftState('idle');
    };

    const checkDate = async (event: FormEvent) => {
        event.preventDefault();
        setRequestState('loading');
        setAvailability(null);
        try {
            const response = await axios.post<{ state: AvailabilityState }>('/availability/check', { date });
            setAvailability(response.data.state);
            setRequestState('success');
        } catch {
            setRequestState('error');
        }
    };

    const createDraft = async () => {
        setDraftState('loading');
        try {
            const response = await axios.post<BookingDraftResponse>('/booking-requests', {
                source_path: 'exact',
                primary_date: date,
            });
            setDraftState('success');
            onContinue({ ...response.data, selectedDate: date });
        } catch {
            setDraftState('error');
        }
    };

    const messages: Record<AvailabilityState, string> = {
        available: 'This date is currently available to request.',
        limited: 'PA LINE already has an engagement that day. A safe second-show window may still be possible.',
        held: 'This date currently has a private hold and cannot be treated as available.',
        blocked: 'This date is not currently available for requests.',
    };

    return (
        <div className="max-w-2xl">
            <FlowHeader eyebrow="Exact date · Step 1" title="What date are you thinking?" description="We’ll check the authoritative PA LINE calendar. Availability is rechecked before submission and approval." />
            <form onSubmit={checkDate} className="border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <label htmlFor="booking-date" className="mb-2 block text-xs font-semibold uppercase">Performance date</label>
                <input id="booking-date" type="date" required value={date} onChange={(event) => changeDate(event.target.value)} className={fieldClass} style={fieldStyle} />
                <button type="submit" disabled={requestState === 'loading'} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                    {requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Check availability
                </button>
                {requestState === 'success' && availability && <div role="status" className="mt-5 border-l-2 p-4" style={{ borderColor: availability === 'available' ? '#69c587' : 'var(--primary)', backgroundColor: 'var(--bg)' }}><strong className="uppercase">{availability}</strong><p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{messages[availability]}</p></div>}
                {requestState === 'error' && <p role="alert" className="mt-4 text-sm text-red-300">We couldn’t verify the calendar. Try again; no availability claim has been made.</p>}
                {requestState === 'success' && (availability === 'available' || availability === 'limited') && draftState !== 'success' && <button type="button" onClick={createDraft} disabled={draftState === 'loading'} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 border px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>{draftState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Start this request</button>}
                {draftState === 'success' && <p role="status" className="mt-4 text-sm" style={{ color: 'var(--muted)' }}><Check className="mr-2 inline h-4 w-4" />Your private booking draft has been started. Event and contact details come next.</p>}
                {draftState === 'error' && <p role="alert" className="mt-4 text-sm text-red-300">The date is still unchanged, but the draft could not be saved. Please try again.</p>}
            </form>
        </div>
    );
}

export function FlexibleDate({ onContinue }: { onContinue: (draft: ActiveDraft) => void }) {
    const [city, setCity] = useState('');
    const [state, setState] = useState('NY');
    const [windowStartsOn, setWindowStartsOn] = useState('');
    const [windowEndsOn, setWindowEndsOn] = useState('');
    const [requestState, setRequestState] = useState<RequestState>('idle');
    const [candidates, setCandidates] = useState<BookingDraftResponse['dates']>([]);
    const [draft, setDraft] = useState<BookingDraftResponse | null>(null);
    const updatePreference = (setter: (value: string) => void, value: string) => {
        setter(value);
        setRequestState('idle');
        setCandidates([]);
    };

    const createDraft = async (event: FormEvent) => {
        event.preventDefault();
        setRequestState('loading');
        setCandidates([]);
        setDraft(null);
        try {
            const response = await axios.post<BookingDraftResponse>('/booking-requests', {
                source_path: 'flexible',
                city,
                state,
                window_starts_on: windowStartsOn,
                window_ends_on: windowEndsOn,
            });
            setCandidates(response.data.dates);
            setDraft(response.data);
            setRequestState('success');
        } catch {
            setRequestState('error');
        }
    };

    return (
        <div className="max-w-2xl">
            <FlowHeader eyebrow="Flexible date · Step 1" title="Find the sweet spot." description="Tell us where and when. Suggestions preserve your original window and never silently replace it." />
            <form onSubmit={createDraft} className="grid gap-5 border p-6 md:grid-cols-2 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <label htmlFor="flex-city" className="text-xs font-semibold uppercase">City<input id="flex-city" required value={city} onChange={(event) => updatePreference(setCity, event.target.value)} autoComplete="address-level2" className={`${fieldClass} mt-2`} style={fieldStyle} /></label>
                <label htmlFor="flex-state" className="text-xs font-semibold uppercase">State<input id="flex-state" required value={state} onChange={(event) => updatePreference(setState, event.target.value)} autoComplete="address-level1" className={`${fieldClass} mt-2`} style={fieldStyle} maxLength={64} /></label>
                <label htmlFor="flex-start" className="text-xs font-semibold uppercase">Window starts<input id="flex-start" required value={windowStartsOn} onChange={(event) => updatePreference(setWindowStartsOn, event.target.value)} type="date" className={`${fieldClass} mt-2`} style={fieldStyle} /></label>
                <label htmlFor="flex-end" className="text-xs font-semibold uppercase">Window ends<input id="flex-end" required value={windowEndsOn} onChange={(event) => updatePreference(setWindowEndsOn, event.target.value)} type="date" className={`${fieldClass} mt-2`} style={fieldStyle} /></label>
                <button type="submit" disabled={requestState === 'loading' || requestState === 'success'} className="inline-flex min-h-12 items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50 md:col-span-2" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>{requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Find date options</button>
                {requestState === 'success' && (
                    <div role="status" className="space-y-3 md:col-span-2">
                        {candidates.map((candidate) => (
                            <button key={candidate.id} type="button" onClick={() => draft && onContinue({ ...draft, selectedDate: candidate.date })} className="flex w-full items-center justify-between border p-4 text-left" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
                                <span><strong>{candidate.date}</strong><span className="ml-2 text-xs uppercase" style={{ color: 'var(--muted)' }}>{candidate.state}</span></span>
                                {candidate.miles != null && <span className="text-xs" style={{ color: 'var(--muted)' }}>{candidate.miles} mi</span>}
                            </button>
                        ))}
                        {candidates.length === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>No open dates found in that window. Try widening it.</p>}
                    </div>
                )}
                {requestState === 'error' && <p role="alert" className="text-sm text-red-300 md:col-span-2">That window could not be checked. Please try again.</p>}
            </form>
        </div>
    );
}

export function Demand() {
    const [form, setForm] = useState({ city: '', state: 'NY', preferredVenue: '', attendees: '1', localRole: 'fan', name: '', email: '', consent: false, updatePreference: 'email' });
    const [requestState, setRequestState] = useState<RequestState>('idle');
    const update = (field: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

    const submitDemand = async (event: FormEvent) => {
        event.preventDefault();
        setRequestState('loading');
        try {
            await axios.post('/demand', {
                city: form.city,
                state: form.state,
                preferred_venue: form.preferredVenue || null,
                estimated_attendees: Number(form.attendees),
                local_role: form.localRole,
                name: form.name,
                email: form.email,
                consent_to_updates: form.consent,
                update_preference: form.consent ? form.updatePreference : null,
                momentum_actions: [],
            });
            setRequestState('success');
        } catch {
            setRequestState('error');
        }
    };

    return (
        <div className="max-w-2xl">
            <FlowHeader eyebrow="Demand · Step 1" title="Get PA LINE over here." description="Tell us where the demand is building. This is a demand signal, not a booking confirmation." />
            <form onSubmit={submitDemand} className="grid gap-5 border p-6 md:grid-cols-2 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <label htmlFor="demand-city" className="text-xs font-semibold uppercase">City<input id="demand-city" required value={form.city} onChange={(event) => update('city', event.target.value)} autoComplete="address-level2" className={`${fieldClass} mt-2`} style={fieldStyle} /></label>
                <label htmlFor="demand-state" className="text-xs font-semibold uppercase">State<input id="demand-state" required value={form.state} onChange={(event) => update('state', event.target.value)} autoComplete="address-level1" className={`${fieldClass} mt-2`} style={fieldStyle} /></label>
                <label htmlFor="demand-venue" className="text-xs font-semibold uppercase md:col-span-2">Venue idea <span className="normal-case" style={{ color: 'var(--muted)' }}>(optional)</span><input id="demand-venue" value={form.preferredVenue} onChange={(event) => update('preferredVenue', event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} /></label>
                <label htmlFor="demand-attendees" className="text-xs font-semibold uppercase">Likely attendees<select id="demand-attendees" value={form.attendees} onChange={(event) => update('attendees', event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle}><option value="1">Just me</option><option value="2">2 people</option><option value="4">3–4 people</option><option value="8">5–8 people</option><option value="15">9–15 people</option><option value="25">15+ people</option></select></label>
                <label htmlFor="demand-role" className="text-xs font-semibold uppercase">Your local role<select id="demand-role" value={form.localRole} onChange={(event) => update('localRole', event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle}><option value="fan">Fan</option><option value="connector">Local connector</option><option value="venue">Venue / promoter</option></select></label>
                <label htmlFor="demand-name" className="text-xs font-semibold uppercase">Your name<input id="demand-name" required value={form.name} onChange={(event) => update('name', event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} /></label>
                <label htmlFor="demand-email" className="text-xs font-semibold uppercase">Email<input id="demand-email" type="email" required value={form.email} onChange={(event) => update('email', event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} /></label>
                <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={form.consent} onChange={(event) => update('consent', event.target.checked)} /> Keep me posted about this city's PA LINE progress.</label>
                <button type="submit" disabled={requestState === 'loading' || requestState === 'success'} className="inline-flex min-h-12 items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50 md:col-span-2" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>{requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Submit demand</button>
                {requestState === 'success' && <p role="status" className="text-sm md:col-span-2" style={{ color: 'var(--muted)' }}><Check className="mr-2 inline h-4 w-4" />Recorded. PA LINE tracks demand signals city by city.</p>}
                {requestState === 'error' && <p role="alert" className="text-sm text-red-300 md:col-span-2">That signal could not be recorded. Please try again.</p>}
            </form>
        </div>
    );
}
