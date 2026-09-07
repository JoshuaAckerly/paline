import { useState, type FormEvent } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageMeta from '@/Components/PageMeta';

interface VersionRow {
    id: string;
    version: string;
    title: string;
    effective_date: string | null;
    is_active: boolean;
    created_at: string;
}

interface DocumentRow {
    document_key: string;
    label: string;
    active: { id: string; version: string; title: string; effective_date: string | null } | null;
    versions: VersionRow[];
}

const fieldClass = 'w-full border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--primary)]';
const fieldStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };

function NewVersionForm({ documentKey, label }: { documentKey: string; label: string }) {
    const [version, setVersion] = useState('');
    const [title, setTitle] = useState(label);
    const [effectiveDate, setEffectiveDate] = useState('');
    const [content, setContent] = useState('');

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.post('/admin/legal', {
            document_key: documentKey,
            version,
            title,
            effective_date: effectiveDate || null,
            content,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setVersion('');
                setContent('');
            },
        });
    };

    return (
        <form onSubmit={submit} className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-xs font-semibold uppercase">
                    Version label
                    <input required placeholder="2026.09-v2" value={version} onChange={(event) => setVersion(event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} />
                </label>
                <label className="text-xs font-semibold uppercase">
                    Display title
                    <input required value={title} onChange={(event) => setTitle(event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} />
                </label>
                <label className="text-xs font-semibold uppercase">
                    Effective date
                    <input type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} />
                </label>
            </div>
            <label className="text-xs font-semibold uppercase">
                Document content (HTML)
                <textarea required rows={10} value={content} onChange={(event) => setContent(event.target.value)} className={`${fieldClass} mt-2 font-mono text-xs`} style={fieldStyle} />
            </label>
            <button type="submit" className="h-10 w-full max-w-xs px-6 text-xs font-semibold uppercase" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                Save as active version
            </button>
        </form>
    );
}

function DocumentCard({ document }: { document: DocumentRow }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--primary)' }}>{document.label}</h2>
                    <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                        {document.active
                            ? <>Active version: <strong>{document.active.version}</strong>{document.active.effective_date ? ` · effective ${document.active.effective_date}` : ''}</>
                            : 'No active version yet.'}
                    </p>
                </div>
                <button type="button" onClick={() => setExpanded((value) => !value)} className="text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>
                    {expanded ? 'Close' : 'Manage versions'}
                </button>
            </div>

            {expanded && (
                <div className="mt-5 space-y-5">
                    {document.versions.length > 0 && (
                        <div className="overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th className="px-3 py-2 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Version</th>
                                        <th className="px-3 py-2 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Created</th>
                                        <th className="px-3 py-2 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Status</th>
                                        <th className="px-3 py-2" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {document.versions.map((version) => (
                                        <tr key={version.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td className="px-3 py-2">{version.version}</td>
                                            <td className="px-3 py-2" style={{ color: 'var(--muted)' }}>{version.created_at}</td>
                                            <td className="px-3 py-2">{version.is_active ? 'Active' : '—'}</td>
                                            <td className="px-3 py-2 text-right">
                                                {!version.is_active && (
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(`/admin/legal/${version.id}/activate`, {}, { preserveScroll: true })}
                                                        className="text-xs font-semibold uppercase"
                                                        style={{ color: 'var(--primary)' }}
                                                    >
                                                        Make active
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <NewVersionForm documentKey={document.document_key} label={document.label} />
                </div>
            )}
        </div>
    );
}

export default function LegalDocumentsIndex({ documents }: { documents: DocumentRow[] }) {
    return (
        <AdminLayout>
            <PageMeta title="Legal Documents" />
            <h1 className="mb-2 text-xl font-semibold uppercase tracking-widest">Legal Documents</h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                Each save creates a new immutable, versioned document. Older versions stay available and can be reactivated at any time.
            </p>
            <div className="grid gap-4">
                {documents.map((document) => (
                    <DocumentCard key={document.document_key} document={document} />
                ))}
            </div>
        </AdminLayout>
    );
}
