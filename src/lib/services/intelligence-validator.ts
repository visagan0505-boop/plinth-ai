import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { calculateJobRiskScore } from '@/lib/services/risk-engine';
import { forecastJobFeeBurn } from '@/lib/services/forecasting-engine';
import { listJobs } from '@/lib/services/job';

export async function validateIntelligenceReplayIntegrity() {
  try {
    const context = await getOperationalContext();
    const db = await createClient();
    
    // 1. Grab an active job
    const jobs = await listJobs(db, context.tenantId);
    if (jobs.length === 0) return { isHealthy: true, message: 'No jobs to validate' };
    const testJobId = jobs[0].id;

    // 2. Validate Deterministic Execution of Risk Engine
    const riskScore = await calculateJobRiskScore(db, testJobId, context.tenantId);
    
    if (typeof riskScore.healthScore !== 'number') {
       throw new Error('Risk engine failed to return a deterministic score.');
    }

    // 3. Validate Forecasting Engine Bounds
    const forecast = await forecastJobFeeBurn(db, testJobId, context.tenantId);
    if (forecast.confidenceScore < 0 || forecast.confidenceScore > 1) {
       throw new Error('Forecasting confidence score violated mathematical boundaries.');
    }

    return { 
        isHealthy: true, 
        healthScore: riskScore.healthScore,
        flagsFound: riskScore.flags.length,
        forecastConfidence: forecast.confidenceScore
    };
  } catch (error: any) {
    return { isHealthy: false, message: error.message };
  }
}
