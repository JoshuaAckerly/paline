import axios from 'axios';
import { Check, LoaderCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { ActiveDraft, RequestState } from './shared';
import { ChoiceButton, FlowHeader, SelectField, TextField } from './shared';

/**
 * Prototype's pageDetails is one long page: venue/event/contact, performance
 * format/length/sound, and TRUE POTENTIAL all live together. This merges what
 * used to be two separate wizard steps (BookingDetails + ProductionOptions)
 * into a single continuous form/page, saved via the same two PATCH endpoints.
 */
export function Details({ draft, onContinue }: { draft: ActiveDraft; onContinue: () => void }) {
    const [form, setForm] = useState({ venueName: '', streetAddress: '', city: '', state: 'NY', postalCode: '', eventName: '', eventType: 'public_performance', setting: 'indoor', start: '19:00', end: '22:00', attendance: '', contactName: '', contactEmail: '', contactPhone: '' });
    const [performanceFormat, setPerformanceFormat] = useState('full_pa_line');
    const [performanceLength, setPerformanceLength] = useState('90');
    const [soundProvided, setSoundProvided] = useState<boolean | null>(null);
    const [houseEngineer, setHouseEngineer] = useState('unknown');
    const [truePotential, setTruePotential] = useState(false);
    const [requestState, setRequestState] = useState<RequestState>('idle');
    const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

    const minimumTruePotentialDate = new Date();
    minimumTruePotentialDate.setMonth(minimumTruePotentialDate.getMonth() + 6);
    const truePotentialEligible = new Date(`${draft.selectedDate}T00:00:00`) >= minimumTruePotentialDate;

    const save = async (event: FormEvent) => {
        event.preventDefault();
        setRequestState('loading');
        try {
            await axios.patch(`/booking-requests/${draft.id}`, {
                draft_token: draft.draft_token,
                selected_date: draft.selectedDate,
                venue: { name: form.venueName, street_address: form.streetAddress, city: form.city, state: form.state, postal_code: form.postalCode },
                event: { name: form.eventName, type: form.eventType, setting: form.setting, start: form.start, end: form.end, estimated_attendance: Number(form.attendance) },
                contact: { name: form.contactName, email: form.contactEmail, phone: form.contactPhone || null },
            });
            await axios.patch(`/booking-requests/${draft.id}/production`, {
                draft_token: draft.draft_token,
                performance_format: performanceFormat,
                performance_length_minutes: Number(performanceLength),
                sound_provided: soundProvided,
                house_engineer_provided: soundProvided ? houseEngineer === 'yes' : null,
                true_potential_requested: truePotential,
            });
            if (draft.priorQualifiedShows !== undefined) {
                await axios.patch(`/booking-requests/${draft.id}/returning-profile`, {
                    draft_token: draft.draft_token,
                    prior_qualified_shows: draft.priorQualifiedShows,
                });
            }
            setRequestState('success');
            onContinue();
        } catch {
            setRequestState('error');
        }
    };

    const canSubmit = soundProvided !== null && !(soundProvided && houseEngineer === 'unknown');

    return (
        <div className="max-w-3xl">
            <FlowHeader eyebrow="Event details · Step 2" title="Tell us about the show." description={`${draft.selectedDate} stays selected while you add the venue, format, and production details.`} />
            <form onSubmit={save} className="space-y-8 border p-6 md:p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <fieldset className="grid gap-5 md:grid-cols-2">
                    <legend className="mb-5 text-sm font-bold uppercase" style={{ color: 'var(--primary)' }}>Venue</legend>
                    <TextField id="venue-name" label="Venue name" value={form.venueName} onChange={(value) => update('venueName', value)} autoComplete="organization" />
                    <TextField id="venue-address" label="Street address" value={form.streetAddress} onChange={(value) => update('streetAddress', value)} autoComplete="street-address" />
                    <TextField id="venue-city" label="City" value={form.city} onChange={(value) => update('city', value)} autoComplete="address-level2" />
                    <TextField id="venue-state" label="State" value={form.state} onChange={(value) => update('state', value)} autoComplete="address-level1" />
                    <TextField id="venue-postal" label="ZIP" value={form.postalCode} onChange={(value) => update('postalCode', value)} autoComplete="postal-code" />
                </fieldset>
                <fieldset className="grid gap-5 md:grid-cols-2">
                    <legend className="mb-5 text-sm font-bold uppercase" style={{ color: 'var(--primary)' }}>Event</legend>
                    <TextField id="event-name" label="Event name" value={form.eventName} onChange={(value) => update('eventName', value)} />
                    <SelectField id="event-type" label="Event type" value={form.eventType} onChange={(value) => update('eventType', value)} options={[['public_performance', 'Public performance'], ['festival', 'Festival'], ['private_event', 'Private event'], ['corporate_event', 'Corporate event'], ['wedding', 'Wedding'], ['fundraiser', 'Fundraiser'], ['other', 'Other']]} />
                    <SelectField id="event-setting" label="Setting" value={form.setting} onChange={(value) => update('setting', value)} options={[['indoor', 'Indoor'], ['outdoor', 'Outdoor'], ['indoor_outdoor', 'Indoor / outdoor'], ['unsure', 'Not sure yet']]} />
                    <TextField id="event-attendance" label="Estimated attendance" type="number" min="1" value={form.attendance} onChange={(value) => update('attendance', value)} />
                    <TextField id="event-start" label="Start time" type="time" value={form.start} onChange={(value) => update('start', value)} />
                    <TextField id="event-end" label="End time" type="time" value={form.end} onChange={(value) => update('end', value)} />
                </fieldset>
                <fieldset className="grid gap-5 md:grid-cols-2">
                    <legend className="mb-5 text-sm font-bold uppercase" style={{ color: 'var(--primary)' }}>Booking contact</legend>
                    <TextField id="contact-name" label="Contact name" value={form.contactName} onChange={(value) => update('contactName', value)} autoComplete="name" />
                    <TextField id="contact-email" label="Contact email" type="email" value={form.contactEmail} onChange={(value) => update('contactEmail', value)} autoComplete="email" />
                    <TextField id="contact-phone" label="Contact phone (optional)" required={false} value={form.contactPhone} onChange={(value) => update('contactPhone', value)} autoComplete="tel" />
                </fieldset>
                <fieldset>
                    <legend className="mb-4 text-sm font-bold uppercase" style={{ color: 'var(--primary)' }}>Performance format</legend>
                    <div className="grid gap-px border md:grid-cols-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--border)' }}>
                        {([['solo', 'Solo', 'Trever Stribing solo.'], ['duo', 'Duo', 'A stripped-down PA LINE duo.'], ['full_pa_line', 'Full PA LINE', 'The full-band experience.']] as const).map(([value, title, description]) => (
                            <label key={value} className="min-h-36 cursor-pointer p-5" style={{ backgroundColor: performanceFormat === value ? 'color-mix(in srgb, var(--primary) 12%, var(--bg-card))' : 'var(--bg-card)' }}>
                                <input type="radio" name="performance-format" value={value} checked={performanceFormat === value} onChange={() => setPerformanceFormat(value)} className="mr-3" />
                                <strong className="uppercase">{title}</strong>
                                <span className="mt-4 block text-sm leading-6" style={{ color: 'var(--muted)' }}>{description}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
                <SelectField id="performance-length" label="Performance length" value={performanceLength} onChange={setPerformanceLength} options={[['60', 'Up to 60 minutes'], ['90', 'Up to 90 minutes'], ['120', 'Up to 2 hours'], ['180', 'Up to 3 hours / multiple sets']]} />
                <fieldset>
                    <legend className="mb-4 text-sm font-bold uppercase" style={{ color: 'var(--primary)' }}>Sound system</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <ChoiceButton selected={soundProvided === true} onClick={() => setSoundProvided(true)} title="Sound is provided" description="The venue has a suitable PA system." />
                        <ChoiceButton selected={soundProvided === false} onClick={() => { setSoundProvided(false); setHouseEngineer('unknown'); }} title="PA LINE provides sound" description="Format-based sound fees will apply." />
                    </div>
                </fieldset>
                {soundProvided === true && <SelectField id="house-engineer" label="Qualified house engineer included?" value={houseEngineer} onChange={setHouseEngineer} options={[['unknown', 'Choose one'], ['yes', 'Yes'], ['no', 'No']]} />}
                <fieldset className="border-l-2 p-5" style={{ borderColor: truePotentialEligible ? 'var(--primary)' : 'var(--border)', backgroundColor: 'var(--bg)' }}>
                    <legend className="px-2 text-sm font-bold uppercase">TRUE POTENTIAL</legend>
                    <p className="text-sm leading-6" style={{ color: 'var(--muted)' }}>Expanded musicians, production, preparation, and promotion require a custom quote and at least six months of lead time.</p>
                    <label className="mt-4 flex items-start gap-3 text-sm">
                        <input type="checkbox" checked={truePotential} disabled={!truePotentialEligible} onChange={(event) => setTruePotential(event.target.checked)} className="mt-0.5 h-5 w-5" />
                        <span>{truePotentialEligible ? 'Request a TRUE POTENTIAL custom production review.' : 'This date is inside the six-month production window.'}</span>
                    </label>
                </fieldset>
                <button type="submit" disabled={requestState === 'loading' || requestState === 'success' || !canSubmit} className="inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold uppercase disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>
                    {requestState === 'loading' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : requestState === 'success' ? <Check className="h-4 w-4" /> : null}
                    {requestState === 'success' ? 'Details saved' : 'Save and continue'}
                </button>
                {requestState === 'error' && <p role="alert" className="text-sm text-red-300">The details could not be saved. Check the fields and try again.</p>}
            </form>
        </div>
    );
}
