import { Link, router, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import axios from 'axios';

const fullAdminNav = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Messages', href: '/admin/messages' },
    { label: 'Analytics', href: '/admin/analytics' },
    { label: 'Socials', href: '/admin/socials' },
    { label: 'SEO', href: '/admin/seo' },
    { label: 'Prototype Site', href: '/admin/prototype-site' },
];

const prototypeSiteNav = [{ label: 'Prototype Site', href: '/admin/prototype-site' }];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { url, props } = usePage();
    const { isAdmin, canManagePrototypeSite } = (props as unknown as { auth: { isAdmin: boolean; canManagePrototypeSite: boolean } }).auth;
    const nav = isAdmin ? fullAdminNav : prototypeSiteNav;

    const logout = async () => {
        await axios.post('/auth/logout');
        router.visit('/admin/login');
    };

    return (
        <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="flex">
            <aside
                style={{ borderRight: '1px solid var(--border)' }}
                className="w-56 shrink-0 hidden md:flex md:flex-col px-4 py-6"
            >
                <Link href="/admin" className="mb-8 px-2 text-sm font-semibold tracking-widest uppercase" style={{ color: 'var(--primary)' }}>
                    PA Line Admin
                </Link>
                <nav className="flex flex-col gap-1">
                    {nav.map((n) => {
                        const active = n.href === '/admin' ? url === '/admin' : url.startsWith(n.href);

                        return (
                            <Link
                                key={n.href}
                                href={n.href}
                                className="rounded px-3 py-2 text-sm font-medium tracking-wide transition-colors"
                                style={{ color: active ? 'var(--primary)' : 'var(--muted)', backgroundColor: active ? 'var(--bg-card)' : 'transparent' }}
                            >
                                {n.label}
                            </Link>
                        );
                    })}
                </nav>
                <button
                    type="button"
                    onClick={logout}
                    className="mt-auto flex items-center gap-2 rounded px-3 py-2 text-sm font-medium tracking-wide transition-colors"
                    style={{ color: 'var(--muted)' }}
                >
                    <LogOut className="h-4 w-4" /> Log out
                </button>
            </aside>
            <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
        </div>
    );
}
