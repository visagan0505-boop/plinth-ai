'use server';

import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { getDashboardMetrics, getActivityFeed } from '@/lib/services/dashboard';
import { DashboardMetricsDTO, ActivityFeedEventDTO } from '@/lib/dtos/dashboard';

export async function fetchDashboardDataAction(): Promise<{
  success: boolean;
  metrics?: DashboardMetricsDTO;
  activityFeed?: ActivityFeedEventDTO[];
  error?: string;
}> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const [metrics, activityFeed] = await Promise.all([
      getDashboardMetrics(db, context.tenantId),
      getActivityFeed(db, context.tenantId)
    ]);

    return { success: true, metrics, activityFeed };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
