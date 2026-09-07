import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageMeta from '@/Components/PageMeta';

const sections = [
    { label: 'Messages', href: '/admin/messages', description: 'Contact form submissions.' },
    { label: 'Analytics', href: '/admin/analytics', description: 'Site visits and traffic.' },
    { label: 'Socials', href: '/admin/socials', description: 'Footer social links.' },
    { label: 'SEO', href: '/admin/seo', description: 'Per-page meta, Open Graph, and sitemap settings.' },
    { label: 'Legal Documents', href: '/admin/legal', description: 'Versioned agreements, riders, and NDAs.' },
    { label: 'Booking Access', href: '/admin/booking-access', description: 'Emails allowed into the booking preview.' },
];

export default function AdminDashboard() {
    return (
        <AdminLayout>
            <PageMeta title="Admin" />
            <h1 className="mb-6 text-xl font-semibold uppercase tracking-widest">Dashboard</h1>
            <div className="grid gap-4 sm:grid-cols-2">
                {sections.map((section) => (
                    <Link
                        key={section.href}
                        href={section.href}
                        className="block border p-5 transition-colors hover:border-[var(--primary)]"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
                    >
                        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
                            {section.label}
                        </h2>
                        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                            {section.description}
                        </p>
                    </Link>
                ))}
            </div>
        </AdminLayout>
    );
}
