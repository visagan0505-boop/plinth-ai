import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { listStaff } from '@/lib/services/staff';

export async function validateStaffCRUDIntegrity() {
  try {
    const context = await getOperationalContext();
    const db = await createClient();
    
    // Test the Read query which exercises RLS
    const staff = await listStaff(db, context.tenantId);
    
    if (!Array.isArray(staff)) {
      return { isHealthy: false, message: 'listStaff did not return an array' };
    }

    // Verify audit semantics are present on returned rows
    const firstStaff = staff[0];
    if (firstStaff && firstStaff.created_at === undefined) {
       return { isHealthy: false, message: 'Audit semantics missing from staff row' };
    }

    return { isHealthy: true, staffCount: staff.length };
  } catch (error: any) {
    return { isHealthy: false, message: error.message };
  }
}
