import { createClient } from '@/lib/supabase/server';
import { getOperationalContext } from '@/lib/auth/session';
import { getGlobalFinancialBurn, getJobPhaseFinancialBurn, getHighChurnDeliverables, getRecentActivityLog } from '@/lib/services/intelligence';
import { notFound } from 'next/navigation';

export default async function GlobalDashboardPage() {
  const context = await getOperationalContext();
  const db = await createClient();

  // 1. Fetch Global Burn Ledger
  const globalBurn = await getGlobalFinancialBurn(db, context.tenantId);
  
  // 2. Fetch Risky Deliverables across all jobs
  const highChurnDocs = await getHighChurnDeliverables(db, context.tenantId);

  // 3. Fetch Recent Activity
  const recentActivity = await getRecentActivityLog(db, context.tenantId, 15);

  const totalGlobalBudget = globalBurn.reduce((sum, job) => sum + (job.total_fee_budget || 0), 0);
  const totalGlobalCost = globalBurn.reduce((sum, job) => sum + (job.total_cost_burn || 0), 0);
  const totalGlobalBillable = globalBurn.reduce((sum, job) => sum + (job.total_billable_value || 0), 0);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-6 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Operational Intelligence</h1>
        <p className="mt-1 text-sm text-slate-600">
          Deterministic visibility derived directly from immutable telemetry and transmittal ledgers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Active Budget</div>
          <div className="text-3xl font-black text-slate-900 mt-2">${totalGlobalBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Cost Burn</div>
          <div className="text-3xl font-black text-rose-700 mt-2">${totalGlobalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <div className="text-xs font-semibold text-slate-400 mt-1">Derived from time entries x cost rate</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Billable Value</div>
          <div className="text-3xl font-black text-emerald-700 mt-2">${totalGlobalBillable.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <div className="text-xs font-semibold text-slate-400 mt-1">Derived from time entries x charge rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Job WIP Burn</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {globalBurn.length === 0 && <div className="p-6 text-center text-sm text-slate-500">No telemetry recorded.</div>}
              {globalBurn.map((job) => {
                const percentBurn = job.total_fee_budget > 0 ? (job.total_cost_burn / job.total_fee_budget) * 100 : 0;
                return (
                  <div key={job.job_id} className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-slate-900">{job.job_number} - {job.job_name}</div>
                      <div className="font-mono text-sm font-bold text-slate-700">
                        ${job.total_cost_burn.toLocaleString()} / ${job.total_fee_budget.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full ${percentBurn > 90 ? 'bg-rose-500' : percentBurn > 70 ? 'bg-amber-400' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(percentBurn, 100)}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-500 text-right">
                      {percentBurn.toFixed(1)}% burned
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
                High-Churn Risk
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {highChurnDocs.length === 0 && <div className="text-sm text-slate-500">No high-churn deliverables detected.</div>}
              {highChurnDocs.map(d => (
                <div key={d.id} className="bg-rose-50 border border-rose-100 rounded-lg p-3">
                  <div className="font-mono text-xs font-bold text-rose-700 mb-1">{d.deliverable_code}</div>
                  <div className="text-sm font-semibold text-slate-900 truncate">{d.name}</div>
                  <div className="text-xs text-rose-600 font-semibold mt-2">{d.totalRevisions} Drafts created, 0 Issued.</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Recent Operational Flow</h3>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.map(event => (
                <div key={event.id} className="flex gap-3 text-sm">
                  <div className="text-slate-400 font-mono text-[10px] mt-1 whitespace-nowrap">
                    {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">{event.staff?.full_name || 'System'}</span>
                    <span className="text-slate-600 ml-1">triggered</span>
                    <span className="ml-1 font-mono text-xs text-indigo-600 bg-indigo-50 px-1 rounded">{event.event_type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
