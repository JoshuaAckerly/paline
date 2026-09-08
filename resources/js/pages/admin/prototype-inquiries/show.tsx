import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageMeta from '@/Components/PageMeta';

interface Inquiry {
    id: string;
    type: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string | null;
    created_at: string;
    payload: {
        lead?: Record<string, unknown>;
        record?: Record<string, unknown>;
    };
}

export default function PrototypeInquiryShow({ inquiry }: { inquiry: Inquiry }) {
    const destroy = () => {
        if (confirm('Delete this inquiry?')) {
            router.delete(`/admin/prototype-inquiries/${inquiry.id}`);
        }
    };

    return (
        <AdminLayout>
            <PageMeta title={`Inquiry from ${inquiry.contact_name}`} />
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold uppercase tracking-widest">{inquiry.contact_name}</h1>
                <button type="button" onClick={destroy} className="text-xs font-semibold uppercase text-red-400">Delete</button>
            </div>
            <div className="space-y-4 border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <div><span className="text-xs uppercase" style={{ color: 'var(--muted)' }}>Type</span><div className="uppercase">{inquiry.type}</div></div>
                <div><span className="text-xs uppercase" style={{ color: 'var(--muted)' }}>Email</span><div>{inquiry.contact_email}</div></div>
                {inquiry.contact_phone && <div><span className="text-xs uppercase" style={{ color: 'var(--muted)' }}>Phone</span><div>{inquiry.contact_phone}</div></div>}
                <div><span className="text-xs uppercase" style={{ color: 'var(--muted)' }}>Received</span><div>{new Date(inquiry.created_at).toLocaleString()}</div></div>
                <div>
                    <span className="text-xs uppercase" style={{ color: 'var(--muted)' }}>Raw submission</span>
                    <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words border p-4 text-xs" style={{ borderColor: 'var(--border)' }}>{JSON.stringify(inquiry.payload, null, 2)}</pre>
                </div>
            </div>
        </AdminLayout>
    );
}
