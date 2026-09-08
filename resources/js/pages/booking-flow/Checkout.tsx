import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { ActiveDraft, RequestState } from './shared';
import { FlowHeader, SelectField, TextField } from './shared';

export function Checkout({ draft, onContinue }: { draft: ActiveDraft; onContinue: () => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [organization, setOrganization] = useState('');
    const [preference, setPreference] = useState('email');
    const [notes, setNotes] = useState('');
    const [requestState, setRequestState] = useState<RequestState>('idle');

    const save = async (event: FormEvent) => {
        event.preventDefault();
        setRequestState('loading');
        try {
            await axios.patch(`/booking-requests/${draft.id}/checkout`, {
                name, email, phone: phone || undefined, organization: organization || undefined, preference, notes: notes || undefined,
            });
            setRequestState('success');
            onContinue();
        } catch {
            setRequestState('error');
        }
    };

    return (
        <div className="max-w-2xl">
            <FlowHeader eyebrow="Contact & final check" title="Almost there." description="Confirm the booking summary and contact information below. The contract, stage plot, riders, electronic signature, and final price all appear once on the next page." />
            <form onSubmit={save} className="space-y-5 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <div className="grid gap-5 md:grid-cols-2">
                    <TextField id="checkout-name" label="Your name" value={name} onChange={setName} autoComplete="name" />
                    <TextField id="checkout-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
                    <TextField id="checkout-phone" label="Phone (optional)" required={false} value={phone} onChange={setPhone} autoComplete="tel" />
                    <TextField id="checkout-org" label="Organization / venue (optional)" required={false} value={organization} onChange={setOrganization} autoComplete="organization" />
                    <SelectField id="checkout-preference" label="Best way to reach you" value={preference} onChange={setPreference} options={[['email', 'Email'], ['phone', 'Phone'], ['text', 'Text']]} />
                </div>
                <TextField id="checkout-notes" label="Anything else? (optional)" required={false} value={notes} onChange={setNotes} />
                <p className="text-sm leading-6" style={{ color: 'var(--muted)' }}>One final page contains the Performance Agreement, Stage Plot, Technical Rider, Personal / Hospitality Rider, electronic signature, final acknowledgment, and final booking-request price.</p>
                <button type="submit" disabled={requestState === 'loading' || !name.trim() || !email.trim()} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                    {requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Continue to Review & Sign
                </button>
                {requestState === 'error' && <p role="alert" className="text-sm text-red-300">This could not be saved. Please try again.</p>}
            </form>
        </div>
    );
}
