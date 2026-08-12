import { motion } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';

export default function Music() {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--primary)' }}>
                        Discography
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-16" style={{ color: 'var(--text)' }}>
                        Music
                    </h1>
                </motion.div>

                {/* Spotify embed placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="space-y-8"
                >
                    <div
                        className="rounded border p-8 text-center"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--muted)' }}
                    >
                        <p className="text-sm tracking-widest uppercase mb-2">Spotify</p>
                        <p className="text-xs">Embed will go here — add Spotify artist/album URL</p>
                    </div>
                    <div
                        className="rounded border p-8 text-center"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--muted)' }}
                    >
                        <p className="text-sm tracking-widest uppercase mb-2">YouTube</p>
                        <p className="text-xs">Embed will go here — add YouTube channel/video URL</p>
                    </div>
                </motion.div>
            </div>
        </MainLayout>
    );
}
