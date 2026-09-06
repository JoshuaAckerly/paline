import { useState, type FormEvent } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Check, LoaderCircle } from 'lucide-react';
import PageMeta from '@/Components/PageMeta';

const fieldClass = 'w-full border px-4 py-3 text-base outline-none transition-colors focus:border-[var(--primary)]';
const fieldStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };

function PasswordLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        router.post(
            '/admin/login',
            { email, password },
            {
                onError: (errors) => setError(errors.email ?? 'Sign-in failed.'),
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <form onSubmit={submit} className="space-y-4 border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <label htmlFor="admin-email" className="block text-xs font-semibold uppercase">
                Email
                <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={`${fieldClass} mt-2`}
                    style={fieldStyle}
                />
            </label>
            <label htmlFor="admin-password" className="block text-xs font-semibold uppercase">
                Password
                <input
                    id="admin-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={`${fieldClass} mt-2`}
                    style={fieldStyle}
                />
            </label>
            <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}
            >
                {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Sign in
            </button>
            {error && (
                <p role="alert" className="text-sm text-red-300">
                    {error}
                </p>
            )}
        </form>
    );
}

type RequestState = 'idle' | 'loading' | 'success' | 'error';

function MagicLinkLogin() {
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
        <form onSubmit={requestLink} className="space-y-4 border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <label htmlFor="admin-email" className="block text-xs font-semibold uppercase">
                Email
                <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
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
                {requestState === 'success' ? 'Check your email' : 'Email sign-in link'}
            </button>
            {requestState === 'success' && (
                <p role="status" className="text-sm" style={{ color: 'var(--muted)' }}>
                    If that address can receive email, the sign-in link is on its way.
                </p>
            )}
            {requestState === 'error' && (
                <p role="alert" className="text-sm text-red-300">
                    The sign-in link could not be sent. Please try again.
                </p>
            )}
        </form>
    );
}

export default function AdminLogin({ authMethod }: { authMethod: 'password' | 'magic-link' }) {
    return (
        <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="flex items-center justify-center px-6">
            <PageMeta title="Admin Login" />
            <div className="w-full max-w-sm">
                <h1 className="mb-1 text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                    PA Line Admin
                </h1>
                <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                    {authMethod === 'password' ? 'Sign in with your admin email and password.' : 'Sign in with the admin email to get a one-time link.'}
                </p>
                {authMethod === 'password' ? <PasswordLogin /> : <MagicLinkLogin />}
            </div>
        </div>
    );
}
