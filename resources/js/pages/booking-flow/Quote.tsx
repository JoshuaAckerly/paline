import axios from 'axios';
import { useEffect, useState } from 'react';
import type { ActiveDraft } from './shared';
import { FlowHeader } from './shared';

type QuoteResponse = {
    priced: boolean;
    reason?: string;
    format?: string;
    performanceBase?: number;
    soundFee?: number;
    mileage?: number;
    mileageCost?: number;
    extendedTravelAllowance?: number;
    soundTechnicianCost?: number;
    total?: number;
};

const money = (amount: number) => `$${amount.toFixed(2)}`;

export function Quote({ draft, onContinue }: { draft: ActiveDraft; onContinue: () => void }) {
    const [quote, setQuote] = useState<QuoteResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios.get<QuoteResponse>(`/booking-requests/${draft.id}/quote`)
            .then((response) => setQuote(response.data))
            .catch(() => setError('The quote could not be loaded. Please try again.'));
    }, [draft.id]);

    return (
        <div className="max-w-2xl">
            <FlowHeader eyebrow="Pricing review" title="Here's the private quote." description="This reflects performance, routing, sound, and production based on everything entered so far." />
            <div className="space-y-5 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
                {quote && !quote.priced && (
                    <div className="border-l-2 p-4" style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg)' }}>
                        <strong className="uppercase">PA LINE review required</strong>
                        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                            {quote.reason === 'true_potential'
                                ? 'TRUE POTENTIAL bookings are always a custom quote — no priced total is attached yet.'
                                : 'This booking is going to PA LINE for a manual budget review — no priced total is attached yet.'}
                        </p>
                    </div>
                )}
                {quote && quote.priced && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div><div className="text-xs uppercase" style={{ color: 'var(--muted)' }}>Performance</div><strong>{money(quote.performanceBase ?? 0)}</strong></div>
                        <div><div className="text-xs uppercase" style={{ color: 'var(--muted)' }}>Sound</div><strong>{money(quote.soundFee ?? 0)}</strong></div>
                        <div><div className="text-xs uppercase" style={{ color: 'var(--muted)' }}>Routing ({quote.mileage} mi)</div><strong>{money(quote.mileageCost ?? 0)}</strong></div>
                        {!!quote.extendedTravelAllowance && <div><div className="text-xs uppercase" style={{ color: 'var(--muted)' }}>Extended travel allowance</div><strong>{money(quote.extendedTravelAllowance)}</strong></div>}
                        {!!quote.soundTechnicianCost && <div><div className="text-xs uppercase" style={{ color: 'var(--muted)' }}>Sound technician</div><strong>{money(quote.soundTechnicianCost)}</strong></div>}
                        <div className="col-span-full border-t pt-4" style={{ borderColor: 'var(--border)' }}><div className="text-xs uppercase" style={{ color: 'var(--muted)' }}>Total</div><strong className="text-2xl">{money(quote.total ?? 0)}</strong></div>
                    </div>
                )}
                <button type="button" onClick={onContinue} disabled={!quote} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>Continue</button>
            </div>
        </div>
    );
}
