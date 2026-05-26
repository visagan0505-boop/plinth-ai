# Staff Deactivation Strategy

## The Principle of Non-Destruction
Operational entities (Staff, Jobs, Clients) participate in temporal models (billing rates, historical documents, timesheets). Hard-deleting a staff member would recursively destroy historical timesheets or orphan them, breaking financial integrity.

## Soft-Deletes via `is_active`
Instead of `DELETE FROM public.staff`, we mutate state:

```sql
UPDATE public.staff 
SET is_active = false, updated_by = :userId 
WHERE id = :staffId;
```

## UI Implications
- Active lists (e.g., "Assign to Project" dropdowns) will append `.eq('is_active', true)` to queries.
- Historical lists (e.g., "All past and present employees") will simply omit the filter.
- By never deleting the row, historical `created_by` references across the entire database remain structurally intact forever.
