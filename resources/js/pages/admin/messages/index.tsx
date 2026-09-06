import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageMeta from '@/Components/PageMeta';

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string | null;
    is_read: boolean;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

export default function MessagesIndex({ messages, unreadCount }: { messages: Paginated<ContactMessage>; unreadCount: number }) {
    return (
        <AdminLayout>
            <PageMeta title="Messages" />
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold uppercase tracking-widest">Messages</h1>
                <span className="text-sm" style={{ color: 'var(--muted)' }}>
                    {unreadCount} unread
                </span>
            </div>
            <div className="overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th className="px-4 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>From</th>
                            <th className="px-4 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Subject</th>
                            <th className="px-4 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Received</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.data.map((message) => (
                            <tr key={message.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td className="px-4 py-3">
                                    <Link
                                        href={`/admin/messages/${message.id}`}
                                        className="font-medium"
                                        style={{ color: message.is_read ? 'var(--text)' : 'var(--primary)' }}
                                    >
                                        {message.name}
                                    </Link>
                                    <div style={{ color: 'var(--muted)' }}>{message.email}</div>
                                </td>
                                <td className="px-4 py-3">{message.subject ?? '—'}</td>
                                <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>
                                    {new Date(message.created_at).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {messages.data.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-4 py-6 text-center" style={{ color: 'var(--muted)' }}>
                                    No messages yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {messages.links.length > 3 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {messages.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url ?? '#'}
                            className={`px-3 py-1 text-sm ${link.url ? '' : 'pointer-events-none opacity-40'}`}
                            style={{ color: link.active ? 'var(--primary)' : 'var(--muted)' }}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
