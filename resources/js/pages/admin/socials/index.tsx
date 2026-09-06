import { useState, type FormEvent } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageMeta from '@/Components/PageMeta';

interface SocialLink {
    id: number;
    platform: string;
    url: string;
    display_order: number;
    is_active: boolean;
}

const fieldClass = 'w-full border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--primary)]';
const fieldStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };

function LinkRow({ link }: { link: SocialLink }) {
    const [platform, setPlatform] = useState(link.platform);
    const [url, setUrl] = useState(link.url);
    const [displayOrder, setDisplayOrder] = useState(link.display_order);
    const [isActive, setIsActive] = useState(link.is_active);

    const save = () => {
        router.put(`/admin/socials/${link.id}`, {
            platform,
            url,
            display_order: displayOrder,
            is_active: isActive,
        });
    };

    const destroy = () => {
        if (confirm(`Remove ${link.platform}?`)) {
            router.delete(`/admin/socials/${link.id}`);
        }
    };

    return (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <td className="px-3 py-2">
                <input value={platform} onChange={(event) => setPlatform(event.target.value)} className={fieldClass} style={fieldStyle} />
            </td>
            <td className="px-3 py-2">
                <input value={url} onChange={(event) => setUrl(event.target.value)} className={fieldClass} style={fieldStyle} />
            </td>
            <td className="px-3 py-2">
                <input
                    type="number"
                    value={displayOrder}
                    onChange={(event) => setDisplayOrder(Number(event.target.value))}
                    className={`${fieldClass} w-20`}
                    style={fieldStyle}
                />
            </td>
            <td className="px-3 py-2 text-center">
                <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
                <button type="button" onClick={save} className="mr-2 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>
                    Save
                </button>
                <button type="button" onClick={destroy} className="text-xs font-semibold uppercase" style={{ color: 'var(--muted)' }}>
                    Remove
                </button>
            </td>
        </tr>
    );
}

function AddLinkForm() {
    const [platform, setPlatform] = useState('');
    const [url, setUrl] = useState('');

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.post('/admin/socials', { platform, url }, { onSuccess: () => { setPlatform(''); setUrl(''); } });
    };

    return (
        <form onSubmit={submit} className="mt-6 flex flex-wrap items-end gap-3">
            <label className="text-xs font-semibold uppercase">
                Platform
                <input required value={platform} onChange={(event) => setPlatform(event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} />
            </label>
            <label className="text-xs font-semibold uppercase">
                URL
                <input required type="url" value={url} onChange={(event) => setUrl(event.target.value)} className={`${fieldClass} mt-2 w-64`} style={fieldStyle} />
            </label>
            <button type="submit" className="h-9 px-4 text-xs font-semibold uppercase" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                Add
            </button>
        </form>
    );
}

export default function SocialsIndex({ links }: { links: SocialLink[] }) {
    return (
        <AdminLayout>
            <PageMeta title="Socials" />
            <h1 className="mb-6 text-xl font-semibold uppercase tracking-widest">Socials</h1>
            <div className="overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th className="px-3 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Platform</th>
                            <th className="px-3 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>URL</th>
                            <th className="px-3 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Order</th>
                            <th className="px-3 py-3 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Active</th>
                            <th className="px-3 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {links.map((link) => (
                            <LinkRow key={link.id} link={link} />
                        ))}
                    </tbody>
                </table>
            </div>
            <AddLinkForm />
        </AdminLayout>
    );
}
