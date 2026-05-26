import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getOperationalContext } from '@/lib/auth/session';
import JobForm from '../JobForm';
import Link from 'next/link';

export default async function NewJobPage() {
  const context = await getOperationalContext();
  const db = await createClient();

  // Parallel lookup loading
  const [
    { data: clients },
    { data: statuses },
    { data: jobTypes },
    { data: riskTiers },
    { data: staff },
    { data: offices },
  ] = await Promise.all([
    db.from('clients').select('id, name').eq('tenant_id', context.tenantId).eq('status', 'active').order('name'),
    db.from('job_statuses').select('id, name').eq('tenant_id', context.tenantId).eq('active', true).order('sort_order'),
    db.from('job_types').select('id, name').eq('tenant_id', context.tenantId).eq('active', true).order('sort_order'),
    db.from('risk_tiers').select('id, name').eq('tenant_id', context.tenantId).eq('active', true).order('sort_order'),
    db.from('staff').select('id, full_name').eq('tenant_id', context.tenantId).eq('is_active', true).order('full_name'),
    db.from('office_locations').select('id, name').eq('tenant_id', context.tenantId).eq('active', true).order('sort_order'),
  ]);

  const lookups = {
    clients: clients || [],
    statuses: statuses || [],
    jobTypes: jobTypes || [],
    riskTiers: riskTiers || [],
    staff: staff || [],
    offices: offices || [],
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-3"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs List
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create New Job</h1>
        <p className="text-sm text-slate-500 mt-1">Initiate a new structural engineering consultancy engagement.</p>
      </div>

      <JobForm lookups={lookups} />
    </div>
  );
}
