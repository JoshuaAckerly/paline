import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const nav = [
    { label: 'Home', href: '/' },
    { label: 'Music', href: '/music' },
    { label: 'Shows', href: '/shows' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
            {/* Nav */}
            <header
                style={{ borderBottom: '1px solid var(--border)' }}
                className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
            >
                <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-20">
                    <Link href="/" className="flex items-center">
                        <img src="/logo.png" alt="PA Line" className="h-16 w-auto" />
                    </Link>
                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {nav.map((n) => (
                            <Link
                                key={n.href}
                                href={n.href}
                                className="text-sm font-medium tracking-widest uppercase transition-colors"
                                style={{ color: 'var(--muted)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                            >
                                {n.label}
                            </Link>
                        ))}
                    </nav>
                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden"
                        style={{ color: 'var(--text)' }}
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                    >
                        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
                {/* Mobile menu */}
                {open && (
                    <div
                        style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}
                        className="md:hidden px-6 pb-4 flex flex-col gap-4"
                    >
                        {nav.map((n) => (
                            <Link
                                key={n.href}
                                href={n.href}
                                className="text-sm font-medium tracking-widest uppercase py-2"
                                style={{ color: 'var(--muted)' }}
                                onClick={() => setOpen(false)}
                            >
                                {n.label}
                            </Link>
                        ))}
                    </div>
                )}
            </header>

            {/* Page content */}
            <main className="pt-20">{children}</main>

            {/* Footer */}
            <footer
                style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
                className="mt-24 py-10 text-center text-sm"
            >
                <div className="flex justify-center gap-6 mb-6">
                    <a href="https://www.facebook.com/PALineOfficial" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>Facebook</a>
                    <a href="https://www.instagram.com/palineofficial/" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>Instagram</a>
                    <a href="https://x.com/PALineOfficial" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>X</a>
                    <a href="https://open.spotify.com/artist/2OArsWhucdqcTIh9FenCiO" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>Spotify</a>
                    <a href="https://music.apple.com/us/artist/pa-line/971265800" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>Apple Music</a>
                    <a href="https://www.youtube.com/@palineofficial" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>YouTube</a>
                    <a href="https://music.amazon.com/artists/B01L1B73TC/pa-line" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>Amazon</a>
                </div>
                <p>© {new Date().getFullYear()} PA Line. All rights reserved.</p>
                <p className="mt-2">
                    Site by{' '}
                    <a
                        href="https://graveyardjokes.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary)' }}
                    >
                        Graveyard Jokes Studios
                    </a>
                </p>
            </footer>
        </div>
    );
}
