import { InvoiceStatus } from '@/lib/dtos/finance';

export const INVOICE_LIFECYCLE = {
  DRAFT: 'DRAFT',
  ISSUED: 'ISSUED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

export function canMutateInvoice(currentStatus: InvoiceStatus): boolean {
  return currentStatus === INVOICE_LIFECYCLE.DRAFT;
}

export function canIssueInvoice(currentStatus: InvoiceStatus): boolean {
  return currentStatus === INVOICE_LIFECYCLE.DRAFT;
}

export function canPayInvoice(currentStatus: InvoiceStatus): boolean {
  return currentStatus === INVOICE_LIFECYCLE.ISSUED;
}
