import PageMeta from '@/Components/PageMeta';
import MainLayout from '@/Layouts/MainLayout';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { ActiveDraft, Path } from './booking-flow/shared';
import { Demand, ExactDate, FlexibleDate, ReturningHub, Start } from './booking-flow/EntryPaths';
import { Details } from './booking-flow/Details';
import { RecurringDatesPanel } from './booking-flow/RecurringDatesPanel';
import { BudgetFit } from './booking-flow/BudgetFit';
import { SecureAccess } from './booking-flow/SecureAccess';
import { Confidentiality } from './booking-flow/Confidentiality';
import { Quote } from './booking-flow/Quote';
import { Exclusivity } from './booking-flow/Exclusivity';
import { TechnicalRider } from './booking-flow/TechnicalRider';
import { Merch } from './booking-flow/Merch';
import { Checkout } from './booking-flow/Checkout';
import { DocumentGate } from './booking-flow/DocumentGate';

export default function Booking() {
    const [path, setPath] = useState<Path>('start');
    const [draft, setDraft] = useState<ActiveDraft | null>(null);
    const [priorQualifiedShows, setPriorQualifiedShows] = useState<number | undefined>(undefined);

    const continueDraft = (activeDraft: ActiveDraft) => {
        setDraft({ ...activeDraft, priorQualifiedShows });
        setPath('details');
    };
    const chooseFromHub = (nextPath: Path, prior: number) => {
        setPriorQualifiedShows(prior);
        setPath(nextPath);
    };
    const startOver = () => {
        setDraft(null);
        setPriorQualifiedShows(undefined);
        setPath('start');
    };

    return (
        <MainLayout>
            <PageMeta title="Book PA LINE" description="Check dates and start a PA LINE booking request." />
            <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/booking-prototype/assets/pa-line-rose-web.png)', backgroundPosition: '85% 15%', backgroundRepeat: 'no-repeat', backgroundSize: 'min(52rem, 85vw)' }} />
                <div className="relative mx-auto max-w-6xl px-6 py-14 md:py-20">
                    {path === 'start' ? (
                        <Start onChoose={setPath} />
                    ) : (
                        <div>
                            <div className="mb-10 flex items-center justify-between gap-4">
                                <button type="button" onClick={() => setPath('start')} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold uppercase" style={{ color: 'var(--primary)' }}>
                                    <ArrowLeft className="h-4 w-4" /> Back
                                </button>
                                <button type="button" onClick={startOver} aria-label="Start over" className="flex h-11 w-11 items-center justify-center border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                            </div>
                            {path === 'returning-hub' && <ReturningHub onChoose={chooseFromHub} />}
                            {path === 'exact' && <ExactDate onContinue={continueDraft} />}
                            {path === 'flexible' && <FlexibleDate onContinue={continueDraft} />}
                            {path === 'demand' && <Demand />}
                            {path === 'details' && draft && <Details draft={draft} onContinue={(format) => { setDraft((current) => current && { ...current, performanceFormat: format }); setPath('recurring'); }} />}
                            {path === 'recurring' && draft && <RecurringDatesPanel draft={draft} onContinue={() => setPath('budget')} />}
                            {path === 'budget' && draft && <BudgetFit draft={draft} onContinue={() => setPath('secure-access')} onShiftDate={() => setPath('flexible')} />}
                            {path === 'secure-access' && draft && <SecureAccess draft={draft} onContinue={() => setPath('confidentiality')} />}
                            {path === 'confidentiality' && draft && <Confidentiality draft={draft} onContinue={() => setPath('quote')} />}
                            {path === 'quote' && draft && <Quote draft={draft} onContinue={() => setPath('exclusivity')} />}
                            {path === 'exclusivity' && draft && <Exclusivity draft={draft} onContinue={() => setPath('technical-rider')} />}
                            {path === 'technical-rider' && draft && <TechnicalRider draft={draft} onContinue={() => setPath('merch')} />}
                            {path === 'merch' && draft && <Merch draft={draft} onContinue={() => setPath('checkout')} />}
                            {path === 'checkout' && draft && <Checkout draft={draft} onContinue={() => setPath('document-gate')} />}
                            {path === 'document-gate' && draft && <DocumentGate draft={draft} />}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
