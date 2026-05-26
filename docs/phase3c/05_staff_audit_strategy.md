# Staff Audit Strategy

## Problem
We need to know who created or updated an operational record to satisfy engineering compliance and domain event reconstruction.

## Implementation
Every mutation payload in the service layer must explicitly append the actor's ID:

```typescript
const insertPayload = {
  ...dto,
  created_by: auditorId,
  updated_by: auditorId,
};
```

For updates:
```typescript
const updatePayload = {
  ...dto,
  updated_by: auditorId,
  updated_at: new Date().toISOString(), // Optional, DB trigger handles this too
};
```

## Security
Because the `auditorId` comes directly from the server-validated session (`getOperationalContext().userId`), it is immune to client-side spoofing. Users cannot forge an action on behalf of another staff member.
