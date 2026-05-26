import { createClient } from '@/lib/supabase/server';
import { getOperationalContext } from '@/lib/auth/session';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const context = await getOperationalContext();
  const db = await createClient();
  const params = await searchParams;

  const search = params.search || '';
  const statusFilter = params.status || '';
  const sortBy = params.sortBy || 'job_number';
  const sortOrder = params.sortOrder || 'desc';

  // 1. Fetch lookups for the filter dropdown
  const { data: statuses } = await db
    .from('job_statuses')
    .select('id, name, code')
    .eq('tenant_id', context.tenantId)
    .order('sort_order', { ascending: true });

  // 2. Query jobs with joins
  let query = (db as any)
    .from('jobs')
    .select(`
      id,
      job_number,
      name,
      opened_date,
      fee_value,
      project_risk_value,
      clients ( name ),
      job_statuses ( id, name, code ),
      job_types ( name ),
      director:staff!project_director_id ( full_name )
    `)
    .eq('tenant_id', context.tenantId);

  if (statusFilter) {
    query = query.eq('status_id', statusFilter);
  }

  const { data: jobsRaw, error } = await query;

  if (error) {
    console.error('Error fetching jobs:', error);
  }

  let jobs = jobsRaw || [];

  // Client-side text filtering to match search on job number or job name or client name
  if (search) {
    const s = search.toLowerCase();
    jobs = jobs.filter(
      (j: any) =>
        j.job_number.toLowerCase().includes(s) ||
        j.name.toLowerCase().includes(s) ||
        (j.clients && (j.clients as any).name.toLowerCase().includes(s))
    );
  }

  // Client-side sorting
  jobs.sort((a: any, b: any) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    // Handle nested fields
    if (sortBy === 'client') valA = a.clients?.name || '';
    if (sortBy === 'client') valB = b.clients?.name || '';
    if (sortBy === 'status') valA = a.job_statuses?.name || '';
    if (sortBy === 'status') valB = b.job_statuses?.name || '';
    if (sortBy === 'director') valA = a.director?.full_name || '';
    if (sortBy === 'director') valB = b.director?.full_name || '';

    if (valA === undefined) valA = '';
    if (valB === undefined) valB = '';

    if (typeof valA === 'string') {
      return sortOrder === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Job Management</h1>
          <p className="text-sm text-slate-500 mt-1">Review active, completed, and pending consultancies.</p>
        </div>
        <div>
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create New Job
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Search Jobs</label>
            <div className="relative">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search job number, name, client..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <svg className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Filter by Status</label>
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="">All Statuses</option>
              {statuses?.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-slate-800 py-2.5 px-4 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              Apply Filters
            </button>
            <Link
              href="/jobs"
              className="rounded-lg bg-slate-100 py-2.5 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors text-center"
            >
              Reset
            </Link>
          </div>
        </form>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-4 px-6">
                  <SortLink label="Job Number" field="job_number" currentSort={sortBy} currentOrder={sortOrder} search={search} status={statusFilter} />
                </th>
                <th className="py-4 px-6">
                  <SortLink label="Name" field="name" currentSort={sortBy} currentOrder={sortOrder} search={search} status={statusFilter} />
                </th>
                <th className="py-4 px-6">
                  <SortLink label="Client" field="client" currentSort={sortBy} currentOrder={sortOrder} search={search} status={statusFilter} />
                </th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Director</th>
                <th className="py-4 px-6 text-right">
                  <SortLink label="Fee Value" field="fee_value" currentSort={sortBy} currentOrder={sortOrder} search={search} status={statusFilter} />
                </th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-6 text-center text-slate-400">
                    No jobs found matching your criteria.
                  </td>
                </tr>
              ) : (
                jobs.map((job: any) => {
                  const hasRiskIssue = job.fee_value > job.project_risk_value;
                  return (
                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 px-6 font-mono text-xs font-semibold text-slate-600">{job.job_number}</td>
                      <td className="py-4.5 px-6 font-medium text-slate-900 max-w-xs truncate">{job.name}</td>
                      <td className="py-4.5 px-6">{job.clients?.name || '—'}</td>
                      <td className="py-4.5 px-6">{job.job_types?.name || '—'}</td>
                      <td className="py-4.5 px-6">{job.director?.full_name || '—'}</td>
                      <td className="py-4.5 px-6 text-right font-medium">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasRiskIssue && (
                            <span className="inline-block text-amber-500" title="Fee exceeds Risk Value!">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </span>
                          )}
                          <span>${job.fee_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            job.job_statuses?.code === 'OPEN'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : job.job_statuses?.code === 'CLOSED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : job.job_statuses?.code === 'ON_HOLD'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {job.job_statuses?.name}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 font-semibold transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            href={`/jobs/${job.id}/edit`}
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-medium transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface SortLinkProps {
  label: string;
  field: string;
  currentSort: string;
  currentOrder: 'asc' | 'desc';
  search: string;
  status: string;
}

function SortLink({ label, field, currentSort, currentOrder, search, status }: SortLinkProps) {
  const active = currentSort === field;
  const nextOrder = active && currentOrder === 'asc' ? 'desc' : 'asc';

  return (
    <Link
      href={`/jobs?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&sortBy=${field}&sortOrder=${nextOrder}`}
      className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors"
    >
      <span>{label}</span>
      <span className="text-slate-400">
        {active && currentOrder === 'asc' && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        )}
        {(!active || currentOrder === 'desc') && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    </Link>
  );
}
