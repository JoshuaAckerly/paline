import { useState, type FormEvent } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageMeta from '@/Components/PageMeta';

interface PageSeoRow {
    page_key: string;
    page_label: string;
    page_url: string;
    title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    robots: string;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    og_type: string;
    twitter_card: string;
    twitter_title: string | null;
    twitter_description: string | null;
    twitter_image: string | null;
    schema_json: Record<string, unknown> | null;
    sitemap_priority: string;
    sitemap_change_freq: string;
}

const fieldClass = 'w-full border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--primary)]';
const fieldStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };

function Field({
    label, value, onChange, textarea = false,
}: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
    return (
        <label className="block text-xs font-semibold uppercase">
            {label}
            {textarea ? (
                <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className={`${fieldClass} mt-2`} style={fieldStyle} />
            ) : (
                <input value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} />
            )}
        </label>
    );
}

export default function SeoEdit({ page }: { page: PageSeoRow }) {
    const [form, setForm] = useState({
        title: page.title ?? '',
        meta_description: page.meta_description ?? '',
        canonical_url: page.canonical_url ?? '',
        robots: page.robots,
        og_title: page.og_title ?? '',
        og_description: page.og_description ?? '',
        og_image: page.og_image ?? '',
        og_type: page.og_type,
        twitter_card: page.twitter_card,
        twitter_title: page.twitter_title ?? '',
        twitter_description: page.twitter_description ?? '',
        twitter_image: page.twitter_image ?? '',
        schema_json: page.schema_json ? JSON.stringify(page.schema_json, null, 2) : '',
        sitemap_priority: page.sitemap_priority,
        sitemap_change_freq: page.sitemap_change_freq,
    });

    const update = (field: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.put(`/admin/seo/${page.page_key}`, form, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <PageMeta title={`SEO — ${page.page_label}`} />
            <Link href="/admin/seo" className="text-sm" style={{ color: 'var(--muted)' }}>
                &larr; Back to SEO
            </Link>
            <h1 className="mt-4 mb-6 text-xl font-semibold uppercase tracking-widest">
                {page.page_label} <span style={{ color: 'var(--muted)' }}>{page.page_url}</span>
            </h1>
            <form onSubmit={submit} className="grid max-w-3xl gap-8">
                <fieldset className="grid gap-4">
                    <legend className="mb-2 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>Core</legend>
                    <Field label="Title" value={form.title} onChange={(v) => update('title', v)} />
                    <Field label="Meta description" value={form.meta_description} onChange={(v) => update('meta_description', v)} textarea />
                    <Field label="Canonical URL" value={form.canonical_url} onChange={(v) => update('canonical_url', v)} />
                    <label className="block text-xs font-semibold uppercase">
                        Robots
                        <select value={form.robots} onChange={(event) => update('robots', event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle}>
                            <option value="index,follow">index, follow</option>
                            <option value="index,nofollow">index, nofollow</option>
                            <option value="noindex,follow">noindex, follow</option>
                            <option value="noindex,nofollow">noindex, nofollow</option>
                        </select>
                    </label>
                </fieldset>

                <fieldset className="grid gap-4">
                    <legend className="mb-2 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>Open Graph</legend>
                    <Field label="OG title" value={form.og_title} onChange={(v) => update('og_title', v)} />
                    <Field label="OG description" value={form.og_description} onChange={(v) => update('og_description', v)} textarea />
                    <Field label="OG image URL" value={form.og_image} onChange={(v) => update('og_image', v)} />
                    <Field label="OG type" value={form.og_type} onChange={(v) => update('og_type', v)} />
                </fieldset>

                <fieldset className="grid gap-4">
                    <legend className="mb-2 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>Twitter</legend>
                    <label className="block text-xs font-semibold uppercase">
                        Card type
                        <select value={form.twitter_card} onChange={(event) => update('twitter_card', event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle}>
                            <option value="summary">summary</option>
                            <option value="summary_large_image">summary_large_image</option>
                        </select>
                    </label>
                    <Field label="Twitter title" value={form.twitter_title} onChange={(v) => update('twitter_title', v)} />
                    <Field label="Twitter description" value={form.twitter_description} onChange={(v) => update('twitter_description', v)} textarea />
                    <Field label="Twitter image URL" value={form.twitter_image} onChange={(v) => update('twitter_image', v)} />
                </fieldset>

                <fieldset className="grid gap-4">
                    <legend className="mb-2 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>Structured data & sitemap</legend>
                    <Field label="Schema.org JSON-LD" value={form.schema_json} onChange={(v) => update('schema_json', v)} textarea />
                    <Field label="Sitemap priority (0-1)" value={form.sitemap_priority} onChange={(v) => update('sitemap_priority', v)} />
                    <label className="block text-xs font-semibold uppercase">
                        Sitemap change frequency
                        <select value={form.sitemap_change_freq} onChange={(event) => update('sitemap_change_freq', event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle}>
                            {['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map((freq) => (
                                <option key={freq} value={freq}>{freq}</option>
                            ))}
                        </select>
                    </label>
                </fieldset>

                <button type="submit" className="h-11 w-full max-w-xs px-6 text-sm font-semibold uppercase" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                    Save
                </button>
            </form>
        </AdminLayout>
    );
}
