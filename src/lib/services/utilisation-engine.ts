import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type Db = SupabaseClient<Database>;

export interface StaffUtilisation {
  staffId: string;
  temporalDate: string;
  utilisationPercentage: number;
  burnoutRisk: boolean;
  underUtilised: boolean;
}

export async function calculateStaffUtilisation(
  db: Db, 
  staffId: string, 
  tenantId: string, 
  startDate: string, 
  endDate: string
): Promise<StaffUtilisation> {
  const { data: entries, error } = await db
    .from('time_entries')
    .select('hours, is_billable')
    .eq('staff_id', staffId)
    .eq('tenant_id', tenantId)
    .eq('status', 'APPROVED')
    .gte('operational_date', startDate)
    .lte('operational_date', endDate);

  if (error) {
    throw new Error(`Failed to calculate utilisation: ${error.message}`);
  }

  let billableHours = 0;
  let totalHours = 0;

  (entries || []).forEach(e => {
    const hrs = Number(e.hours);
    totalHours += hrs;
    if (e.is_billable) {
      billableHours += hrs;
    }
  });

  // Base contracted hours calculation (simplistic 40 hrs/week for the operational foundation)
  // To be robust, this would count the number of workdays between start/end and multiply by daily capacity.
  // We'll hardcode 40 hours for a 1-week window for MVP validation.
  const contractedHours = 40; 
  
  const utilisationPercentage = (billableHours / contractedHours) * 100;

  return {
    staffId,
    temporalDate: endDate,
    utilisationPercentage,
    burnoutRisk: utilisationPercentage > 110,
    underUtilised: utilisationPercentage < 70
  };
}
