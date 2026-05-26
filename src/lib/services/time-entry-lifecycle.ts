import { TimeEntryStatus } from '@/lib/dtos/time-entry';

export const TIME_ENTRY_LIFECYCLE = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  LOCKED: 'LOCKED',
} as const;

export function canMutateEntry(currentStatus: TimeEntryStatus): boolean {
  return currentStatus === TIME_ENTRY_LIFECYCLE.DRAFT;
}

export function canSubmitEntry(currentStatus: TimeEntryStatus): boolean {
  return currentStatus === TIME_ENTRY_LIFECYCLE.DRAFT;
}

export function canApproveEntry(currentStatus: TimeEntryStatus): boolean {
  return currentStatus === TIME_ENTRY_LIFECYCLE.SUBMITTED;
}

// In a fully developed system, this would query a 'financial_periods' table
// to check if the operationalDate falls into a closed accounting month.
export function isOperationalDateLocked(operationalDate: string): boolean {
  // Mock logic: cannot enter time before Jan 1, 2026
  return new Date(operationalDate) < new Date('2026-01-01');
}
