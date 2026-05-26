# Staff Service Architecture

## Objective
Isolate database mutation logic from Next.js server actions.

## Structure

```typescript
// src/lib/services/staff.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type Db = SupabaseClient<Database>;

export async function createStaff(
  db: Db, 
  dto: CreateStaffDTO, 
  auditorId: string
) {
  // DB interaction using standard RLS client
}
```

## Dependency Injection
By passing the `SupabaseClient` instance (`db`) into the service functions, we make the services highly testable and agnostic to whether they are called from a Server Action, an API Route, or an Edge Function. It also guarantees that the caller correctly established the RLS context prior to calling the service.
