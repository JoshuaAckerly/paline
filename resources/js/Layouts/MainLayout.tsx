import { Link, router } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const nav = [
    { label: 'Home', href: '/' },
    { label: 'Music', href: '/music' },
    { label: 'Shows', href: '/shows' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    // Close mobile menu on Inertia navigation
    useEffect(() => {
        const unsubscribe = router.on('start', () => setOpen(false));
        return () => unsubscribe();
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
            {/* Nav */}
            <header
                style={{ borderBottom: '1px solid var(--border)' }}
                className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
            >
                {/* pl/pr use safe-area-inset so content isn't hidden behind notches */}
                <div
                    className="mx-auto max-w-6xl flex items-center justify-between h-16 md:h-20"
                    style={{
                        paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
                        paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
                    }}
                >
                    <Link href="/" className="flex items-center" style={{ WebkitTapHighlightColor: 'transparent' }}>
                        <img src="/logo.png" alt="PA Line" className="h-12 md:h-16 w-auto" />
                    </Link>
                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {nav.map((n) => (
                            <Link
                                key={n.href}
                                href={n.href}
                                className="text-sm font-medium tracking-widest uppercase transition-colors"
                                style={{ color: 'var(--muted)', WebkitTapHighlightColor: 'transparent' }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                            >
                                {n.label}
                            </Link>
                        ))}
                    </nav>
                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 -mr-2"
                        style={{ color: 'var(--text)', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                        onClick={() => setOpen(!open)}
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        aria-expanded={open}
                    >
                        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile menu — animated slide down */}
                <div
                    style={{
                        borderTop: '1px solid var(--border)',
                        backgroundColor: 'var(--bg)',
                        maxHeight: open ? '400px' : '0px',
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease',
                        paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
                        paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
                        paddingBottom: open ? '1rem' : '0',
                    }}
                    aria-hidden={!open}
                >
                    <nav className="flex flex-col gap-1 pt-2">
                        {nav.map((n) => (
                            <Link
                                key={n.href}
                                href={n.href}
                                className="text-sm font-medium tracking-widest uppercase py-3 px-2 transition-colors rounded"
                                style={{ color: 'var(--muted)', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                                onClick={() => setOpen(false)}
                            >
                                {n.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Page content — safe-area top accounts for notch + header */}
            <main
                className="pt-16 md:pt-20"
                style={{
                    paddingLeft: 'env(safe-area-inset-left)',
                    paddingRight: 'env(safe-area-inset-right)',
                }}
            >
                {children}
            </main>

            {/* Footer */}
            <footer
                style={{
                    borderTop: '1px solid var(--border)',
                    color: 'var(--muted)',
                    paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
                    paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
                    paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))',
                }}
                className="mt-24 pt-10 text-center text-sm"
            >
                {/* Social links — wrap on small screens */}
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 mb-6">
                    <a
                        href="https://www.facebook.com/PALineOfficial"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs tracking-widest uppercase transition-colors hover:text-white"
                        style={{ color: 'var(--muted)', WebkitTapHighlightColor: 'transparent' }}
                    >
                        Facebook
                    </a>
                    <a
                        href="https://www.instagram.com/palineofficial/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs tracking-widest uppercase transition-colors hover:text-white"
                        style={{ color: 'var(--muted)', WebkitTapHighlightColor: 'transparent' }}
                    >
                        Instagram
                    </a>
                    <a
                        href="https://x.com/PALineOfficial"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs tracking-widest uppercase transition-colors hover:text-white"
                        style={{ color: 'var(--muted)', WebkitTapHighlightColor: 'transparent' }}
                    >
                        X
                    </a>
                    <a
                        href="https://open.spotify.com/artist/2OArsWhucdqcTIh9FenCiO"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs tracking-widest uppercase transition-colors hover:text-white"
                        style={{ color: 'var(--muted)', WebkitTapHighlightColor: 'transparent' }}
                    >
                        Spotify
                    </a>
                    <a
                        href="https://music.apple.com/us/artist/pa-line/971265800"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs tracking-widest uppercase transition-colors hover:text-white"
                        style={{ color: 'var(--muted)', WebkitTapHighlightColor: 'transparent' }}
                    >
                        Apple Music
                    </a>
                    <a
                        href="https://www.youtube.com/@palineofficial"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs tracking-widest uppercase transition-colors hover:text-white"
                        style={{ color: 'var(--muted)', WebkitTapHighlightColor: 'transparent' }}
                    >
                        YouTube
                    </a>
                    <a
                        href="https://music.amazon.com/artists/B01L1B73TC/pa-line"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs tracking-widest uppercase transition-colors hover:text-white"
                        style={{ color: 'var(--muted)', WebkitTapHighlightColor: 'transparent' }}
                    >
                        Amazon
                    </a>
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
