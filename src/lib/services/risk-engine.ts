import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { calculateJobProfitability } from '@/lib/services/profitability';
import { forecastJobFeeBurn } from '@/lib/services/forecasting-engine';

type Db = SupabaseClient<Database>;

export interface JobRiskScore {
  jobId: string;
  healthScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  flags: string[];
}

export async function calculateJobRiskScore(db: Db, jobId: string, tenantId: string): Promise<JobRiskScore> {
  let healthScore = 100;
  const flags: string[] = [];

  // 1. Current Profitability Reality Check
  const profit = await calculateJobProfitability(db, jobId, tenantId);
  
  if (profit.profitMarginPercentage < 0) {
    healthScore -= 40;
    flags.push('CRITICAL_OVERBURN: Job is currently loss-making.');
  } else if (profit.profitMarginPercentage < 15) {
    healthScore -= 20;
    flags.push('LOW_MARGIN: Profit margin has degraded below 15%.');
  }

  // 2. Billing Neglect Check
  if (profit.unbilledWipValue > (profit.wipSnapshot.jobFeeValue * 0.3)) {
    healthScore -= 15;
    flags.push('BILLING_DELAY: Unbilled WIP exceeds 30% of total fee. High risk of non-recovery.');
  }

  // 3. Forecasting Check
  const forecast = await forecastJobFeeBurn(db, jobId, tenantId);
  if (forecast.confidenceScore >= 0.4 && forecast.weeksUntilFeeDepletion !== -1) {
    if (forecast.weeksUntilFeeDepletion < 2 && profit.wipSnapshot.remainingFeeBudget > 0) {
      healthScore -= 20;
      flags.push('ACCELERATED_BURN: Forecast indicates fee budget depletion within 2 weeks.');
    }
  }

  // 4. NLP Revision Pressure Check (Scanning notes for 'revision')
  const { data: textEntries } = await db
    .from('time_entries')
    .select('notes')
    .eq('job_id', jobId)
    .eq('tenant_id', tenantId)
    .ilike('notes', '%revision%');

  if (textEntries && textEntries.length > 3) {
    healthScore -= 15;
    flags.push('REVISION_PRESSURE: High frequency of "revision" keywords logged by staff.');
  }

  // Normalize
  healthScore = Math.max(0, Math.min(100, healthScore));

  let riskLevel: JobRiskScore['riskLevel'] = 'LOW';
  if (healthScore < 50) riskLevel = 'CRITICAL';
  else if (healthScore < 70) riskLevel = 'HIGH';
  else if (healthScore < 85) riskLevel = 'MEDIUM';

  return {
    jobId,
    healthScore,
    riskLevel,
    flags
  };
}
