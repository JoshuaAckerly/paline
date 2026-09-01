import PageMeta from '@/Components/PageMeta';
import MainLayout from '@/Layouts/MainLayout';
import axios from 'axios';
import { ArrowLeft, ArrowRight, CalendarDays, Check, LoaderCircle, MapPin, RotateCcw, Sparkles, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';

type Path = 'start' | 'exact' | 'flexible' | 'demand' | 'returning';
type AvailabilityState = 'available' | 'limited' | 'held' | 'blocked';
type RequestState = 'idle' | 'loading' | 'success' | 'error';

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
                                <button type="button" onClick={() => setPath('start')} aria-label="Start over" className="flex h-11 w-11 items-center justify-center border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                            </div>
                            {path === 'exact' && <ExactDate />}
                            {path === 'flexible' && <FlexibleDate />}
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

function ExactDate() {
    const [date, setDate] = useState('');
    const [requestState, setRequestState] = useState<RequestState>('idle');
    const [availability, setAvailability] = useState<AvailabilityState | null>(null);

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
                <input id="booking-date" type="date" required value={date} onChange={(event) => setDate(event.target.value)} className={fieldClass} style={fieldStyle} />
                <button type="submit" disabled={requestState === 'loading'} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                    {requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Check availability
                </button>
                {requestState === 'success' && availability && <div role="status" className="mt-5 border-l-2 p-4" style={{ borderColor: availability === 'available' ? '#69c587' : 'var(--primary)', backgroundColor: 'var(--bg)' }}><strong className="uppercase">{availability}</strong><p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{messages[availability]}</p></div>}
                {requestState === 'error' && <p role="alert" className="mt-4 text-sm text-red-300">We couldn’t verify the calendar. Try again; no availability claim has been made.</p>}
            </form>
        </div>
    );
}

function FlexibleDate() {
    return <div className="max-w-2xl"><FlowHeader eyebrow="Flexible date · Step 1" title="Find the sweet spot." description="Tell us where and when. Route suggestions will preserve your original preferences and never silently replace them." /><div className="grid gap-5 border p-6 md:grid-cols-2 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}><label className="text-xs font-semibold uppercase">City<input className={`${fieldClass} mt-2`} style={fieldStyle} /></label><label className="text-xs font-semibold uppercase">State<input className={`${fieldClass} mt-2`} style={fieldStyle} maxLength={64} /></label><label className="text-xs font-semibold uppercase">Window starts<input type="date" className={`${fieldClass} mt-2`} style={fieldStyle} /></label><label className="text-xs font-semibold uppercase">Window ends<input type="date" className={`${fieldClass} mt-2`} style={fieldStyle} /></label><p className="md:col-span-2 text-sm" style={{ color: 'var(--muted)' }}>Live route-ranked suggestions are the next production connection. Your entries remain editable.</p></div></div>;
}

function Demand() {
    return <div className="max-w-2xl"><FlowHeader eyebrow="Demand · Step 1" title="Get PA LINE over here." description="Tell us where the demand is building. This is a demand signal, not a booking confirmation." /><div className="grid gap-5 border p-6 md:grid-cols-2 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}><label className="text-xs font-semibold uppercase">City<input className={`${fieldClass} mt-2`} style={fieldStyle} /></label><label className="text-xs font-semibold uppercase">State<input className={`${fieldClass} mt-2`} style={fieldStyle} /></label><label className="text-xs font-semibold uppercase md:col-span-2">Venue idea<input className={`${fieldClass} mt-2`} style={fieldStyle} /></label></div></div>;
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