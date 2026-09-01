import { motion } from 'framer-motion';
import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import PageMeta from '@/Components/PageMeta';
import axios from 'axios';

export default function Contact() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            await axios.post('/contact', form);
            setStatus('sent');

            // Reset form
            setForm({
                name: '',
                email: '',
                subject: '',
                message: '',
            });
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        outline: 'none',
        borderRadius: '2px',
        fontSize: '1rem',
    };

    return (
        <MainLayout>
            <PageMeta
                title="Contact"
                description="Book PA Line, press inquiries, or just say hello. Contact the band directly at info@palineofficial.com."
            />

            <div className="max-w-2xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--primary)' }}>
                        Get in Touch
                    </p>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text)' }}>
                        Contact
                    </h1>

                    <p className="mb-12 text-sm" style={{ color: 'var(--muted)' }}>
                        Booking inquiries, press, or just want to say hey — reach out below or email us directly at{' '}
                        <a href="mailto:info@palineofficial.com" style={{ color: 'var(--primary)' }}>
                            info@palineofficial.com
                        </a>.
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
                                Name
                            </label>
                            <input
                                type="text"
                                required
                                style={inputStyle}
                                value={form.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                style={inputStyle}
                                value={form.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
                            Subject
                        </label>
                        <input
                            type="text"
                            style={inputStyle}
                            value={form.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
                            Message
                        </label>
                        <textarea
                            rows={6}
                            required
                            style={{ ...inputStyle, resize: 'vertical' }}
                            value={form.message}
                            onChange={(e) => handleChange('message', e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="w-full py-3 text-sm font-semibold tracking-widest uppercase transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: 'var(--primary)', color: '#1a1410' }}
                    >
                        {status === 'sending' ? 'Sending...' : 'Send Message'}
                    </button>

                    {status === 'sent' && (
                        <p className="text-sm text-center" style={{ color: 'var(--primary)' }}>
                            Message sent — we'll be in touch.
                        </p>
                    )}

                    {status === 'error' && (
                        <p className="text-sm text-center text-red-400">
                            Something went wrong. Try emailing directly.
                        </p>
                    )}
                </motion.form>
            </div>
        </MainLayout>
    );
}
