import React from 'react';
import { fetchDashboardDataAction } from '@/app/actions/dashboard';

export default async function DashboardPage() {
  const result = await fetchDashboardDataAction();

  if (!result.success || !result.metrics) {
    return (
      <div className="p-8 text-red-600">
        <h1>Dashboard Error</h1>
        <p>{result.error || 'Failed to load dashboard data.'}</p>
      </div>
    );
  }

  const { metrics, activityFeed } = result;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Operational Overview</h1>
        <p className="text-sm text-gray-500 mt-2">Real-time aggregations of practice performance.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Active Jobs" value={metrics.activeJobsCount} />
        <MetricCard title="Active Staff" value={metrics.activeStaffCount} />
        <MetricCard title="Utilisation Snapshot" value={`${metrics.utilisationSnapshot}%`} />
        <MetricCard title="Total Fee Value" value={`$${metrics.totalFeeValue.toLocaleString()}`} />
        <MetricCard title="Submitted Time Entries" value={metrics.submittedTimeEntries} />
        <MetricCard title="Approved Time Entries" value={metrics.approvedTimeEntries} />
        <MetricCard title="Hours (This Week)" value={metrics.totalHoursThisWeek} />
        <MetricCard title="Hours (This Month)" value={metrics.totalHoursThisMonth} />
      </section>

      {activityFeed && activityFeed.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <ul className="space-y-4">
              {activityFeed.map((event) => (
                <li key={event.id} className="text-sm text-gray-700 border-b pb-2 last:border-0">
                  <span className="font-medium">{event.actorName}</span> performed <span className="font-medium text-blue-600">{event.eventType}</span> at {new Date(event.occurredAt).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCard({ title, value }: { title: string, value: string | number }) {
  return (
    <div className="bg-white overflow-hidden rounded-lg shadow px-4 py-5 sm:p-6">
      <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{value}</dd>
    </div>
  );
}
