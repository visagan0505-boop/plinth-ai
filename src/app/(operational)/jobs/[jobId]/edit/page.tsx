import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getOperationalContext } from '@/lib/auth/session';
import JobForm from '../../JobForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function EditJobPage({ params }: PageProps) {
  const context = await getOperationalContext();
  const db = await createClient();
  const { jobId } = await params;

  // Parallel loading of existing job data and lookups
  const [
    { data: job, error: jobError },
    { data: clients },
    { data: statuses },
    { data: jobTypes },
    { data: riskTiers },
    { data: staff },
    { data: offices },
  ] = await Promise.all([
    db.from('jobs').select('*').eq('id', jobId).eq('tenant_id', context.tenantId).single(),
    db.from('clients').select('id, name').eq('tenant_id', context.tenantId).eq('status', 'active').order('name'),
    db.from('job_statuses').select('id, name').eq('tenant_id', context.tenantId).eq('active', true).order('sort_order'),
    db.from('job_types').select('id, name').eq('tenant_id', context.tenantId).eq('active', true).order('sort_order'),
    db.from('risk_tiers').select('id, name').eq('tenant_id', context.tenantId).eq('active', true).order('sort_order'),
    db.from('staff').select('id, full_name').eq('tenant_id', context.tenantId).eq('is_active', true).order('full_name'),
    db.from('office_locations').select('id, name').eq('tenant_id', context.tenantId).eq('active', true).order('sort_order'),
  ]);

  if (jobError || !job) {
    console.error('Error fetching job for edit:', jobError);
    notFound();
  }

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
          href={`/jobs/${job.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-3"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Job Details
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Job: {job.job_number}</h1>
        <p className="text-sm text-slate-500 mt-1">Update parameters or engineering details for {job.name}.</p>
      </div>

      <JobForm initialData={job} lookups={lookups} />
    </div>
  );
}
