import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import type { ActiveDraft, RequestState } from './shared';
import { ChoiceButton, FlowHeader, TextAreaField } from './shared';

export function TechnicalRider({ draft, onContinue }: { draft: ActiveDraft; onContinue: () => void }) {
    const [canAccommodate, setCanAccommodate] = useState<boolean | null>(null);
    const [issue, setIssue] = useState('');
    const [acknowledged, setAcknowledged] = useState(false);
    const [requestState, setRequestState] = useState<RequestState>('idle');

    const canSubmit = acknowledged && canAccommodate !== null && (canAccommodate || issue.trim());

    const save = async () => {
        setRequestState('loading');
        try {
            await axios.patch(`/booking-requests/${draft.id}/technical-rider`, {
                can_accommodate: canAccommodate,
                issue: canAccommodate ? undefined : issue,
                acknowledged: true,
            });
            setRequestState('success');
            onContinue();
        } catch {
            setRequestState('error');
        }
    };

    return (
        <div className="max-w-2xl">
            <FlowHeader eyebrow="Technical rider · Step 6" title="Technical requirements" description="These requirements represent the production setup PA LINE needs to deliver the expected performance. If something cannot be accommodated, tell us." />
            <div className="space-y-6 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <div className="space-y-3 text-sm" style={{ color: 'var(--muted)' }}>
                    <p><strong style={{ color: 'var(--text)' }}>Required:</strong> Safe performance area, reliable power, agreed load-in access, and sufficient setup/soundcheck time.</p>
                    <p><strong style={{ color: 'var(--text)' }}>Please discuss:</strong> House PA integration, festival backline, shared stages, substitutions, or unusually short changeovers.</p>
                    <p><strong style={{ color: 'var(--text)' }}>Requested:</strong> Appropriate stage lighting and a production contact.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <ChoiceButton selected={canAccommodate === true} onClick={() => setCanAccommodate(true)} title="Yes" description="We can accommodate the requirements." />
                    <ChoiceButton selected={canAccommodate === false} onClick={() => setCanAccommodate(false)} title="Needs discussion" description="Something may need an alternate arrangement." />
                </div>
                {canAccommodate === false && <TextAreaField id="tech-issue" label="What needs discussion?" value={issue} onChange={setIssue} />}
                <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-0.5 h-5 w-5" />
                    <span><strong>I have reviewed the technical requirements.</strong></span>
                </label>
                <button type="button" onClick={save} disabled={!canSubmit || requestState === 'loading'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                    {requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Continue to bonus additions
                </button>
                {requestState === 'error' && <p role="alert" className="text-sm text-red-300">This could not be saved. Please try again.</p>}
            </div>
        </div>
    );
}
