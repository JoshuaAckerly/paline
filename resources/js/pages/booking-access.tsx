import PageMeta from '@/Components/PageMeta';
import MainLayout from '@/Layouts/MainLayout';
import axios from 'axios';
import { Check, LoaderCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';

type RequestState = 'idle' | 'loading' | 'success' | 'error';

const fieldClass = 'w-full border px-4 py-3 text-base outline-none transition-colors focus:border-[var(--primary)]';
const fieldStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };

export default function BookingAccess({ denied }: { denied: boolean }) {
    const [email, setEmail] = useState('');
    const [requestState, setRequestState] = useState<RequestState>('idle');

    const requestLink = async (event: FormEvent) => {
        event.preventDefault();
        setRequestState('loading');
        try {
            await axios.post('/auth/magic-link', { email });
            setRequestState('success');
        } catch {
            setRequestState('error');
        }
    };

    return (
        <MainLayout>
            <PageMeta title="Booking Preview Access" description="Sign in to access the PA LINE booking preview." />
            <div className="mx-auto max-w-lg px-6 py-16 md:py-24">
                <p className="mb-4 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>PA LINE Booking</p>
                <h1 className="text-4xl font-bold md:text-5xl">Preview access.</h1>
                <p className="mt-4 leading-7" style={{ color: 'var(--muted)' }}>
                    The booking app is currently limited to approved testers. Enter your email and we’ll send a secure sign-in link.
                </p>

                {denied && (
                    <div role="alert" className="mt-6 border-l-2 p-4 text-sm" style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg-card)', color: 'var(--muted)' }}>
                        That email isn’t approved for the booking preview yet. Contact PA LINE, or try a different address below.
                    </div>
                )}

                <form onSubmit={requestLink} className="mt-8 space-y-5 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                    <label htmlFor="access-email" className="block text-xs font-semibold uppercase">
                        Email
                        <input
                            id="access-email"
                            type="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            className={`${fieldClass} mt-2`}
                            style={fieldStyle}
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={requestState === 'loading' || requestState === 'success'}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50"
                        style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}
                    >
                        {requestState === 'loading' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : requestState === 'success' ? <Check className="h-4 w-4" /> : null}
                        {requestState === 'success' ? 'Check your email' : 'Email me a secure link'}
                    </button>
                    {requestState === 'success' && (
                        <p role="status" className="text-sm" style={{ color: 'var(--muted)' }}>
                            If that address is approved, a one-time sign-in link is on its way.
                        </p>
                    )}
                    {requestState === 'error' && (
                        <p role="alert" className="text-sm text-red-300">The sign-in link could not be sent. Please try again.</p>
                    )}
                </form>
            </div>
        </MainLayout>
    );
}
