import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { ActiveDraft, RequestState } from './shared';
import { ChoiceButton, FlowHeader, TextField } from './shared';

const MERCH_PACKAGES: Record<string, { label: string; description: string }> = {
    rep: { label: 'REP THE BAND!', description: '2 shirts + matching stickers and pins.' },
    crew: { label: 'GEAR UP THE CREW', description: '4 shirts + matching stickers and pins.' },
    dream: { label: 'DREAM TEAM SWAG', description: '6+ shirts at $20 each, plus a free booker shirt at 10+.' },
};

export function Merch({ draft, onContinue }: { draft: ActiveDraft; onContinue: () => void }) {
    const [selected, setSelected] = useState<string>('none');
    const [quantity, setQuantity] = useState('6');
    const [sizes, setSizes] = useState('');
    const [recipient, setRecipient] = useState('');
    const [requestState, setRequestState] = useState<RequestState>('idle');

    const saveMerch = async (event: FormEvent) => {
        event.preventDefault();
        setRequestState('loading');
        try {
            await axios.patch(`/booking-requests/${draft.id}/merch`, {
                draft_token: draft.draft_token,
                merch_package: selected,
                quantity: selected === 'dream' ? Number(quantity) : undefined,
                sizes: selected === 'none' ? undefined : sizes,
                recipient: selected === 'none' ? undefined : recipient || undefined,
            });
            setRequestState('success');
            onContinue();
        } catch {
            setRequestState('error');
        }
    };

    const skipMerch = async () => {
        setRequestState('loading');
        try {
            await axios.patch(`/booking-requests/${draft.id}/merch`, { draft_token: draft.draft_token, merch_package: 'none' });
            onContinue();
        } catch {
            setRequestState('error');
        }
    };

    return (
        <div className="max-w-3xl">
            <FlowHeader eyebrow="Optional booking bonus · Step 8" title="Want some merch with that?" description="Optional add-on merch packages for the venue or booking team. Final styles/colors depend on available inventory." />
            <form onSubmit={saveMerch} className="space-y-7 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <div className="grid gap-3 sm:grid-cols-3">{Object.entries(MERCH_PACKAGES).map(([key, pkg]) => <ChoiceButton key={key} selected={selected === key} onClick={() => setSelected(key)} title={pkg.label} description={pkg.description} />)}</div>
                {selected === 'dream' && <TextField id="merch-quantity" label="Quantity (6+)" type="number" min="6" max="50" value={quantity} onChange={setQuantity} />}
                {selected !== 'none' && <><TextField id="merch-sizes" label="Sizes needed" value={sizes} onChange={setSizes} /><TextField id="merch-recipient" label="Who is this for? (optional)" required={false} value={recipient} onChange={setRecipient} /></>}
                <div className="flex flex-wrap gap-3">
                    <button type="submit" disabled={requestState === 'loading' || (selected !== 'none' && !sizes.trim())} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>{requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Add and continue</button>
                    <button type="button" onClick={skipMerch} className="inline-flex min-h-12 items-center justify-center border px-6 text-sm font-semibold uppercase" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>No thanks</button>
                </div>
                {requestState === 'error' && <p role="alert" className="text-sm text-red-300">Merch selection could not be saved. Please try again.</p>}
            </form>
        </div>
    );
}
