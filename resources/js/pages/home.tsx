import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import MainLayout from '@/Layouts/MainLayout';
import { Link } from '@inertiajs/react';

export default function Home() {
    return (
        <MainLayout>
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
                    className="text-center mb-16"
                >
                    <p
                        className="text-xs tracking-[0.3em] uppercase mb-3"
                        style={{ color: 'var(--primary)' }}
                    >
                        Latest
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text)' }}>
                        New Music
                    </h2>
                </motion.div>

                {/* Placeholder music embed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="rounded border text-center py-16"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--muted)' }}
                >
                    <p className="text-sm tracking-widest uppercase">Music embed coming soon</p>
                    <Link href="/music" className="mt-4 inline-block text-sm underline" style={{ color: 'var(--primary)' }}>
                        View all music →
                    </Link>
                </motion.div>
            </section>

            {/* Shows teaser */}
            <section
                style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
                className="py-20 px-6 text-center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <p
                        className="text-xs tracking-[0.3em] uppercase mb-3"
                        style={{ color: 'var(--primary)' }}
                    >
                        On the Road
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--text)' }}>
                        Upcoming Shows
                    </h2>
                    <Link
                        href="/shows"
                        className="inline-block px-8 py-3 text-sm font-semibold tracking-widest uppercase border transition-all"
                        style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    >
                        See All Dates
                    </Link>
                </motion.div>
            </section>
        </MainLayout>
    );
}
