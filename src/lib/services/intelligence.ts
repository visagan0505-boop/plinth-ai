import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type Db = SupabaseClient<Database>;

// ----------------------------------------------------------------------------
// PROFITABILITY BURN AGGREGATIONS
// ----------------------------------------------------------------------------

export async function getGlobalFinancialBurn(db: Db, tenantId: string) {
  // Returns the high-level burn metrics for all jobs
  const { data, error } = await db
    .from('vw_job_financial_burn')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('total_cost_burn', { ascending: false });

  if (error) throw new Error(`Failed to fetch global burn: ${error.message}`);
  return data || [];
}

export async function getJobPhaseFinancialBurn(db: Db, tenantId: string, jobId: string) {
  // Returns the detailed breakdown of burn by phase for a specific job
  const { data, error } = await db
    .from('vw_phase_financial_burn')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('job_id', jobId)
    .order('total_cost_burn', { ascending: false });

  if (error) throw new Error(`Failed to fetch phase burn: ${error.message}`);
  return data || [];
}

// ----------------------------------------------------------------------------
// REVISION CHURN / DELIVERY RISK
// ----------------------------------------------------------------------------

export async function getHighChurnDeliverables(db: Db, tenantId: string, jobId?: string) {
  // A risk indicator: Deliverables with many revisions but no ISSUED status
  // We use the JS client to derive this for now, but in production we'd use an RPC or View
  const query = db
    .from('deliverables')
    .select(`
      id, deliverable_code, name, job_id,
      revisions ( id, status, revision_number )
    `)
    .eq('tenant_id', tenantId);
    
  if (jobId) {
    query.eq('job_id', jobId);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch deliverable churn: ${error.message}`);

  // Process churn risk (e.g. > 3 revisions, none issued)
  const risky = (data || [])
    .map((d: any) => {
      const revs = d.revisions || [];
      const hasIssued = revs.some((r: any) => r.status === 'ISSUED');
      return {
        ...d,
        totalRevisions: revs.length,
        hasIssued,
        isRisky: revs.length >= 3 && !hasIssued
      };
    })
    .filter(d => d.isRisky)
    .sort((a, b) => b.totalRevisions - a.totalRevisions);

  return risky;
}

// ----------------------------------------------------------------------------
// RECENT ACTIVITY / WORKLOAD VISIBILITY
// ----------------------------------------------------------------------------

export async function getRecentActivityLog(db: Db, tenantId: string, limit: number = 20) {
  // Fetches recent immutable events to show active operational flow
  const { data, error } = await db
    .from('domain_events')
    .select(`
      id, event_type, created_at,
      staff ( full_name )
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch recent activity: ${error.message}`);
  return data || [];
}
