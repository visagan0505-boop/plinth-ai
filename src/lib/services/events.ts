import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type Db = SupabaseClient<Database>;

export async function dispatchDomainEvent(
  db: Db,
  tenantId: string,
  eventType: string,
  entityType: string,
  entityId: string,
  actorId: string,
  payload: any
): Promise<void> {
  const { error } = await db.from('domain_events').insert({
    tenant_id: tenantId,
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    actor_id: actorId,
    payload: payload,
  });

  if (error) {
    // We log the error but don't strictly crash the request if an event fails to insert.
    // In a high-availability system, this might drop into a dead-letter queue.
    console.error(`Failed to dispatch domain event ${eventType}:`, error);
  }
}
