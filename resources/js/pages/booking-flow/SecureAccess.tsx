import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { ActiveDraft, RequestState } from './shared';
import { FlowHeader, TextField } from './shared';

/**
 * Prototype's "Secure Access": since /booking already requires sign-in, this
 * claims the anonymous draft for the already-authenticated user instead of
 * sending a second magic link, and unlocks the confidentiality/pricing steps.
 */
export function SecureAccess({ draft, onContinue }: { draft: ActiveDraft; onContinue: () => void }) {
    const [name, setName] = useState('');
    const [organization, setOrganization] = useState('');
    const [requestState, setRequestState] = useState<RequestState>('idle');

    const secure = async (event: FormEvent) => {
        event.preventDefault();
        setRequestState('loading');
        try {
            await axios.post(`/booking-requests/${draft.id}/secure-access`, {
                draft_token: draft.draft_token,
                name,
                organization,
            });
            setRequestState('success');
            onContinue();
        } catch {
            setRequestState('error');
        }
    };

    return (
        <div className="max-w-2xl">
            <FlowHeader eyebrow="Secure access required" title="Save the booking before we show private pricing." description="Confirming this attaches your signed-in account to this request." />
            <form onSubmit={secure} className="space-y-5 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <TextField id="secure-name" label="Your name" value={name} onChange={setName} autoComplete="name" />
                <TextField id="secure-org" label="Venue / organization" value={organization} onChange={setOrganization} autoComplete="organization" />
                <button type="submit" disabled={requestState === 'loading'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                    {requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Save & continue
                </button>
                {requestState === 'error' && <p role="alert" className="text-sm text-red-300">This booking could not be secured. Please try again.</p>}
            </form>
        </div>
    );
}
