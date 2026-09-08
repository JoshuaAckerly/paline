import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import type { ActiveDraft, RequestState } from './shared';
import { ChoiceButton, FlowHeader, SelectField } from './shared';

export function Exclusivity({ draft, onContinue }: { draft: ActiveDraft; onContinue: () => void }) {
    const [requested, setRequested] = useState<boolean | null>(null);
    const [radiusMiles, setRadiusMiles] = useState('25');
    const [daysBefore, setDaysBefore] = useState('7');
    const [daysAfter, setDaysAfter] = useState('7');
    const [appliesTo, setAppliesTo] = useState('public_performances');
    const [exceptions, setExceptions] = useState('none');
    const [fee, setFee] = useState<number | null>(null);
    const [requestState, setRequestState] = useState<RequestState>('idle');

    const save = async (nextRequested: boolean) => {
        setRequested(nextRequested);
        setRequestState('loading');
        try {
            const response = await axios.patch<{ exclusivity_fee: number | null }>(`/booking-requests/${draft.id}/exclusivity`, {
                requested: nextRequested,
                radius_miles: nextRequested ? Number(radiusMiles) : undefined,
                days_before: nextRequested ? Number(daysBefore) : undefined,
                days_after: nextRequested ? Number(daysAfter) : undefined,
                applies_to: nextRequested ? appliesTo : undefined,
                exceptions: nextRequested ? exceptions : undefined,
            });
            setFee(response.data.exclusivity_fee);
            setRequestState('success');
        } catch {
            setRequestState('error');
        }
    };

    return (
        <div className="max-w-2xl">
            <FlowHeader eyebrow="Exclusivity · Step 5" title="Any exclusivity requirements?" description="Optional geographic/time restriction. Final exclusivity pricing is still reviewed manually." />
            <div className="space-y-6 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <div className="grid gap-3 sm:grid-cols-2">
                    <ChoiceButton selected={requested === false} onClick={() => save(false)} title="No exclusivity" description="No radius clause needed." />
                    <ChoiceButton selected={requested === true} onClick={() => setRequested(true)} title="Request exclusivity" description="Request a geographic/time restriction." />
                </div>
                {requested === true && (
                    <div className="grid gap-5 md:grid-cols-2">
                        <SelectField id="ex-radius" label="Radius" value={radiusMiles} onChange={setRadiusMiles} options={[['25', '25 miles'], ['50', '50 miles'], ['75', '75 miles'], ['100', '100 miles'], ['150', '150 miles']]} />
                        <SelectField id="ex-before" label="Days before" value={daysBefore} onChange={setDaysBefore} options={[['7', '7'], ['14', '14'], ['30', '30'], ['60', '60']]} />
                        <SelectField id="ex-after" label="Days after" value={daysAfter} onChange={setDaysAfter} options={[['7', '7'], ['14', '14'], ['30', '30'], ['60', '60']]} />
                        <SelectField id="ex-applies" label="Applies to" value={appliesTo} onChange={setAppliesTo} options={[['public_performances', 'Public performances'], ['ticketed_public_performances', 'Ticketed public performances'], ['all_appearances', 'All appearances']]} />
                        <SelectField id="ex-exceptions" label="Exceptions" value={exceptions} onChange={setExceptions} options={[['none', 'None'], ['existing_bookings', 'Existing bookings'], ['private_events', 'Private events'], ['festivals', 'Festivals'], ['discuss_with_pa_line', 'Discuss with PA LINE']]} />
                        <button type="button" onClick={() => save(true)} disabled={requestState === 'loading'} className="inline-flex min-h-12 items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50 md:col-span-2" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                            {requestState === 'loading' && <LoaderCircle className="h-4 w-4 animate-spin" />} Preview exclusivity estimate
                        </button>
                        {fee !== null && <p className="text-sm md:col-span-2" style={{ color: 'var(--muted)' }}>Preview exclusivity estimate: about ${fee}. Final exclusivity pricing is reviewed manually.</p>}
                    </div>
                )}
                <button type="button" onClick={onContinue} disabled={requested === null || requestState === 'loading'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>Continue</button>
                {requestState === 'error' && <p role="alert" className="text-sm text-red-300">Exclusivity preferences could not be saved. Please try again.</p>}
            </div>
        </div>
    );
}
