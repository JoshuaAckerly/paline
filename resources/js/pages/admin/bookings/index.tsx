import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageMeta from '@/Components/PageMeta';

interface BookingRow {
    id: string;
    event_name: string | null;
    venue_name: string | null;
    primary_date: string | null;
    status: string;
    submitted_at: string | null;
}

export default function BookingRequestsIndex({ bookings }: { bookings: BookingRow[] }) {
    const confirm = (id: string) => {
        router.post(`/admin/bookings/${id}/confirm`, {}, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <PageMeta title="Bookings" />
            <h1 className="mb-2 text-xl font-semibold uppercase tracking-widest">Bookings</h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                Confirming a booking checks nearby confirmed bookings for Route Savings and emails the booker if the travel charge improved.
            </p>
            <div className="overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th className="px-3 py-2 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Event</th>
                            <th className="px-3 py-2 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Venue</th>
                            <th className="px-3 py-2 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Date</th>
                            <th className="px-3 py-2 font-semibold uppercase" style={{ color: 'var(--muted)' }}>Status</th>
                            <th className="px-3 py-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td className="px-3 py-2">{booking.event_name ?? '—'}</td>
                                <td className="px-3 py-2">{booking.venue_name ?? '—'}</td>
                                <td className="px-3 py-2" style={{ color: 'var(--muted)' }}>{booking.primary_date ?? '—'}</td>
                                <td className="px-3 py-2 uppercase">{booking.status}</td>
                                <td className="px-3 py-2 text-right">
                                    {booking.status === 'submitted' && (
                                        <button
                                            type="button"
                                            onClick={() => confirm(booking.id)}
                                            className="text-xs font-semibold uppercase"
                                            style={{ color: 'var(--primary)' }}
                                        >
                                            Confirm
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {bookings.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-3 py-6 text-center" style={{ color: 'var(--muted)' }}>No submitted bookings yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
