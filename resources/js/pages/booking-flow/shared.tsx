import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export type Path =
    | 'start' | 'exact' | 'flexible' | 'demand' | 'returning-hub'
    | 'details' | 'recurring' | 'budget'
    | 'secure-access' | 'confidentiality' | 'quote' | 'exclusivity' | 'technical-rider'
    | 'merch' | 'document-gate';

export type AvailabilityState = 'available' | 'limited' | 'held' | 'blocked';
export type RequestState = 'idle' | 'loading' | 'success' | 'error';
export type CandidateDate = { id: string; date: string; state: AvailabilityState; miles?: number | null };
export type BookingDraftResponse = { id: string; draft_token: string; dates: CandidateDate[]; routing_status: string | null };
export type ActiveDraft = BookingDraftResponse & { selectedDate: string; priorQualifiedShows?: number };
export type ReviewedDate = CandidateDate & { primary: boolean };
export type RejectedDate = { date: string; reason: string };

export const fieldClass = 'w-full border px-4 py-3 text-base outline-none transition-colors focus:border-[var(--primary)]';
export const fieldStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };

export function FlowHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
    return <div className="mb-9 max-w-2xl"><p className="mb-3 text-xs font-semibold uppercase" style={{ color: 'var(--primary)' }}>{eyebrow}</p><h1 className="text-4xl font-bold md:text-5xl">{title}</h1><p className="mt-4 leading-7" style={{ color: 'var(--muted)' }}>{description}</p></div>;
}

export function ChoiceButton({ selected, onClick, title, description }: { selected: boolean; onClick: () => void; title: string; description: string }) {
    return <button type="button" aria-pressed={selected} onClick={onClick} className="min-h-28 border p-4 text-left" style={{ borderColor: selected ? 'var(--primary)' : 'var(--border)', backgroundColor: selected ? 'color-mix(in srgb, var(--primary) 12%, var(--bg-card))' : 'var(--bg-card)' }}><strong className="block uppercase">{title}</strong><span className="mt-2 block text-sm" style={{ color: 'var(--muted)' }}>{description}</span></button>;
}

export function TextField({ id, label, value, onChange, type = 'text', required = true, autoComplete, min, max }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; autoComplete?: string; min?: string; max?: string }) {
    return <label htmlFor={id} className="text-xs font-semibold uppercase">{label}<input id={id} type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} min={min} max={max} className={`${fieldClass} mt-2`} style={fieldStyle} /></label>;
}

export function SelectField({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
    return <label htmlFor={id} className="text-xs font-semibold uppercase">{label}<select id={id} required value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle}>{options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}</select></label>;
}

export function TextAreaField({ id, label, value, onChange, rows = 3, required = true }: { id: string; label: string; value: string; onChange: (value: string) => void; rows?: number; required?: boolean }) {
    return <label htmlFor={id} className="text-xs font-semibold uppercase">{label}<textarea id={id} required={required} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} mt-2`} style={fieldStyle} /></label>;
}

type DocumentContent = { document_key: string; title: string; version: string; content: string; reached_end: boolean };

/**
 * Shared scroll-to-unlock legal document reviewer, used by both the Confidentiality
 * gate and the final Document Gate (Review & Sign). Matches the prototype's
 * openDocumentReview/trackDocumentReviewScroll/completeDocumentReview behavior.
 */
export function DocumentReviewModal({
    bookingId,
    documentKey,
    buttonLabel,
    onReviewed,
}: {
    bookingId: string;
    documentKey: string;
    buttonLabel: string;
    onReviewed: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [doc, setDoc] = useState<DocumentContent | null>(null);
    const [loading, setLoading] = useState(false);

    const openModal = async () => {
        setLoading(true);
        try {
            const response = await axios.get<DocumentContent>(`/booking-requests/${bookingId}/documents/${documentKey}`);
            setDoc(response.data);
            setOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const onScroll = async (event: React.UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;
        const reachedEnd = target.scrollTop + target.clientHeight >= target.scrollHeight - 12;

        if (reachedEnd && doc && !doc.reached_end) {
            await axios.post(`/booking-requests/${bookingId}/documents/${documentKey}/reviewed`);
            setDoc({ ...doc, reached_end: true });
            onReviewed();
        }
    };

    return (
        <>
            <button type="button" onClick={openModal} disabled={loading} className="mt-3 inline-flex min-h-11 items-center justify-center border px-5 text-xs font-semibold uppercase disabled:opacity-50" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />} {buttonLabel}
            </button>
            {open && doc && (
                <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
                    <div className="flex max-h-[80vh] w-full max-w-2xl flex-col border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border)' }}>
                            <div>
                                <strong className="uppercase" style={{ color: 'var(--primary)' }}>{doc.title}</strong>
                                <div className="text-xs" style={{ color: 'var(--muted)' }}>Version {doc.version}</div>
                            </div>
                            <button type="button" onClick={() => setOpen(false)} className="text-xs font-semibold uppercase" style={{ color: 'var(--muted)' }}>Close</button>
                        </div>
                        <div onScroll={onScroll} className="overflow-y-auto p-6 text-sm leading-7" dangerouslySetInnerHTML={{ __html: doc.content }} />
                        <div className="border-t p-4 text-center text-xs uppercase" style={{ borderColor: 'var(--border)', color: doc.reached_end ? '#69c587' : 'var(--muted)' }}>
                            {doc.reached_end ? 'End of document — acknowledgment unlocked' : 'Scroll to the bottom to unlock the acknowledgment'}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function FlowShell({ children }: { children: ReactNode }) {
    return <div className="max-w-3xl">{children}</div>;
}
