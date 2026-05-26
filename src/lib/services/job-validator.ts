import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { listJobs } from '@/lib/services/job';

export async function validateJobCRUDIntegrity() {
  try {
    const context = await getOperationalContext();
    const db = await createClient();
    
    // Test the Read query which exercises RLS
    const jobs = await listJobs(db, context.tenantId);
    
    if (!Array.isArray(jobs)) {
      return { isHealthy: false, message: 'listJobs did not return an array' };
    }

    // Verify audit semantics are present on returned rows
    const firstJob = jobs[0];
    if (firstJob && firstJob.created_at === undefined) {
       return { isHealthy: false, message: 'Audit semantics missing from job row' };
    }

    return { isHealthy: true, jobCount: jobs.length };
  } catch (error: any) {
    return { isHealthy: false, message: error.message };
  }
}
