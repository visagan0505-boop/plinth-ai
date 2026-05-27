import { createClient } from '@/lib/supabase/server';
import { getOperationalContext } from '@/lib/auth/session';
import { TimeEntryManager } from './TimeEntryManager';
import { listTimeEntries } from '@/lib/services/time-entry';

export default async function TimeEntryPage() {
  const context = await getOperationalContext();
  const db = await createClient();

  // Fetch recent time entries for the user
  const entries = await listTimeEntries(db, context.tenantId, { staffId: context.staffId });

  // Fetch all jobs and their operational hierarchy to power the dependent dropdowns
  const { data: jobs, error } = await (db as any)
    .from('jobs')
    .select(`
      id, name, job_number,
      job_phases (
        id, name, sort_order,
        job_scopes (
          id, name, sort_order,
          job_components (
            id, name, sort_order
          )
        )
      )
    `)
    .eq('tenant_id', context.tenantId);

  if (error) {
    console.error('Failed to load jobs for time entry form', error);
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Operational Telemetry</h1>
        <p className="mt-2 text-sm text-slate-600">
          Log effort against engineering scopes. Entries are immutable records of truth.
        </p>
      </div>

      <TimeEntryManager initialEntries={entries || []} jobs={jobs || []} />
    </div>
  );
}
