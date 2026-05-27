import { createClient } from '@/lib/supabase/server';
import { getOperationalContext } from '@/lib/auth/session';
import { notFound } from 'next/navigation';
import { getJobPhaseFinancialBurn, getHighChurnDeliverables } from '@/lib/services/intelligence';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function JobIntelligencePage({ params }: PageProps) {
  const context = await getOperationalContext();
  const db = await createClient();
  const { jobId } = await params;

  // 1. Fetch Job
  const { data: job, error: jobError } = await db
    .from('jobs')
    .select('id, name, job_number')
    .eq('id', jobId)
    .eq('tenant_id', context.tenantId)
    .single();

  if (jobError || !job) notFound();

  // 2. Fetch Phase Burn
  const phaseBurn = await getJobPhaseFinancialBurn(db, context.tenantId, jobId);
  
  // 3. Fetch Deliverable Risk
  const highChurnDocs = await getHighChurnDeliverables(db, context.tenantId, jobId);

  const totalBudget = phaseBurn.reduce((sum, p) => sum + (p.fee_budget || 0), 0);
  const totalCost = phaseBurn.reduce((sum, p) => sum + (p.total_cost_burn || 0), 0);

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Job Intelligence</h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time financial burn and delivery risk indicators for this job.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Job Budget</div>
            <div className="text-xl font-black text-slate-900">${totalBudget.toLocaleString()}</div>
          </div>
          <div className="text-right pl-4 border-l border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Cost Burn</div>
            <div className="text-xl font-black text-rose-700">${totalCost.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Phase Financial Burn</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {phaseBurn.length === 0 && <div className="p-6 text-center text-sm text-slate-500">No telemetry recorded for this job.</div>}
              {phaseBurn.map((phase) => {
                const percentBurn = phase.fee_budget > 0 ? (phase.total_cost_burn / phase.fee_budget) * 100 : 0;
                return (
                  <div key={phase.job_phase_id} className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-slate-900">{phase.phase_name}</div>
                      <div className="font-mono text-sm font-bold text-slate-700">
                        ${phase.total_cost_burn.toLocaleString()} / ${phase.fee_budget.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full ${percentBurn > 90 ? 'bg-rose-500' : percentBurn > 70 ? 'bg-amber-400' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(percentBurn, 100)}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-500 text-right">
                      {percentBurn.toFixed(1)}% burned ({phase.total_hours} hrs logged)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-rose-800 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Delivery Risk
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {highChurnDocs.length === 0 && <div className="text-sm text-slate-500">No high-churn deliverables detected on this job.</div>}
              {highChurnDocs.map(d => (
                <div key={d.id} className="bg-rose-50 border border-rose-100 rounded-lg p-3">
                  <div className="font-mono text-xs font-bold text-rose-700 mb-1">{d.deliverable_code}</div>
                  <div className="text-sm font-semibold text-slate-900 truncate">{d.name}</div>
                  <div className="text-xs text-rose-600 font-semibold mt-2">{d.totalRevisions} Drafts created, 0 Issued.</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
