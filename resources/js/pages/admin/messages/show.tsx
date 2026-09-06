import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageMeta from '@/Components/PageMeta';

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    created_at: string;
}

export default function MessageShow({ message }: { message: ContactMessage }) {
    const destroy = () => {
        if (confirm('Delete this message?')) {
            router.delete(`/admin/messages/${message.id}`);
        }
    };

    return (
        <AdminLayout>
            <PageMeta title={message.subject ?? 'Message'} />
            <Link href="/admin/messages" className="text-sm" style={{ color: 'var(--muted)' }}>
                &larr; Back to messages
            </Link>
            <div className="mt-4 border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <h1 className="text-lg font-semibold">{message.subject ?? 'No subject'}</h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                    {message.name} &lt;{message.email}&gt; &middot; {new Date(message.created_at).toLocaleString()}
                </p>
                <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
                <button
                    type="button"
                    onClick={destroy}
                    className="mt-8 border px-4 py-2 text-xs font-semibold uppercase"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                    Delete
                </button>
            </div>
        </AdminLayout>
    );
}
