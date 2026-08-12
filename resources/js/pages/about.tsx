import { motion } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';

export default function About() {
    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--primary)' }}>
                        The Band
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-12" style={{ color: 'var(--text)' }}>
                        About
                    </h1>
                </motion.div>

                {/* Band photo placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="w-full aspect-video rounded border mb-12 flex items-center justify-center"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--muted)' }}
                >
                    <p className="text-sm tracking-widest uppercase">Band photo</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="space-y-6 text-base leading-relaxed"
                    style={{ color: 'var(--text)' }}
                >
                    <p style={{ color: 'var(--muted)' }}>
                        {/* Bio text goes here — to be filled in with Trever's story */}
                        PA Line is a true grit americana band rooted in honest songwriting,
                        raw performance, and the kind of music that stays with you long after
                        the last note fades. Based in the United States, the band draws from
                        the deep well of american roots music — country, blues, rock — and
                        pours it into something entirely their own.
                    </p>
                    <p style={{ color: 'var(--muted)' }}>
                        More story coming soon.
                    </p>
                </motion.div>
            </div>
        </MainLayout>
    );
}
