import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { ActiveDraft, RequestState } from './shared';
import { DocumentReviewModal, FlowHeader, TextField } from './shared';

export function Confidentiality({ draft, onContinue }: { draft: ActiveDraft; onContinue: () => void }) {
    const [signerName, setSignerName] = useState('');
    const [signerTitle, setSignerTitle] = useState('');
    const [ack, setAck] = useState(false);
    const [consent, setConsent] = useState(false);
    const [reviewed, setReviewed] = useState(false);
    const [requestState, setRequestState] = useState<RequestState>('idle');
    const [error, setError] = useState<string | null>(null);

    const canSubmit = reviewed && signerName.trim() && signerTitle.trim() && ack && consent;

    const accept = async (event: FormEvent) => {
        event.preventDefault();
        setRequestState('loading');
        setError(null);
        try {
            await axios.post(`/booking-requests/${draft.id}/confidentiality`, {
                signer_name: signerName,
                signer_title: signerTitle,
                confidentiality_ack: ack,
                electronic_signature_consent: consent,
            });
            setRequestState('success');
            onContinue();
        } catch {
            setError('Complete the confidentiality review, then try again.');
            setRequestState('error');
        }
    };

    return (
        <div className="max-w-2xl">
            <FlowHeader eyebrow="Confidential pricing" title="Confidential Pricing & Booking Terms Agreement" description="PA LINE may offer different rates for different bookings. Those non-public terms should stay between the parties." />
            <form onSubmit={accept} className="space-y-6 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <div className="border-l-2 p-4" style={{ borderColor: reviewed ? '#69c587' : 'var(--primary)', backgroundColor: 'var(--bg)' }}>
                    <strong>Pricing confidentiality</strong>
                    <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>Open the confidentiality terms and scroll to the bottom before the acceptance checkboxes become available.</p>
                    <DocumentReviewModal bookingId={draft.id} documentKey="nda" buttonLabel="Open & review confidentiality terms" onReviewed={() => setReviewed(true)} />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                    <TextField id="conf-name" label="Authorized signer" value={signerName} onChange={setSignerName} />
                    <TextField id="conf-title" label="Title / role" value={signerTitle} onChange={setSignerTitle} />
                </div>
                <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" disabled={!reviewed} checked={ack} onChange={(event) => setAck(event.target.checked)} className="mt-0.5 h-5 w-5" />
                    <span>I agree to keep PA LINE's non-public negotiated pricing and booking terms confidential as described above.</span>
                </label>
                <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" disabled={!reviewed} checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-5 w-5" />
                    <span>I intend my typed name and confirmation to serve as my electronic acceptance of these confidentiality terms for this booking request.</span>
                </label>
                <button type="submit" disabled={!canSubmit || requestState === 'loading'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                    {requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Unlock my quote
                </button>
                {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            </form>
        </div>
    );
}
