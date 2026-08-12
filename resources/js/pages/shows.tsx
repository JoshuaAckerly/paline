import { motion } from 'framer-motion';
import { MapPin, Ticket } from 'lucide-react';
import MainLayout from '@/Layouts/MainLayout';

// Shows will be managed here — add dates as they're confirmed
const shows: { date: string; venue: string; city: string; ticketUrl?: string }[] = [
    // Example:
    // { date: 'Sep 5, 2026', venue: 'The Rusty Nail', city: 'Buffalo, NY', ticketUrl: 'https://ticketmaster.com' },
];

export default function Shows() {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--primary)' }}>
                        On the Road
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-16" style={{ color: 'var(--text)' }}>
                        Upcoming Shows
                    </h1>
                </motion.div>

                {shows.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-center py-24"
                        style={{ color: 'var(--muted)' }}
                    >
                        <p className="text-lg">No shows scheduled right now.</p>
                        <p className="text-sm mt-2">Check back soon — more dates coming.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {shows.map((show, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.07 }}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border rounded"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
                            >
                                <div>
                                    <p className="font-semibold text-lg" style={{ fontFamily: 'Bitter, serif', color: 'var(--text)' }}>
                                        {show.date}
                                    </p>
                                    <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                                        {show.venue}
                                    </p>
                                    <p className="text-xs flex items-center gap-1 mt-1" style={{ color: 'var(--muted)' }}>
                                        <MapPin className="h-3 w-3" />
                                        {show.city}
                                    </p>
                                </div>
                                {show.ticketUrl && (
                                    <a
                                        href={show.ticketUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold tracking-widest uppercase border transition-all"
                                        style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                    >
                                        <Ticket className="h-3 w-3" />
                                        Tickets
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
