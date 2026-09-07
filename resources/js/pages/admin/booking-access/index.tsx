import { useState, type FormEvent } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageMeta from '@/Components/PageMeta';

interface AllowedEmail {
    id: number;
    email: string;
    note: string | null;
    created_at: string;
}

const fieldClass = 'w-full border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--primary)]';
const fieldStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };

function EmailRow({ email }: { email: AllowedEmail }) {
    const destroy = () => {
        if (confirm(`Remove access for ${email.email}?`)) {
            router.delete(`/admin/booking-access/${email.id}`);
        }
    };

    return (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <td className="px-3 py-2">{email.email}</td>
            <td className="px-3 py-2" style={{ color: 'var(--muted)' }}>{email.note ?? '—'}</td>
            <td className="px-3 py-2 whitespace-nowrap">
                <button type="button" onClick={destroy} className="text-xs font-semibold uppercase" style={{ color: 'var(--muted)' }}>
                    Remove
                </button>
            </td>
        </tr>
    );
}

function AddEmailForm() {
    const [email, setEmail] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState<string | null>(null);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        router.post('/admin/booking-access', { email, note: note || undefined }, {
            onSuccess: () => { setEmail(''); setNote(''); },
            onError: (errors) => setError(errors.email ?? 'Could not add that email.'),
        });
    };

    return (
        <form onSubmit={submit} className="mt-6 flex flex-wrap items-end gap-3">
            <label className="text-xs font-semibold uppercase">
                Email
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={`${fieldClass} mt-2 w-64`} style={fieldStyle} />
            </label>
            <label className="text-xs font-semibold uppercase">
                Note (optional)
                <input value={note} onChange={(event) => setNote(event.target.value)} className={`${fieldClass} mt-2 w-64`} style={fieldStyle} />
            </label>
            <button type="submit" className="h-9 px-4 text-xs font-semibold uppercase" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                Add
            </button>
            {error && <p className="w-full text-xs" style={{ color: '#e0876b' }}>{error}</p>}
        </form>
    );
}

export default function BookingAccessIndex({ emails }: { emails: AllowedEmail[] }) {
    return (
        <AdminLayout>
            <PageMeta title="Booking Access" />
            <h1 className="mb-2 text-xl font-semibold uppercase tracking-widest">Booking Access</h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                Only these emails can sign in and reach the booking preview at /booking. Visitors verify ownership via a magic-link email before the check runs.
            </p>
            <div className="overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th className="px-3 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Email</th>
                            <th className="px-3 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Note</th>
                            <th className="px-3 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {emails.map((email) => (
                            <EmailRow key={email.id} email={email} />
                        ))}
                        {emails.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-3 py-4 text-sm" style={{ color: 'var(--muted)' }}>No approved emails yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <AddEmailForm />
        </AdminLayout>
    );
}
