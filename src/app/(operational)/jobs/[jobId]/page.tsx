import { createClient } from '@/lib/supabase/server';
import { getOperationalContext } from '@/lib/auth/session';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JobStructureView } from './JobStructureView';

interface PageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const context = await getOperationalContext();
  const db = await createClient();
  const { jobId } = await params;

  // Fetch job details with joined entities
  const { data: job, error } = await db
    .from('jobs')
    .select(`
      *,
      clients ( id, name, industry, website, billing_address ),
      job_statuses ( id, name, code, description ),
      job_types ( id, name, description ),
      risk_tiers ( id, name, code, description, min_fee_value, max_fee_value, requires_director_signoff, requires_peer_review, requires_pi_insurance_check ),
      director:staff!fk_jobs_pd ( id, full_name, email ),
      manager:staff!fk_jobs_dm ( id, full_name, email ),
      primary_office:office_locations!fk_jobs_office ( id, name, code, timezone )
    `)
    .eq('id', jobId)
    .eq('tenant_id', context.tenantId)
    .single();

  const { data: phases } = await db
    .from('job_phases')
    .select(`
      *,
      job_scopes (
        *,
        job_components (*)
      )
    `)
    .eq('job_id', jobId)
    .eq('tenant_id', context.tenantId)
    .order('sort_order', { ascending: true });

  if (error || !job) {
    console.error('Error fetching job details:', error);
    notFound();
  }

  const hasRiskIssue = job.fee_value > job.project_risk_value;
  const siteAddress = job.site_address as any;
  const billingAddress = job.clients?.billing_address as any;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Back Button & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs List
        </Link>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href={`/jobs/${job.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <svg className="h-4.5 w-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Job
          </Link>
          <Link
            href={`/jobs/${job.id}/financials`}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            Financials Overview
          </Link>
        </div>
      </div>

      {/* Exceeded Risk Warning Banner */}
      {hasRiskIssue && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
          <div className="flex gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Governance Warning: Risk Exceeded</h3>
              <p className="mt-1 text-sm leading-relaxed text-amber-800">
                The job's calculated fee value (<span className="font-semibold">${job.fee_value.toLocaleString()}</span>) exceeds the allocated project risk limit (<span className="font-semibold">${job.project_risk_value.toLocaleString()}</span>). Under consultancy guidelines, risk assessment approval is required.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Detail Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {job.job_number}
              </span>
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
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{job.name}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Allocated Fee</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              ${job.fee_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Core Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Engagement Details</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-sm">
                <div>
                  <dt className="text-slate-500 font-medium">Job Type</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{job.job_types?.name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Risk Tier</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{job.risk_tiers?.name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Opened Date</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{job.opened_date}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Target Completion</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{job.target_completion_date || '—'}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Staff & Governance</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 text-sm">
                <div>
                  <dt className="text-slate-500 font-medium">Project Director</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{job.director?.full_name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Design Manager</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{job.manager?.full_name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Primary Office</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{job.primary_office?.name || '—'}</dd>
                </div>
              </dl>
            </div>

            {job.description && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            )}
          </div>

          {/* Right Column - Client & Site */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Client Information</h3>
              <dl className="space-y-3.5 text-sm">
                <div>
                  <dt className="text-slate-500 font-medium">Client Organisation</dt>
                  <dd className="font-semibold text-slate-900 mt-0.5">{job.clients?.name || '—'}</dd>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-slate-500 font-medium">Industry</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">{job.clients?.industry || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Website</dt>
                    <dd className="font-semibold text-indigo-600 hover:underline mt-0.5 truncate">
                      {job.clients?.website ? (
                        <a href={job.clients.website} target="_blank" rel="noreferrer">
                          {job.clients.website}
                        </a>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                </div>
                {billingAddress && (
                  <div>
                    <dt className="text-slate-500 font-medium">Billing Address</dt>
                    <dd className="text-slate-700 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs leading-relaxed font-mono">
                      {billingAddress.street}
                      {billingAddress.suburb && `, ${billingAddress.suburb}`}
                      <br />
                      {billingAddress.city}
                      {billingAddress.region && `, ${billingAddress.region}`}
                      {billingAddress.postcode && ` ${billingAddress.postcode}`}
                      <br />
                      {billingAddress.country}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">NZ Land & Site Registry</h3>
              <dl className="space-y-3.5 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-slate-500 font-medium">Lot Number</dt>
                    <dd className="font-mono text-xs font-bold text-slate-800 mt-0.5 bg-slate-50 px-2 py-1.5 rounded border border-slate-100">{job.lot_number || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">DP Number</dt>
                    <dd className="font-mono text-xs font-bold text-slate-800 mt-0.5 bg-slate-50 px-2 py-1.5 rounded border border-slate-100">{job.dp_number || '—'}</dd>
                  </div>
                </div>
                {siteAddress && (
                  <div>
                    <dt className="text-slate-500 font-medium">Site Address</dt>
                    <dd className="text-slate-700 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs leading-relaxed font-mono">
                      {siteAddress.street}
                      {siteAddress.suburb && `, ${siteAddress.suburb}`}
                      <br />
                      {siteAddress.city}
                      {siteAddress.region && `, ${siteAddress.region}`}
                      {siteAddress.postcode && ` ${siteAddress.postcode}`}
                      <br />
                      {siteAddress.country}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Risk Governance Summary */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Governance Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GovernanceFlag label="Director Sign-off Required" active={!!job.risk_tiers?.requires_director_signoff} />
            <GovernanceFlag label="Peer Review Required" active={!!job.risk_tiers?.requires_peer_review} />
            <GovernanceFlag label="PI Insurance Check Required" active={!!job.risk_tiers?.requires_pi_insurance_check} />
          </div>
        </div>
      </div>

      {/* Operational Breakdown */}
      <JobStructureView jobId={job.id} phases={phases || []} />
    </div>
  );
}

function GovernanceFlag({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm font-medium ${
        active
          ? 'bg-rose-50/50 border-rose-200 text-rose-800'
          : 'bg-slate-50/50 border-slate-200 text-slate-400'
      }`}
    >
      {active ? (
        <svg className="h-5 w-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ) : (
        <svg className="h-5 w-5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <span>{label}</span>
    </div>
  );
}
