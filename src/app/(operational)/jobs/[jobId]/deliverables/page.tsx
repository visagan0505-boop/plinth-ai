import { createClient } from '@/lib/supabase/server';
import { getOperationalContext } from '@/lib/auth/session';
import { notFound } from 'next/navigation';
import { DeliverablesMatrix } from './DeliverablesMatrix';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function DeliverablesPage({ params }: PageProps) {
  const context = await getOperationalContext();
  const db = await createClient();
  const { jobId } = await params;

  // 1. Fetch Job for context
  const { data: job, error: jobError } = await (db as any)
    .from('jobs')
    .select('id, name, job_number')
    .eq('id', jobId)
    .eq('tenant_id', context.tenantId)
    .single();

  if (jobError || !job) notFound();

  // 2. Fetch Deliverables & Revisions
  const { data: deliverables, error: delivError } = await (db as any)
    .from('deliverables')
    .select(`
      *,
      revisions (*)
    `)
    .eq('tenant_id', context.tenantId)
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });

  // 3. Fetch Transmittal Ledger (Issue History)
  const { data: transmittals, error: transError } = await (db as any)
    .from('transmittals')
    .select(`
      *,
      staff ( full_name ),
      transmittal_items (
        revision_id
      )
    `)
    .eq('tenant_id', context.tenantId)
    .eq('job_id', jobId)
    .order('issue_date', { ascending: true })
    .order('transmittal_number', { ascending: true });

  if (delivError) console.error('Failed to load deliverables', delivError);
  if (transError) console.error('Failed to load transmittals', transError);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <Link
            href={`/jobs/${job.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to {job.job_number} Structure
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Engineering Records</h1>
          <p className="mt-1 text-sm text-slate-600">
            Immutable document register and transmittal ledger.
          </p>
        </div>
      </div>

      <DeliverablesMatrix 
        jobId={job.id} 
        deliverables={deliverables || []} 
        transmittals={transmittals || []} 
      />
    </div>
  );
}
