import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageMeta from '@/Components/PageMeta';

interface PageSeoRow {
    page_key: string;
    page_label: string;
    page_url: string;
    title: string | null;
    meta_description: string | null;
    robots: string;
}

function StatusDot({ ok }: { ok: boolean }) {
    return (
        <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: ok ? '#69c587' : 'var(--border)' }}
        />
    );
}

export default function SeoIndex({ pages, complete, total }: { pages: PageSeoRow[]; complete: number; total: number }) {
    return (
        <AdminLayout>
            <PageMeta title="SEO" />
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold uppercase tracking-widest">SEO</h1>
                <span className="text-sm" style={{ color: 'var(--muted)' }}>
                    {complete} / {total} pages complete
                </span>
            </div>
            <div className="overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th className="px-4 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Page</th>
                            <th className="px-4 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Title</th>
                            <th className="px-4 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Description</th>
                            <th className="px-4 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Robots</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map((page) => (
                            <tr key={page.page_key} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td className="px-4 py-3">
                                    {page.page_label}
                                    <div style={{ color: 'var(--muted)' }}>{page.page_url}</div>
                                </td>
                                <td className="px-4 py-3"><StatusDot ok={!!page.title} /></td>
                                <td className="px-4 py-3"><StatusDot ok={!!page.meta_description} /></td>
                                <td className="px-4 py-3" style={{ color: page.robots.startsWith('noindex') ? '#e0876b' : 'var(--muted)' }}>
                                    {page.robots}
                                </td>
                                <td className="px-4 py-3">
                                    <Link href={`/admin/seo/${page.page_key}/edit`} className="text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
