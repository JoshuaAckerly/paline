import AdminLayout from '@/Layouts/AdminLayout';
import PageMeta from '@/Components/PageMeta';

interface DayCount {
    date: string;
    count: number;
}

interface TopPage {
    path: string;
    count: number;
}

interface Visit {
    id: number;
    path: string;
    ip_address: string | null;
    browser: string;
    referer: string | null;
    user: { name: string; email: string } | null;
    created_at: string;
}

interface Stats {
    totalVisits: number;
    visitsLast30Days: number;
    visitsLast7Days: number;
    uniqueIpsLast30: number;
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                {label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{value.toLocaleString()}</p>
        </div>
    );
}

export default function AnalyticsIndex({
    stats,
    dailyChart,
    topPages,
    recentVisits,
}: {
    stats: Stats;
    dailyChart: DayCount[];
    topPages: TopPage[];
    recentVisits: Visit[];
}) {
    const maxCount = Math.max(1, ...dailyChart.map((day) => day.count));

    return (
        <AdminLayout>
            <PageMeta title="Analytics" />
            <h1 className="mb-6 text-xl font-semibold uppercase tracking-widest">Analytics</h1>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total visits" value={stats.totalVisits} />
                <StatCard label="Last 30 days" value={stats.visitsLast30Days} />
                <StatCard label="Last 7 days" value={stats.visitsLast7Days} />
                <StatCard label="Unique IPs (30d)" value={stats.uniqueIpsLast30} />
            </div>

            <div className="mt-8 border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                    Last 14 days
                </p>
                <div className="flex h-32 items-end gap-2">
                    {dailyChart.map((day) => (
                        <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                            <div
                                className="w-full"
                                style={{
                                    height: `${(day.count / maxCount) * 100}%`,
                                    minHeight: day.count > 0 ? '2px' : 0,
                                    backgroundColor: 'var(--primary)',
                                }}
                                title={`${day.date}: ${day.count}`}
                            />
                            <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                                {day.date.slice(5)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="border" style={{ borderColor: 'var(--border)' }}>
                    <p className="border-b px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                        Top pages (30 days)
                    </p>
                    <table className="w-full text-left text-sm">
                        <tbody>
                            {topPages.map((page) => (
                                <tr key={page.path} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td className="px-4 py-2">{page.path}</td>
                                    <td className="px-4 py-2 text-right" style={{ color: 'var(--muted)' }}>
                                        {page.count}
                                    </td>
                                </tr>
                            ))}
                            {topPages.length === 0 && (
                                <tr>
                                    <td className="px-4 py-4 text-center" style={{ color: 'var(--muted)' }}>
                                        No data yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border" style={{ borderColor: 'var(--border)' }}>
                    <p className="border-b px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                        Recent visits
                    </p>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <tbody>
                                {recentVisits.map((visit) => (
                                    <tr key={visit.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td className="px-4 py-2">
                                            {visit.path}
                                            <div style={{ color: 'var(--muted)' }}>{visit.browser}</div>
                                        </td>
                                        <td className="px-4 py-2 text-right" style={{ color: 'var(--muted)' }}>
                                            {new Date(visit.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {recentVisits.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-4 text-center" style={{ color: 'var(--muted)' }}>
                                            No visits recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
