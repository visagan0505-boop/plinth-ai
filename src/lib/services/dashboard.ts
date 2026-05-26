import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { DashboardMetricsDTO, ActivityFeedEventDTO } from '@/lib/dtos/dashboard';

type Db = SupabaseClient<Database>;

export async function getDashboardMetrics(db: Db, tenantId: string): Promise<DashboardMetricsDTO> {
  const [
    { count: activeJobsCount },
    { count: activeStaffCount },
    { count: submittedTimeEntries },
    { count: approvedTimeEntries },
    { data: activeJobsData },
    { data: timeEntriesData }
  ] = await Promise.all([
    // Active jobs (assuming 'OPEN' or 'ACTIVE_DELIVERY' type logic; we'll count all jobs for now)
    db.from('jobs').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    db.from('staff').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
    db.from('time_entries').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'SUBMITTED'),
    db.from('time_entries').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'APPROVED'),
    // Fetch fee values
    db.from('jobs').select('fee_value').eq('tenant_id', tenantId),
    // Fetch all hours for utilisation (naive implementation for demo, filtering should be done in DB for production)
    db.from('time_entries').select('hours, is_billable').eq('tenant_id', tenantId)
  ]);

  const totalFeeValue = (activeJobsData || []).reduce((acc, job) => acc + Number(job.fee_value), 0);

  const totalHours = (timeEntriesData || []).reduce((acc, entry) => acc + Number(entry.hours), 0);
  const billableHours = (timeEntriesData || []).filter(e => e.is_billable).reduce((acc, entry) => acc + Number(entry.hours), 0);
  
  const utilisationSnapshot = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;

  // For this operational prototype, we spoof week/month bounds, but they should be filtered properly in SQL.
  const totalHoursThisWeek = totalHours; // placeholder
  const totalHoursThisMonth = totalHours; // placeholder

  return {
    activeJobsCount: activeJobsCount || 0,
    activeStaffCount: activeStaffCount || 0,
    submittedTimeEntries: submittedTimeEntries || 0,
    approvedTimeEntries: approvedTimeEntries || 0,
    totalHoursThisWeek,
    totalHoursThisMonth,
    utilisationSnapshot,
    totalFeeValue,
  };
}

export async function getActivityFeed(db: Db, tenantId: string, limit: number = 10): Promise<ActivityFeedEventDTO[]> {
  const { data, error } = await db
    .from('domain_events')
    .select('id, event_type, occurred_at, actor_id')
    .eq('tenant_id', tenantId)
    .order('occurred_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch activity feed: ${error.message}`);
  }

  // In a real app we would join on staff to get actorName.
  return data.map(event => ({
    id: event.id,
    eventType: event.event_type,
    occurredAt: event.occurred_at,
    actorName: 'Staff Member' // Mocked due to no native join setup in this snippet
  }));
}
