import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import type { ActiveDraft, RequestState } from './shared';
import { DocumentReviewModal, FlowHeader, TextField } from './shared';

const DOCUMENTS: { key: string; label: string; ackText: string }[] = [
    { key: 'agreement', label: 'Performance Agreement', ackText: 'I have read and agree to the Performance Agreement as applicable to this request.' },
    { key: 'stage', label: 'Stage Plot', ackText: 'I have reviewed the stage plot and will disclose limitations.' },
    { key: 'tech', label: 'Technical Rider', ackText: 'I have reviewed the Technical Rider.' },
    { key: 'hospitality', label: 'Personal / Hospitality Rider', ackText: 'I have reviewed the Personal / Hospitality Rider.' },
];

export function DocumentGate({ draft }: { draft: ActiveDraft }) {
    const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
    const [acks, setAcks] = useState<Record<string, boolean>>({});
    const [signerName, setSignerName] = useState('');
    const [signerTitle, setSignerTitle] = useState('');
    const [signature, setSignature] = useState('');
    const [signedDate, setSignedDate] = useState('');
    const [consent, setConsent] = useState(false);
    const [finalAck, setFinalAck] = useState(false);
    const [requestState, setRequestState] = useState<RequestState>('idle');
    const [submittedAt, setSubmittedAt] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const allReviewed = DOCUMENTS.every((doc) => reviewed[doc.key]);
    const allAcked = DOCUMENTS.every((doc) => acks[doc.key]);
    const signatureMatches = signerName.trim() !== '' && signature.trim().toLowerCase() === signerName.trim().toLowerCase();
    const canSubmit = allReviewed && allAcked && signatureMatches && signerTitle.trim() && signedDate && consent && finalAck;

    const submit = async () => {
        setRequestState('loading');
        setError(null);
        try {
            const response = await axios.post<{ submitted_at: string }>(`/booking-requests/${draft.id}/documents/sign`, {
                signer_name: signerName,
                signer_title: signerTitle,
                signature,
                signed_date: signedDate,
                electronic_signature_consent: consent,
                final_acknowledgment: finalAck,
            });
            setSubmittedAt(response.data.submitted_at);
            setRequestState('success');
        } catch {
            setError('Open each required document and confirm the signature fields, then try again.');
            setRequestState('error');
        }
    };

    if (submittedAt) {
        return (
            <div className="max-w-2xl">
                <FlowHeader eyebrow="Booking request · Submitted" title="You're all set." description="PA LINE will review this request and follow up by email." />
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            <FlowHeader eyebrow="Final required step" title="Review & Sign" description="This is the single document and signature checkpoint before submission." />
            <div className="space-y-4 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                {DOCUMENTS.map((doc) => (
                    <div key={doc.key} className="border-l-2 p-4" style={{ borderColor: reviewed[doc.key] ? '#69c587' : 'var(--primary)', backgroundColor: 'var(--bg)' }}>
                        <strong>{doc.label}</strong>
                        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>Open the document and scroll to the bottom to unlock the acknowledgment.</p>
                        <DocumentReviewModal bookingId={draft.id} documentKey={doc.key} buttonLabel={`Open & review ${doc.label.toLowerCase()}`} onReviewed={() => setReviewed((current) => ({ ...current, [doc.key]: true }))} />
                        <label className="mt-3 flex items-start gap-3 text-sm">
                            <input type="checkbox" disabled={!reviewed[doc.key]} checked={!!acks[doc.key]} onChange={(event) => setAcks((current) => ({ ...current, [doc.key]: event.target.checked }))} className="mt-0.5 h-5 w-5" />
                            <span>{doc.ackText}</span>
                        </label>
                    </div>
                ))}

                <div className="border p-5" style={{ borderColor: 'var(--border)' }}>
                    <strong className="uppercase" style={{ color: 'var(--primary)' }}>Electronic signature</strong>
                    <div className="mt-4 grid gap-5 md:grid-cols-2">
                        <TextField id="sign-name" label="Full legal name" value={signerName} onChange={setSignerName} />
                        <TextField id="sign-title" label="Title / role" value={signerTitle} onChange={setSignerTitle} />
                        <TextField id="sign-signature" label="Signature" value={signature} onChange={setSignature} />
                        <TextField id="sign-date" label="Date" type="date" value={signedDate} onChange={setSignedDate} />
                    </div>
                    <label className="mt-4 flex items-start gap-3 text-sm">
                        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-5 w-5" />
                        <span>I intend my typed name to serve as my electronic signature.</span>
                    </label>
                </div>

                <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" checked={finalAck} onChange={(event) => setFinalAck(event.target.checked)} className="mt-0.5 h-5 w-5" />
                    <span>I understand this remains pending PA LINE acceptance and any required payment/contract conditions.</span>
                </label>

                <button type="button" onClick={submit} disabled={!canSubmit || requestState === 'loading'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                    {requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Submit request
                </button>
                {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            </div>
        </div>
    );
}
