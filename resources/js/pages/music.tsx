import { motion } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';
import PageMeta from '@/Components/PageMeta';

const albums = [
    {
        title: 'dENIAL',
        year: '2024',
        appleId: '1738445891',
        appleSlug: 'denial',
    },
    {
        title: 'Peace Always',
        year: '2018',
        appleId: '1388082902',
        appleSlug: 'peace-always',
    },
];

export default function Music() {
    return (
        <MainLayout>
            <PageMeta title="Music" description="Stream PA Line on Spotify and Apple Music. Albums include dENIAL (2024) and Peace Always (2018)." />
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

                {/* Spotify embed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.05 }}
                    className="mb-12"
                >
                    <p className="text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--muted)' }}>Spotify</p>
                    <iframe
                        src="https://open.spotify.com/embed/artist/2OArsWhucdqcTIh9FenCiO?utm_source=generator&theme=0"
                        width="100%"
                        height="160"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        style={{ borderRadius: '4px', border: '1px solid var(--border)', display: 'block' }}
                    />
                </motion.div>

                {/* Apple Music embeds */}
                <div className="space-y-10">
                    {albums.map((album, i) => (
                        <motion.div
                            key={album.appleId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 + i * 0.1 }}
                        >
                            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--muted)' }}>
                                {album.year} · {album.title}
                            </p>
                            <iframe
                                allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                                frameBorder="0"
                                height="450"
                                style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: '#000' }}
                                sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                                src={`https://embed.music.apple.com/us/album/${album.appleSlug}/${album.appleId}?theme=dark`}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Links out */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mt-16 flex flex-wrap gap-4"
                >
                    <a
                        href="https://www.youtube.com/@palineofficial"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2 text-xs font-semibold tracking-widest uppercase border transition-all"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                        YouTube ↗
                    </a>
                    <a
                        href="https://open.spotify.com/artist/2OArsWhucdqcTIh9FenCiO"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2 text-xs font-semibold tracking-widest uppercase border transition-all"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                        Spotify ↗
                    </a>
                    <a
                        href="https://music.apple.com/us/artist/pa-line/971265800"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2 text-xs font-semibold tracking-widest uppercase border transition-all"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                        Apple Music ↗
                    </a>
                    <a
                        href="https://music.amazon.com/artists/B01L1B73TC/pa-line"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2 text-xs font-semibold tracking-widest uppercase border transition-all"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                        Amazon Music ↗
                    </a>
                </motion.div>
            </div>
        </MainLayout>
    );
}
