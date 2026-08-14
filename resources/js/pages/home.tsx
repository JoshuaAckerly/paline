import { motion } from 'framer-motion';
import { ChevronDown, Clock, MapPin } from 'lucide-react';
import MainLayout from '@/Layouts/MainLayout';
import PageMeta from '@/Components/PageMeta';
import { Link } from '@inertiajs/react';

interface Show {
    summary: string;
    date: string;
    time: string | null;
    location: string | null;
    url: string | null;
    ts: number;
}

export default function Home({ upcomingShows }: { upcomingShows: Show[] }) {
    return (
        <MainLayout>
            <PageMeta description="PA Line — True Grit Americana Folk from Western New York. Stream music, see upcoming shows, and get in touch." />
            {/* Hero */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                {/* Hero background photo */}
                <div className="absolute inset-0">
                    <img
                        src="/images/FB_IMG_1780195233682.jpg"
                        alt="PA Line live"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(26,20,16,0.55) 0%, rgba(26,20,16,0.75) 60%, rgba(26,20,16,1) 100%)' }} />
                </div>
                {/* Grain texture overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '200px 200px',
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="relative z-10 flex flex-col items-center"
                >
                    <img
                        src="/logo.png"
                        alt="PA Line"
                        className="w-72 md:w-96 mb-10"
                        style={{ mixBlendMode: 'screen' }}
                    />
                    <p
                        className="text-base md:text-lg tracking-[0.3em] uppercase mb-10"
                        style={{ color: 'var(--muted)' }}
                    >
                        True Grit Americana
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/music"
                            className="px-8 py-3 text-sm font-semibold tracking-widest uppercase transition-all"
                            style={{
                                backgroundColor: 'var(--primary)',
                                color: '#1a1410',
                            }}
                        >
                            Listen Now
                        </Link>
                        <Link
                            href="/shows"
                            className="px-8 py-3 text-sm font-semibold tracking-widest uppercase border transition-all"
                            style={{
                                borderColor: 'var(--border)',
                                color: 'var(--text)',
                            }}
                        >
                            Shows
                        </Link>
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <ChevronDown style={{ color: 'var(--border)' }} className="h-6 w-6" />
                </motion.div>
            </section>

            {/* Latest section */}
            <section className="max-w-4xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-10"
                    >
                        <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--primary)' }}>
                            Latest
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text)' }}>
                            New Music
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        <iframe
                            src="https://open.spotify.com/embed/artist/2OArsWhucdqcTIh9FenCiO?utm_source=generator&theme=0"
                            width="100%"
                            height="160"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            style={{ borderRadius: '4px', border: '1px solid var(--border)', display: 'block' }}
                        />
                        <div className="mt-4 text-center">
                            <Link href="/music" className="text-sm" style={{ color: 'var(--primary)' }}>
                                View all music →
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* Shows teaser */}
                <section
                    style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
                    className="py-20 px-6"
                >
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="text-center mb-10"
                        >
                            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--primary)' }}>
                                On the Road
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text)' }}>
                                Upcoming Shows
                            </h2>
                        </motion.div>

                        {upcomingShows.length === 0 ? (
                            <p className="text-center text-sm mb-8" style={{ color: 'var(--muted)' }}>More dates coming soon.</p>
                        ) : (
                            <div className="space-y-3 mb-8">
                                {upcomingShows.map((show, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 12 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: i * 0.06 }}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 border rounded"
                                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
                                    >
                                        <p className="font-semibold" style={{ fontFamily: "'six-hands', serif", color: 'var(--text)' }}>
                                            {show.summary}
                                        </p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                                            <span className="text-sm" style={{ color: 'var(--primary)' }}>{show.date}</span>
                                            {show.time && (
                                                <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
                                                    <Clock className="h-3 w-3" />{show.time}
                                                </span>
                                            )}
                                            {show.location && (
                                                <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
                                                    <MapPin className="h-3 w-3" />{show.location}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <div className="text-center">
                            <Link
                                href="/shows"
                                className="inline-block px-8 py-3 text-sm font-semibold tracking-widest uppercase border transition-all"
                                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                            >
                                See All Dates
                            </Link>
                        </div>
                    </div>
                </section>
        </MainLayout>
    );
}
