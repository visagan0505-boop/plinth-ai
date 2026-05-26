import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { calculateJobProfitability } from '@/lib/services/profitability';
import { listJobs } from '@/lib/services/job';

export async function validateFinancialReconstructionIntegrity() {
  try {
    const context = await getOperationalContext();
    const db = await createClient();
    
    // 1. Grab an active job to test against
    const jobs = await listJobs(db, context.tenantId);
    if (jobs.length === 0) {
      return { isHealthy: true, message: 'No jobs available to validate' };
    }

    const testJobId = jobs[0].id;

    // 2. Current Profitability
    const currentProfit = await calculateJobProfitability(db, testJobId, context.tenantId);

    // 3. Historical Replay (Test exactly 1 year ago)
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    const historicalDate = lastYear.toISOString().split('T')[0];
    
    const historicalProfit = await calculateJobProfitability(db, testJobId, context.tenantId, historicalDate);

    // If it successfully completes both structural computations without crashing and respects boundaries, it passes
    if (typeof currentProfit.profitMarginValue !== 'number' || typeof historicalProfit.profitMarginValue !== 'number') {
       return { isHealthy: false, message: 'Profitability calculations failed to return numbers' };
    }

    // Historical cost cannot be greater than current cost (append-only ledger)
    if (historicalProfit.totalOperationalCost > currentProfit.totalOperationalCost) {
        return { isHealthy: false, message: 'Historical replay violated append-only cost constraints' };
    }

    return { 
        isHealthy: true, 
        currentProfit: currentProfit.profitMarginValue, 
        historicalProfit: historicalProfit.profitMarginValue 
    };
  } catch (error: any) {
    return { isHealthy: false, message: error.message };
  }
}
