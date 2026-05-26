import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { getDashboardMetrics } from '@/lib/services/dashboard';

export async function validateDashboardIntegrity() {
  try {
    const context = await getOperationalContext();
    const db = await createClient();
    
    const metrics = await getDashboardMetrics(db, context.tenantId);
    
    if (typeof metrics.activeJobsCount !== 'number') {
      return { isHealthy: false, message: 'Aggregation failed for active jobs count' };
    }

    if (typeof metrics.utilisationSnapshot !== 'number') {
      return { isHealthy: false, message: 'Aggregation failed for utilisation' };
    }

    return { isHealthy: true, metrics };
  } catch (error: any) {
    return { isHealthy: false, message: error.message };
  }
}
