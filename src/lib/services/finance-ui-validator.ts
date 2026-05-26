import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { listJobInvoices } from '@/lib/services/finance-ui';
import { listJobs } from '@/lib/services/job';

export async function validateFinancialUIRenderingIntegrity() {
  try {
    const context = await getOperationalContext();
    const db = await createClient();
    
    // 1. Grab an active job to test against
    const jobs = await listJobs(db, context.tenantId);
    if (jobs.length === 0) {
      return { isHealthy: true, message: 'No jobs available to validate' };
    }

    const testJobId = jobs[0].id;

    // 2. Validate that listJobInvoices returns successfully
    const invoices = await listJobInvoices(db, testJobId, context.tenantId);

    if (!Array.isArray(invoices)) {
       return { isHealthy: false, message: 'listJobInvoices did not return an array' };
    }

    // 3. Verify deterministic constraints
    const hasInvalidStatus = invoices.some(inv => !['DRAFT', 'ISSUED', 'PAID', 'CANCELLED'].includes(inv.status));
    if (hasInvalidStatus) {
        return { isHealthy: false, message: 'An invoice was returned with an invalid lifecycle status.' };
    }

    return { 
        isHealthy: true, 
        invoiceCount: invoices.length 
    };
  } catch (error: any) {
    return { isHealthy: false, message: error.message };
  }
}
