import { useRef, useState, type FormEvent } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageMeta from '@/Components/PageMeta';

interface VersionRow {
    id: string;
    original_filename: string;
    uploaded_by_email: string;
    notes: string | null;
    status: 'staged' | 'published' | 'archived';
    published_at: string | null;
    created_at: string;
}

const fieldClass = 'w-full border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--primary)]';
const fieldStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };

const statusLabels: Record<VersionRow['status'], string> = {
    staged: 'Staged',
    published: 'Live',
    archived: 'Archived',
};

function UploadForm() {
    const fileInput = useRef<HTMLInputElement>(null);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const file = fileInput.current?.files?.[0];

        if (!file) {
            setError('Choose an HTML file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('notes', notes);

        setSubmitting(true);
        setError(null);

        router.post('/admin/prototype-site', formData, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => setError(errors.file ?? 'Upload failed.'),
            onSuccess: () => {
                setNotes('');
                if (fileInput.current) fileInput.current.value = '';
            },
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-3 border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <label className="text-xs font-semibold uppercase">
                Prototype HTML file
                <input ref={fileInput} type="file" accept=".html,.htm" required className={`${fieldClass} mt-2`} style={fieldStyle} />
            </label>
            <label className="text-xs font-semibold uppercase">
                What changed? (optional)
                <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} />
            </label>
            <button
                type="submit"
                disabled={submitting}
                className="h-10 w-full max-w-xs px-6 text-xs font-semibold uppercase disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}
            >
                Upload &amp; stage for preview
            </button>
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        </form>
    );
}

function VersionsTable({ versions }: { versions: VersionRow[] }) {
    return (
        <div className="overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-left text-sm">
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th className="px-3 py-2 font-semibold uppercase" style={{ color: 'var(--muted)' }}>File</th>
                        <th className="px-3 py-2 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Uploaded by</th>
                        <th className="px-3 py-2 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Notes</th>
                        <th className="px-3 py-2 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Status</th>
                        <th className="px-3 py-2" />
                    </tr>
                </thead>
                <tbody>
                    {versions.map((version) => (
                        <tr key={version.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="px-3 py-2">{version.original_filename}</td>
                            <td className="px-3 py-2" style={{ color: 'var(--muted)' }}>{version.uploaded_by_email}</td>
                            <td className="px-3 py-2" style={{ color: 'var(--muted)' }}>{version.notes ?? '—'}</td>
                            <td className="px-3 py-2">{statusLabels[version.status]}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">
                                <a
                                    href={`/admin/prototype-site/${version.id}/preview`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mr-4 text-xs font-semibold uppercase"
                                    style={{ color: 'var(--primary)' }}
                                >
                                    Preview
                                </a>
                                {version.status !== 'published' && (
                                    <button
                                        type="button"
                                        onClick={() => router.post(`/admin/prototype-site/${version.id}/publish`, {}, { preserveScroll: true })}
                                        className="text-xs font-semibold uppercase"
                                        style={{ color: 'var(--primary)' }}
                                    >
                                        Publish live
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function PrototypeSiteEdit({ versions }: { versions: VersionRow[] }) {
    return (
        <AdminLayout>
            <PageMeta title="Prototype Site" />
            <h1 className="mb-2 text-xl font-semibold uppercase tracking-widest">Prototype Site</h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                Upload the latest exported prototype HTML. It's staged first — preview it, then publish when it's ready to
                go live at demo.palineofficial.com. Publishing an older version again is how to roll back.
            </p>
            <div className="grid gap-6">
                <UploadForm />
                {versions.length > 0 ? (
                    <VersionsTable versions={versions} />
                ) : (
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>No versions uploaded yet.</p>
                )}
            </div>
        </AdminLayout>
    );
}
