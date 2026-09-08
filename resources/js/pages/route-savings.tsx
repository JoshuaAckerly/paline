import { useState } from 'react';
import axios from 'axios';
import MainLayout from '@/Layouts/MainLayout';
import PageMeta from '@/Components/PageMeta';
import { LoaderCircle } from 'lucide-react';

type Election = {
    preset: string;
    return_percent: number;
    credit_percent: number;
    reinvest_percent: number;
    return_amount: number;
    credit_amount: number;
    reinvest_amount: number;
    elected_at: string;
} | null;

type RouteSavingsEventProps = {
    id: string;
    savings: number;
    status: string;
    election: Election;
};

const money = (amount: number) => `$${amount.toFixed(2)}`;

const fieldClass = 'w-full border px-4 py-3 text-base outline-none transition-colors focus:border-[var(--primary)]';
const fieldStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };

const PRESETS: { key: string; title: string; description: string }[] = [
    { key: 'return', title: 'Return it to me', description: '100% back to me.' },
    { key: 'credit', title: 'Save it for next time', description: '100% future PA LINE credit.' },
    { key: 'buzz', title: 'Keep the buzz moving', description: '100% reinvested with PA LINE.' },
    { key: 'half', title: 'Split the difference', description: '50% back, 50% reinvested.' },
    { key: 'custom', title: 'Choose my split', description: 'Divide it yourself.' },
];

export default function RouteSavingsPage({ event }: { event: RouteSavingsEventProps }) {
    const [preset, setPreset] = useState('return');
    const [returnPercent, setReturnPercent] = useState('100');
    const [creditPercent, setCreditPercent] = useState('0');
    const [reinvestPercent, setReinvestPercent] = useState('0');
    const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<Election>(event.election ?? null);

    const alreadyElected = event.status === 'elected' || result !== null;

    const elect = async () => {
        setState('loading');
        setError(null);
        try {
            const response = await axios.post(`/route-savings/${event.id}/elect`, {
                preset,
                return_percent: preset === 'custom' ? Number(returnPercent) : undefined,
                credit_percent: preset === 'custom' ? Number(creditPercent) : undefined,
                reinvest_percent: preset === 'custom' ? Number(reinvestPercent) : undefined,
            });
            setResult({
                preset,
                return_percent: preset === 'custom' ? Number(returnPercent) : 0,
                credit_percent: preset === 'custom' ? Number(creditPercent) : 0,
                reinvest_percent: preset === 'custom' ? Number(reinvestPercent) : 0,
                return_amount: response.data.return_amount,
                credit_amount: response.data.credit_amount,
                reinvest_amount: response.data.reinvest_amount,
                elected_at: new Date().toISOString(),
            });
            setState('success');
        } catch (err: any) {
            setError(err?.response?.data?.errors?.percentages?.[0] ?? 'That split could not be saved. Percentages must total 100%.');
            setState('error');
        }
    };

    return (
        <MainLayout>
            <PageMeta title="Route Savings" description="Choose what happens to your PA LINE route savings." />
            <div className="mx-auto max-w-2xl px-6 py-14">
                <p className="mb-3 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>Route Savings</p>
                <h1 className="text-4xl font-bold">{money(event.savings)} saved by a route change</h1>
                <p className="mt-4 leading-7" style={{ color: 'var(--muted)' }}>
                    A nearby PA LINE booking confirmed a route-friendly date, reducing the protected travel charge attached to your show. Choose what happens to the savings below.
                </p>

                {alreadyElected && result ? (
                    <div className="mt-8 border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                        <strong className="uppercase" style={{ color: 'var(--primary)' }}>Election recorded</strong>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div><div className="text-sm" style={{ color: 'var(--muted)' }}>Return / reduce balance</div><strong>{money(result.return_amount)}</strong></div>
                            <div><div className="text-sm" style={{ color: 'var(--muted)' }}>Future booking credit</div><strong>{money(result.credit_amount)}</strong></div>
                            <div><div className="text-sm" style={{ color: 'var(--muted)' }}>Reinvested with PA LINE</div><strong>{money(result.reinvest_amount)}</strong></div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 space-y-5 border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {PRESETS.map((option) => (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => setPreset(option.key)}
                                    className="min-h-24 border p-4 text-left"
                                    style={{ borderColor: preset === option.key ? 'var(--primary)' : 'var(--border)', backgroundColor: preset === option.key ? 'color-mix(in srgb, var(--primary) 12%, var(--bg-card))' : 'var(--bg)' }}
                                >
                                    <strong className="block uppercase">{option.title}</strong>
                                    <span className="mt-2 block text-sm" style={{ color: 'var(--muted)' }}>{option.description}</span>
                                </button>
                            ))}
                        </div>

                        {preset === 'custom' && (
                            <div className="grid gap-4 sm:grid-cols-3">
                                <label className="text-xs font-semibold uppercase">Return %<input type="number" min={0} max={100} value={returnPercent} onChange={(e) => setReturnPercent(e.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} /></label>
                                <label className="text-xs font-semibold uppercase">Credit %<input type="number" min={0} max={100} value={creditPercent} onChange={(e) => setCreditPercent(e.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} /></label>
                                <label className="text-xs font-semibold uppercase">Reinvest %<input type="number" min={0} max={100} value={reinvestPercent} onChange={(e) => setReinvestPercent(e.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} /></label>
                            </div>
                        )}

                        <button type="button" onClick={elect} disabled={state === 'loading'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                            {state === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Confirm my split
                        </button>
                        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
