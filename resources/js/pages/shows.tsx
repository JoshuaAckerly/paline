import { motion } from 'framer-motion';
import { Clock, ExternalLink, MapPin } from 'lucide-react';
import MainLayout from '@/Layouts/MainLayout';
import PageMeta from '@/Components/PageMeta';

interface Show {
    summary: string;
    date: string;
    time: string | null;
    location: string | null;
    url: string | null;
    ts: number;
}

export default function Shows({ shows }: { shows: Show[] }) {
    return (
        <MainLayout>
            <PageMeta title="Shows" description="Upcoming PA Line shows and live dates. True Grit Americana Folk performing across Western New York and beyond." />
            <div className="max-w-4xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="mb-12"
                >
                    <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--primary)' }}>
                        On the Road
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--text)' }}>
                        Upcoming Shows
                    </h1>
                </motion.div>

                {shows.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="py-24 text-center"
                        style={{ color: 'var(--muted)' }}
                    >
                        <p className="text-lg">No upcoming shows right now.</p>
                        <p className="text-sm mt-2">Check back soon — more dates coming.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {shows.map((show, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.06 }}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border rounded"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
                            >
                                <div className="flex-1">
                                    <p className="font-bold text-xl mb-1" style={{ fontFamily: "'six-hands', serif", color: 'var(--text)' }}>
                                        {show.summary}
                                    </p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                        <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                                            {show.date}
                                        </span>
                                        {show.time && (
                                            <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
                                                <Clock className="h-3 w-3" />
                                                {show.time}
                                            </span>
                                        )}
                                        {show.location && (
                                            <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
                                                <MapPin className="h-3 w-3" />
                                                {show.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {show.url && (
                                    <a
                                        href={show.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold tracking-widest uppercase border transition-all shrink-0"
                                        style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        Details
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mt-10 text-xs text-center"
                    style={{ color: 'var(--muted)' }}
                >
                    For booking inquiries, <a href="/contact" style={{ color: 'var(--primary)' }}>contact us</a>.
                </motion.p>
            </div>
        </MainLayout>
    );
}
