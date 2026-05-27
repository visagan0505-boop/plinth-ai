import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { listTimeEntries } from '@/lib/services/time-entry';

export async function validateTimeEntryWorkflowIntegrity() {
  try {
    const context = await getOperationalContext();
    const db = await createClient();
    
    // Test the Read query which exercises RLS
    const entries = await listTimeEntries(db, context.tenantId, { staffId: context.userId });
    
    if (!Array.isArray(entries)) {
      return { isHealthy: false, message: 'listTimeEntries did not return an array' };
    }

    // Verify audit semantics are present on returned rows
    const firstEntry = entries[0];
    if (firstEntry && firstEntry.created_at === undefined) {
       return { isHealthy: false, message: 'Audit semantics missing from time entry row' };
    }

    // Verify rate snapshots
    if (firstEntry && (firstEntry.snapshot_cost_rate === undefined || firstEntry.snapshot_bill_rate === undefined)) {
       return { isHealthy: false, message: 'Rate snapshots missing from time entry row' };
    }

    return { isHealthy: true, entryCount: entries.length };
  } catch (error: any) {
    return { isHealthy: false, message: error.message };
  }
}
