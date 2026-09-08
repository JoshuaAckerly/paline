import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageMeta from '@/Components/PageMeta';

interface Inquiry {
    id: string;
    type: string;
    contact_name: string;
    contact_email: string;
    is_read: boolean;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

export default function PrototypeInquiriesIndex({ inquiries, unreadCount }: { inquiries: Paginated<Inquiry>; unreadCount: number }) {
    return (
        <AdminLayout>
            <PageMeta title="Booking Site Inquiries" />
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold uppercase tracking-widest">Booking Site Inquiries</h1>
                <span className="text-sm" style={{ color: 'var(--muted)' }}>{unreadCount} unread</span>
            </div>
            <div className="overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th className="px-4 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>From</th>
                            <th className="px-4 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Type</th>
                            <th className="px-4 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Received</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inquiries.data.map((inquiry) => (
                            <tr key={inquiry.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td className="px-4 py-3">
                                    <Link href={`/admin/prototype-inquiries/${inquiry.id}`} className="font-medium" style={{ color: inquiry.is_read ? 'var(--text)' : 'var(--primary)' }}>
                                        {inquiry.contact_name}
                                    </Link>
                                    <div style={{ color: 'var(--muted)' }}>{inquiry.contact_email}</div>
                                </td>
                                <td className="px-4 py-3 uppercase">{inquiry.type}</td>
                                <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>{new Date(inquiry.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                        {inquiries.data.length === 0 && (
                            <tr><td colSpan={3} className="px-4 py-6 text-center" style={{ color: 'var(--muted)' }}>No inquiries yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {inquiries.links.length > 3 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {inquiries.links.map((link, index) => (
                        <Link key={index} href={link.url ?? '#'} className={`px-3 py-1 text-sm ${link.url ? '' : 'pointer-events-none opacity-40'}`} style={{ color: link.active ? 'var(--primary)' : 'var(--muted)' }} dangerouslySetInnerHTML={{ __html: link.label }} />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
