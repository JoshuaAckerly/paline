import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { ActiveDraft, RequestState } from './shared';
import { FlowHeader, fieldClass, fieldStyle } from './shared';

export function BudgetFit({ draft, onContinue }: { draft: ActiveDraft; onContinue: () => void }) {
    const [budget, setBudget] = useState('');
    const [requestState, setRequestState] = useState<RequestState>('idle');
    const [outcome, setOutcome] = useState<{ status: string; canContinue: boolean } | null>(null);

    const submitBudget = async (workingBudget: number | null, manualReviewRequested = false) => {
        setRequestState('loading');
        try {
            const response = await axios.patch<{ status: string; can_continue?: boolean }>(`/booking-requests/${draft.id}/budget`, {
                draft_token: draft.draft_token,
                working_budget: workingBudget,
                manual_review_requested: manualReviewRequested,
            });
            setOutcome({ status: response.data.status, canContinue: response.data.can_continue ?? true });
            setRequestState('success');
        } catch {
            setRequestState('error');
        }
    };

    const checkBudget = (event: FormEvent) => {
        event.preventDefault();
        const amount = Number(budget);
        submitBudget(amount > 0 ? amount : null);
    };

    const messages: Record<string, string> = {
        workable: 'That budget looks workable. An itemized quote follows after the confidentiality agreement.',
        adjustment_needed: 'The current format and routing sit above that budget. Adjust the plan below, or send it to PA LINE for manual review.',
        manual_review: 'Noted. This booking will go to PA LINE for a manual budget review without a fixed quote attached yet.',
        skipped: 'No working budget set. Full pricing follows after the confidentiality agreement.',
    };

    return (
        <div className="max-w-2xl">
            <FlowHeader eyebrow="Working budget · Step 4" title="Tell us what you're trying to stay within." description="Optional, but helpful. This covers performance, routing, travel, sound, and production. Merch and exclusivity are handled separately." />
            <form onSubmit={checkBudget} className="space-y-5 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <label htmlFor="working-budget" className="block text-xs font-semibold uppercase">Working performance budget
                    <input id="working-budget" type="number" min="0" step="25" placeholder="Optional" value={budget} onChange={(event) => { setBudget(event.target.value); setOutcome(null); }} className={`${fieldClass} mt-2`} style={fieldStyle} />
                </label>
                <div className="flex flex-wrap gap-3">
                    <button type="submit" disabled={requestState === 'loading'} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>{requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Check budget fit</button>
                    <button type="button" onClick={() => { setBudget(''); submitBudget(null); }} className="inline-flex min-h-12 items-center justify-center border px-6 text-sm font-semibold uppercase" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>Skip budget</button>
                </div>
                {outcome && (
                    <div role="status" className="border-l-2 p-4" style={{ borderColor: outcome.status === 'adjustment_needed' ? 'var(--primary)' : '#69c587', backgroundColor: 'var(--bg)' }}>
                        <strong className="uppercase">{outcome.status.replace('_', ' ')}</strong>
                        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{messages[outcome.status]}</p>
                        {outcome.status === 'adjustment_needed' && <button type="button" onClick={() => submitBudget(Number(budget), true)} className="mt-3 inline-flex min-h-11 items-center justify-center border px-5 text-xs font-semibold uppercase" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>Send for manual budget review anyway</button>}
                    </div>
                )}
                {requestState === 'error' && <p role="alert" className="text-sm text-red-300">The budget could not be saved. Please try again.</p>}
                <button type="button" onClick={onContinue} disabled={outcome !== null && !outcome.canContinue} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>Continue</button>
            </form>
        </div>
    );
}
