import PageMeta from '@/Components/PageMeta';
import MainLayout from '@/Layouts/MainLayout';
import axios from 'axios';
import { ArrowLeft, ArrowRight, CalendarDays, Check, LoaderCircle, MapPin, RotateCcw, Sparkles, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';

type Path = 'start' | 'exact' | 'flexible' | 'details' | 'production' | 'recurring' | 'demand' | 'returning';
type AvailabilityState = 'available' | 'limited' | 'held' | 'blocked';
type RequestState = 'idle' | 'loading' | 'success' | 'error';
type CandidateDate = { id: string; date: string; state: AvailabilityState };
type BookingDraftResponse = { id: string; draft_token: string; dates: CandidateDate[]; routing_status: string | null };
type ActiveDraft = BookingDraftResponse & { selectedDate: string };
type ReviewedDate = CandidateDate & { primary: boolean };
type RejectedDate = { date: string; reason: string };

const paths = [
    {
        id: 'exact' as const,
        number: '01',
        title: 'I know my date',
        description: 'Check the day against PA LINE’s live booking calendar.',
        action: 'Check the date',
        icon: CalendarDays,
    },
    {
        id: 'flexible' as const,
        number: '02',
        title: 'Find the sweet spot',
        description: 'Give us a window and location. We’ll look for the strongest route fit.',
        action: 'Find the window',
        icon: Sparkles,
    },
    {
        id: 'demand' as const,
        number: '03',
        title: 'Get over here',
        description: 'Build local demand and put your city on PA LINE’s routing map.',
        action: 'Start some trouble',
        icon: MapPin,
    },
];

const fieldClass = 'w-full border px-4 py-3 text-base outline-none transition-colors focus:border-[var(--primary)]';
const fieldStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };

export default function Booking() {
    const [path, setPath] = useState<Path>('start');
    const [draft, setDraft] = useState<ActiveDraft | null>(null);
    const continueDraft = (activeDraft: ActiveDraft) => {
        setDraft(activeDraft);
        setPath('details');
    };
    const startOver = () => {
        setDraft(null);
        setPath('start');
    };

    return (
        <MainLayout>
            <PageMeta title="Book PA LINE" description="Check dates and start a PA LINE booking request." />
            <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/booking-prototype/assets/pa-line-rose-web.png)', backgroundPosition: '85% 15%', backgroundRepeat: 'no-repeat', backgroundSize: 'min(52rem, 85vw)' }} />
                <div className="relative mx-auto max-w-6xl px-6 py-14 md:py-20">
                    {path === 'start' ? (
                        <Start onChoose={setPath} />
                    ) : (
                        <div>
                            <div className="mb-10 flex items-center justify-between gap-4">
                                <button type="button" onClick={() => setPath('start')} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold uppercase" style={{ color: 'var(--primary)' }}>
                                    <ArrowLeft className="h-4 w-4" /> Back
                                </button>
                                <button type="button" onClick={startOver} aria-label="Start over" className="flex h-11 w-11 items-center justify-center border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                            </div>
                            {path === 'exact' && <ExactDate onContinue={continueDraft} />}
                            {path === 'flexible' && <FlexibleDate onContinue={continueDraft} />}
                            {path === 'details' && draft && <BookingDetails draft={draft} onContinue={() => setPath('production')} />}
                            {path === 'production' && draft && <ProductionOptions draft={draft} onContinue={() => setPath('recurring')} />}
                            {path === 'recurring' && draft && <RecurringDates draft={draft} />}
                            {path === 'demand' && <Demand />}
                            {path === 'returning' && <ReturningAccess />}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

function Start({ onChoose }: { onChoose: (path: Path) => void }) {
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

            <button type="button" onClick={() => onChoose('returning')} className="mt-5 flex min-h-28 w-full items-center justify-between gap-5 border p-6 text-left transition-colors hover:bg-black/20" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <span><span className="text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>Returning venues & bookers</span><strong className="mt-2 block text-xl uppercase">Back for more?</strong></span>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}><UserRound className="h-5 w-5" /></span>
            </button>
        </div>
    );
}

function FlowHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
    return <div className="mb-9 max-w-2xl"><p className="mb-3 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>{eyebrow}</p><h1 className="text-4xl font-bold md:text-5xl">{title}</h1><p className="mt-4 leading-7" style={{ color: 'var(--muted)' }}>{description}</p></div>;
}

function ExactDate({ onContinue }: { onContinue: (draft: ActiveDraft) => void }) {
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

function FlexibleDate({ onContinue }: { onContinue: (draft: ActiveDraft) => void }) {
    const [city, setCity] = useState('');
    const [state, setState] = useState('NY');
    const [windowStartsOn, setWindowStartsOn] = useState('');
    const [windowEndsOn, setWindowEndsOn] = useState('');
    const [requestState, setRequestState] = useState<RequestState>('idle');
    const [candidates, setCandidates] = useState<CandidateDate[]>([]);
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

    return <div className="max-w-2xl"><FlowHeader eyebrow="Flexible date · Step 1" title="Find the sweet spot." description="Tell us where and when. Suggestions preserve your original window and never silently replace it." /><form onSubmit={createDraft} className="grid gap-5 border p-6 md:grid-cols-2 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}><label htmlFor="flex-city" className="text-xs font-semibold uppercase">City<input id="flex-city" required value={city} onChange={(event) => updatePreference(setCity, event.target.value)} autoComplete="address-level2" className={`${fieldClass} mt-2`} style={fieldStyle} /></label><label htmlFor="flex-state" className="text-xs font-semibold uppercase">State<input id="flex-state" required value={state} onChange={(event) => updatePreference(setState, event.target.value)} autoComplete="address-level1" className={`${fieldClass} mt-2`} style={fieldStyle} maxLength={64} /></label><label htmlFor="flex-start" className="text-xs font-semibold uppercase">Window starts<input id="flex-start" required value={windowStartsOn} onChange={(event) => updatePreference(setWindowStartsOn, event.target.value)} type="date" className={`${fieldClass} mt-2`} style={fieldStyle} /></label><label htmlFor="flex-end" className="text-xs font-semibold uppercase">Window ends<input id="flex-end" required value={windowEndsOn} onChange={(event) => updatePreference(setWindowEndsOn, event.target.value)} type="date" className={`${fieldClass} mt-2`} style={fieldStyle} /></label><button type="submit" disabled={requestState === 'loading' || requestState === 'success'} className="inline-flex min-h-12 items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50 md:col-span-2" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>{requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Find date options</button>{requestState === 'success' && <div role="status" className="space-y-3 border-l-2 p-4 md:col-span-2" style={{ borderColor: '#69c587', backgroundColor: 'var(--bg)' }}><strong className="uppercase">Choose a date</strong>{candidates.length > 0 ? <div className="grid gap-2 sm:grid-cols-2">{candidates.map((candidate) => <button type="button" key={candidate.id} onClick={() => draft && onContinue({ ...draft, selectedDate: candidate.date })} className="flex min-h-12 items-center justify-between border p-3 text-left text-sm hover:bg-black/20" style={{ borderColor: 'var(--border)' }}><strong>{candidate.date}</strong><span className="uppercase" style={{ color: 'var(--muted)' }}>{candidate.state}</span></button>)}</div> : <p className="text-sm" style={{ color: 'var(--muted)' }}>No requestable dates are currently visible in that window.</p>}<p className="text-sm" style={{ color: 'var(--muted)' }}>Calendar results are live. Route ranking remains pending until the venue location can be verified.</p></div>}{requestState === 'error' && <p role="alert" className="text-sm text-red-300 md:col-span-2">We couldn’t save this window or verify its dates. Check the range and try again.</p>}</form></div>;
}

function BookingDetails({ draft, onContinue }: { draft: ActiveDraft; onContinue: () => void }) {
    const [form, setForm] = useState({ venueName: '', streetAddress: '', city: '', state: 'NY', postalCode: '', eventName: '', eventType: 'public_performance', setting: 'indoor', start: '19:00', end: '22:00', attendance: '', contactName: '', contactEmail: '', contactPhone: '' });
    const [requestState, setRequestState] = useState<RequestState>('idle');
    const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

    const saveDetails = async (event: FormEvent) => {
        event.preventDefault();
        setRequestState('loading');
        try {
            await axios.patch(`/booking-requests/${draft.id}`, {
                draft_token: draft.draft_token,
                selected_date: draft.selectedDate,
                venue: { name: form.venueName, street_address: form.streetAddress, city: form.city, state: form.state, postal_code: form.postalCode },
                event: { name: form.eventName, type: form.eventType, setting: form.setting, start: form.start, end: form.end, estimated_attendance: Number(form.attendance) },
                contact: { name: form.contactName, email: form.contactEmail, phone: form.contactPhone || null },
            });
            setRequestState('success');
            onContinue();
        } catch {
            setRequestState('error');
        }
    };

    return <div className="max-w-3xl"><FlowHeader eyebrow="Booking details · Step 2" title="Tell us about the show." description={`${draft.selectedDate} stays selected while you add the venue, event, and booking contact.`} /><form onSubmit={saveDetails} className="space-y-8 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}><fieldset className="grid gap-5 md:grid-cols-2"><legend className="mb-5 text-sm font-bold uppercase" style={{ color: 'var(--primary)' }}>Venue</legend><TextField id="venue-name" label="Venue name" value={form.venueName} onChange={(value) => update('venueName', value)} autoComplete="organization" /><TextField id="venue-address" label="Street address" value={form.streetAddress} onChange={(value) => update('streetAddress', value)} autoComplete="street-address" /><TextField id="venue-city" label="City" value={form.city} onChange={(value) => update('city', value)} autoComplete="address-level2" /><TextField id="venue-state" label="State" value={form.state} onChange={(value) => update('state', value)} autoComplete="address-level1" /><TextField id="venue-postal" label="ZIP" value={form.postalCode} onChange={(value) => update('postalCode', value)} autoComplete="postal-code" /></fieldset><fieldset className="grid gap-5 md:grid-cols-2"><legend className="mb-5 text-sm font-bold uppercase" style={{ color: 'var(--primary)' }}>Event</legend><TextField id="event-name" label="Event name" value={form.eventName} onChange={(value) => update('eventName', value)} /><SelectField id="event-type" label="Event type" value={form.eventType} onChange={(value) => update('eventType', value)} options={[['public_performance', 'Public performance'], ['festival', 'Festival'], ['private_event', 'Private event'], ['corporate_event', 'Corporate event'], ['wedding', 'Wedding'], ['fundraiser', 'Fundraiser'], ['other', 'Other']]} /><SelectField id="event-setting" label="Setting" value={form.setting} onChange={(value) => update('setting', value)} options={[['indoor', 'Indoor'], ['outdoor', 'Outdoor'], ['indoor_outdoor', 'Indoor / outdoor'], ['unsure', 'Not sure yet']]} /><TextField id="event-attendance" label="Estimated attendance" type="number" min="1" value={form.attendance} onChange={(value) => update('attendance', value)} /><TextField id="event-start" label="Start time" type="time" value={form.start} onChange={(value) => update('start', value)} /><TextField id="event-end" label="End time" type="time" value={form.end} onChange={(value) => update('end', value)} /></fieldset><fieldset className="grid gap-5 md:grid-cols-2"><legend className="mb-5 text-sm font-bold uppercase" style={{ color: 'var(--primary)' }}>Booking contact</legend><TextField id="contact-name" label="Contact name" value={form.contactName} onChange={(value) => update('contactName', value)} autoComplete="name" /><TextField id="contact-email" label="Contact email" type="email" value={form.contactEmail} onChange={(value) => update('contactEmail', value)} autoComplete="email" /><TextField id="contact-phone" label="Contact phone (optional)" required={false} value={form.contactPhone} onChange={(value) => update('contactPhone', value)} autoComplete="tel" /></fieldset><button type="submit" disabled={requestState === 'loading' || requestState === 'success'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>{requestState === 'loading' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : requestState === 'success' ? <Check className="h-4 w-4" /> : null}{requestState === 'success' ? 'Details saved' : 'Save and continue'}</button>{requestState === 'success' && <p role="status" className="text-sm" style={{ color: 'var(--muted)' }}>Venue, event, and contact details are saved. Performance options come next.</p>}{requestState === 'error' && <p role="alert" className="text-sm text-red-300">The details could not be saved. Check the fields and try again.</p>}</form></div>;
}

function ProductionOptions({ draft, onContinue }: { draft: ActiveDraft; onContinue: () => void }) {
    const [performanceFormat, setPerformanceFormat] = useState('full_pa_line');
    const [performanceLength, setPerformanceLength] = useState('90');
    const [soundProvided, setSoundProvided] = useState<boolean | null>(null);
    const [houseEngineer, setHouseEngineer] = useState('unknown');
    const [truePotential, setTruePotential] = useState(false);
    const [requestState, setRequestState] = useState<RequestState>('idle');
    const minimumTruePotentialDate = new Date();
    minimumTruePotentialDate.setMonth(minimumTruePotentialDate.getMonth() + 6);
    const truePotentialEligible = new Date(`${draft.selectedDate}T00:00:00`) >= minimumTruePotentialDate;

    const saveProduction = async (event: FormEvent) => {
        event.preventDefault();
        setRequestState('loading');
        try {
            await axios.patch(`/booking-requests/${draft.id}/production`, {
                draft_token: draft.draft_token,
                performance_format: performanceFormat,
                performance_length_minutes: Number(performanceLength),
                sound_provided: soundProvided,
                house_engineer_provided: soundProvided ? houseEngineer === 'yes' : null,
                true_potential_requested: truePotential,
            });
            setRequestState('success');
            onContinue();
        } catch {
            setRequestState('error');
        }
    };

    return <div className="max-w-3xl"><FlowHeader eyebrow="Performance & production · Step 3" title="Build the right show." description="Choose the PA LINE format and tell us what production the venue can provide. Pricing remains private until verified access." /><form onSubmit={saveProduction} className="space-y-8 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}><fieldset><legend className="mb-4 text-sm font-bold uppercase" style={{ color: 'var(--primary)' }}>Performance format</legend><div className="grid gap-px border md:grid-cols-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--border)' }}>{[['solo', 'Solo', 'Trever Stribing solo.'], ['duo', 'Duo', 'A stripped-down PA LINE duo.'], ['full_pa_line', 'Full PA LINE', 'The full-band experience.']].map(([value, title, description]) => <label key={value} className="min-h-36 cursor-pointer p-5" style={{ backgroundColor: performanceFormat === value ? 'color-mix(in srgb, var(--primary) 12%, var(--bg-card))' : 'var(--bg-card)' }}><input type="radio" name="performance-format" value={value} checked={performanceFormat === value} onChange={() => setPerformanceFormat(value)} className="mr-3" /><strong className="uppercase">{title}</strong><span className="mt-4 block text-sm leading-6" style={{ color: 'var(--muted)' }}>{description}</span></label>)}</div></fieldset><SelectField id="performance-length" label="Performance length" value={performanceLength} onChange={setPerformanceLength} options={[["60", "Up to 60 minutes"], ["90", "Up to 90 minutes"], ["120", "Up to 2 hours"], ["180", "Up to 3 hours / multiple sets"]]} /><fieldset><legend className="mb-4 text-sm font-bold uppercase" style={{ color: 'var(--primary)' }}>Sound system</legend><div className="grid gap-3 sm:grid-cols-2"><ChoiceButton selected={soundProvided === true} onClick={() => setSoundProvided(true)} title="Sound is provided" description="The venue has a suitable PA system." /><ChoiceButton selected={soundProvided === false} onClick={() => { setSoundProvided(false); setHouseEngineer('unknown'); }} title="PA LINE provides sound" description="Format-based sound fees will apply." /></div></fieldset>{soundProvided === true && <SelectField id="house-engineer" label="Qualified house engineer included?" value={houseEngineer} onChange={setHouseEngineer} options={[["unknown", "Choose one"], ["yes", "Yes"], ["no", "No"]]} />}<fieldset className="border-l-2 p-5" style={{ borderColor: truePotentialEligible ? 'var(--primary)' : 'var(--border)', backgroundColor: 'var(--bg)' }}><legend className="px-2 text-sm font-bold uppercase">TRUE POTENTIAL</legend><p className="text-sm leading-6" style={{ color: 'var(--muted)' }}>Expanded musicians, production, preparation, and promotion require a custom quote and at least six months of lead time.</p><label className="mt-4 flex items-start gap-3 text-sm"><input type="checkbox" checked={truePotential} disabled={!truePotentialEligible} onChange={(event) => setTruePotential(event.target.checked)} className="mt-0.5 h-5 w-5" /><span>{truePotentialEligible ? 'Request a TRUE POTENTIAL custom production review.' : 'This date is inside the six-month production window.'}</span></label></fieldset><button type="submit" disabled={requestState === 'loading' || requestState === 'success' || soundProvided === null || (soundProvided && houseEngineer === 'unknown')} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>{requestState === 'loading' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : requestState === 'success' ? <Check className="h-4 w-4" /> : null}{requestState === 'success' ? 'Production saved' : 'Save production options'}</button>{requestState === 'success' && <p role="status" className="text-sm" style={{ color: 'var(--muted)' }}>Performance and production choices are saved. Recurring dates and booking preferences come next.</p>}{requestState === 'error' && <p role="alert" className="text-sm text-red-300">Production choices could not be saved. Review the selections and try again.</p>}</form></div>;
}

function RecurringDates({ draft }: { draft: ActiveDraft }) {
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

    return <div className="max-w-3xl"><FlowHeader eyebrow="Recurring bookings · Step 4" title="Add more dates." description="Build a repeat booking, series, or residency. Every date is checked independently against the live calendar." /><form onSubmit={reviewDates} className="space-y-7 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}><div className="grid gap-5 md:grid-cols-2"><SelectField id="booking-type" label="Booking type" value={bookingType} onChange={setBookingType} options={[["repeat", "Repeat booking"], ["series", "Recurring series"], ["continuous", "Continuous / residency"]]} /><SelectField id="date-mode" label="How should dates be added?" value={mode} onChange={(value) => { setMode(value); setRejected([]); }} options={[["specific", "Specific date"], ["recurring", "Generate recurring dates"]]} /></div>{mode === 'specific' ? <TextField id="additional-date" label="Additional date" type="date" value={specificDate} onChange={setSpecificDate} /> : <div className="grid gap-5 md:grid-cols-2"><SelectField id="recurring-frequency" label="Frequency" value={frequency} onChange={setFrequency} options={[["weekly", "Weekly"], ["biweekly", "Every other week"], ["monthly", "Monthly"]]} /><TextField id="recurring-count" label="Number of additional bookings" type="number" min="1" max="24" value={count} onChange={setCount} /></div>}<button type="submit" disabled={requestState === 'loading'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>{requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />}{mode === 'specific' ? 'Check and add date' : 'Generate and review dates'}</button><div aria-live="polite"><h2 className="text-sm font-bold uppercase" style={{ color: 'var(--primary)' }}>Dates in this request</h2><div className="mt-3 divide-y border" style={{ borderColor: 'var(--border)' }}>{dates.map((date) => <div key={date.id || date.date} className="flex min-h-16 items-center justify-between gap-4 p-4"><span><strong>{date.date}</strong><span className="ml-2 text-xs uppercase" style={{ color: 'var(--muted)' }}>{date.state}</span>{date.primary && <span className="ml-2 text-xs uppercase" style={{ color: 'var(--primary)' }}>Primary</span>}</span>{!date.primary && <button type="button" onClick={() => removeDate(date)} className="min-h-11 px-3 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>Remove</button>}</div>)}</div></div>{rejected.length > 0 && <div role="status" className="border-l-2 p-4" style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg)' }}><strong className="text-sm uppercase">Not added</strong><ul className="mt-2 space-y-1 text-sm" style={{ color: 'var(--muted)' }}>{rejected.map((date) => <li key={`${date.date}-${date.reason}`}>{date.date}: {reasonLabels[date.reason] ?? date.reason}</li>)}</ul></div>}{requestState === 'success' && rejected.length === 0 && <p role="status" className="text-sm" style={{ color: 'var(--muted)' }}>All displayed dates are saved for individual routing and pricing review.</p>}{requestState === 'error' && <p role="alert" className="text-sm text-red-300">The dates could not be reviewed. Check the choices and try again.</p>}<p className="text-sm leading-6" style={{ color: 'var(--muted)' }}>Each date keeps its own seasonal rate, routing, mileage, sound, and production review. No primary-date quote is copied across the series.</p></form></div>;
}

function ChoiceButton({ selected, onClick, title, description }: { selected: boolean; onClick: () => void; title: string; description: string }) {
    return <button type="button" aria-pressed={selected} onClick={onClick} className="min-h-28 border p-4 text-left" style={{ borderColor: selected ? 'var(--primary)' : 'var(--border)', backgroundColor: selected ? 'color-mix(in srgb, var(--primary) 12%, var(--bg-card))' : 'var(--bg-card)' }}><strong className="block uppercase">{title}</strong><span className="mt-2 block text-sm" style={{ color: 'var(--muted)' }}>{description}</span></button>;
}

function TextField({ id, label, value, onChange, type = 'text', required = true, autoComplete, min, max }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; autoComplete?: string; min?: string; max?: string }) {
    return <label htmlFor={id} className="text-xs font-semibold uppercase">{label}<input id={id} type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} min={min} max={max} className={`${fieldClass} mt-2`} style={fieldStyle} /></label>;
}

function SelectField({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
    return <label htmlFor={id} className="text-xs font-semibold uppercase">{label}<select id={id} required value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle}>{options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}</select></label>;
}

function Demand() {
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

    return <div className="max-w-2xl"><FlowHeader eyebrow="Demand · Step 1" title="Get PA LINE over here." description="Tell us where the demand is building. This is a demand signal, not a booking confirmation." /><form onSubmit={submitDemand} className="grid gap-5 border p-6 md:grid-cols-2 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}><label htmlFor="demand-city" className="text-xs font-semibold uppercase">City<input id="demand-city" required value={form.city} onChange={(event) => update('city', event.target.value)} autoComplete="address-level2" className={`${fieldClass} mt-2`} style={fieldStyle} /></label><label htmlFor="demand-state" className="text-xs font-semibold uppercase">State<input id="demand-state" required value={form.state} onChange={(event) => update('state', event.target.value)} autoComplete="address-level1" className={`${fieldClass} mt-2`} style={fieldStyle} /></label><label htmlFor="demand-venue" className="text-xs font-semibold uppercase md:col-span-2">Venue idea <span className="normal-case" style={{ color: 'var(--muted)' }}>(optional)</span><input id="demand-venue" value={form.preferredVenue} onChange={(event) => update('preferredVenue', event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} /></label><label htmlFor="demand-attendees" className="text-xs font-semibold uppercase">Likely attendees<select id="demand-attendees" value={form.attendees} onChange={(event) => update('attendees', event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle}><option value="1">Just me</option><option value="2">2 people</option><option value="4">3–4 people</option><option value="8">5–8 people</option><option value="15">9–15 people</option><option value="25">15+ people</option></select></label><label htmlFor="demand-role" className="text-xs font-semibold uppercase">Your local role<select id="demand-role" value={form.localRole} onChange={(event) => update('localRole', event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle}><option value="fan">Fan</option><option value="connector">Local connector</option><option value="venue">Venue / promoter</option></select></label><label htmlFor="demand-name" className="text-xs font-semibold uppercase">Your name<input id="demand-name" required value={form.name} onChange={(event) => update('name', event.target.value)} autoComplete="name" className={`${fieldClass} mt-2`} style={fieldStyle} /></label><label htmlFor="demand-email" className="text-xs font-semibold uppercase">Email<input id="demand-email" required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" className={`${fieldClass} mt-2`} style={fieldStyle} /></label><label className="flex min-h-12 items-center gap-3 border p-3 text-sm md:col-span-2" style={{ borderColor: 'var(--border)' }}><input type="checkbox" checked={form.consent} onChange={(event) => update('consent', event.target.checked)} className="h-5 w-5" />Keep me updated about this city request.</label>{form.consent && <label htmlFor="demand-updates" className="text-xs font-semibold uppercase md:col-span-2">Preferred updates<select id="demand-updates" value={form.updatePreference} onChange={(event) => update('updatePreference', event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle}><option value="email">Email</option><option value="text">Text</option><option value="email_text">Email + text</option></select></label>}<button type="submit" disabled={requestState === 'loading' || requestState === 'success'} className="inline-flex min-h-12 items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50 md:col-span-2" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>{requestState === 'loading' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : requestState === 'success' ? <Check className="h-4 w-4" /> : null}{requestState === 'success' ? 'Demand recorded' : 'Create demand'}</button>{requestState === 'success' && <p role="status" className="text-sm md:col-span-2" style={{ color: 'var(--muted)' }}>You helped put {form.city}, {form.state} on PA LINE’s map. This is not a booking confirmation.</p>}{requestState === 'error' && <p role="alert" className="text-sm text-red-300 md:col-span-2">The demand signal could not be recorded. Please check the details and try again.</p>}</form></div>;
}

function ReturningAccess() {
    const [email, setEmail] = useState('');
    const [organization, setOrganization] = useState('');
    const [requestState, setRequestState] = useState<RequestState>('idle');

    const requestLink = async (event: FormEvent) => {
        event.preventDefault();
        setRequestState('loading');
        try {
            await axios.post('/auth/magic-link', { email, organization });
            setRequestState('success');
        } catch {
            setRequestState('error');
        }
    };

    return <div className="max-w-2xl"><FlowHeader eyebrow="Secure returning access" title="Good to see you again." description="Use the email associated with your prior PA LINE bookings. Venue access is determined by verified server-side authorization." /><form onSubmit={requestLink} className="space-y-5 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}><label htmlFor="returning-email" className="block text-xs font-semibold uppercase">Business email<input id="returning-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} /></label><label htmlFor="returning-organization" className="block text-xs font-semibold uppercase">Venue or organization<input id="returning-organization" value={organization} onChange={(event) => setOrganization(event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} /></label><button type="submit" disabled={requestState === 'loading' || requestState === 'success'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>{requestState === 'loading' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : requestState === 'success' ? <Check className="h-4 w-4" /> : null}{requestState === 'success' ? 'Check your email' : 'Email secure sign-in link'}</button>{requestState === 'success' && <p role="status" className="text-sm" style={{ color: 'var(--muted)' }}>If this address can receive email, the one-time sign-in link is on its way.</p>}{requestState === 'error' && <p role="alert" className="text-sm text-red-300">The sign-in link could not be sent. Please try again.</p>}</form></div>;
}