import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { CreateInvoiceDTO, UpdateInvoiceDTO } from '@/lib/dtos/finance';
import { canMutateInvoice, canIssueInvoice, canPayInvoice, INVOICE_LIFECYCLE } from '@/lib/services/finance-lifecycle';
import { dispatchDomainEvent } from '@/lib/services/events';
import { generateInvoiceNumber } from '@/lib/services/sequence';

type Db = SupabaseClient<Database>;

export async function getInvoiceById(db: Db, invoiceId: string, tenantId: string): Promise<any> {
  const { data, error } = await db
    .from('invoices')
    .select(`
      *,
      invoice_line_items(*)
    `)
    .eq('id', invoiceId)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !data) {
    throw new Error(`Invoice not found: ${error?.message}`);
  }

  return data;
}

export async function createInvoice(
  db: Db,
  dto: CreateInvoiceDTO,
  tenantId: string,
  auditorId: string
): Promise<any> {
  const subtotal = dto.lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxTotal = subtotal * 0.15; // Mock 15% tax
  const totalAmount = subtotal + taxTotal;

  // 1. Insert Invoice
  const { data: invoice, error } = await db
    .from('invoices')
    .insert({
      tenant_id: tenantId,
      job_id: dto.jobId,
      status: INVOICE_LIFECYCLE.DRAFT,
      subtotal,
      tax_total: taxTotal,
      total_amount: totalAmount,
      notes: dto.notes || null,
      created_by: auditorId,
      updated_by: auditorId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invoice: ${error.message}`);
  }

  // 2. Insert Line Items
  const lineItemsPayload = dto.lineItems.map(item => ({
    tenant_id: tenantId,
    invoice_id: invoice.id,
    job_phase_id: item.jobPhaseId || null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    amount: item.quantity * item.unitPrice,
  }));

  const { error: lineItemsError } = await db
    .from('invoice_line_items')
    .insert(lineItemsPayload);

  if (lineItemsError) {
    throw new Error(`Failed to create line items: ${lineItemsError.message}`);
  }

  await dispatchDomainEvent(db, tenantId, 'invoice.drafted', 'invoice', invoice.id, auditorId, {
    job_id: dto.jobId,
    total_amount: totalAmount
  });

  return getInvoiceById(db, invoice.id, tenantId);
}

export async function issueInvoice(
  db: Db,
  invoiceId: string,
  tenantId: string,
  auditorId: string
): Promise<any> {
  const invoice = await getInvoiceById(db, invoiceId, tenantId);

  if (!canIssueInvoice(invoice.status)) {
    throw new Error(`Cannot issue invoice from ${invoice.status} state.`);
  }

  const invoiceNumber = await generateInvoiceNumber(db, tenantId);

  const { data, error } = await db
    .from('invoices')
    .update({
      status: INVOICE_LIFECYCLE.ISSUED,
      invoice_number: invoiceNumber,
      issued_at: new Date().toISOString(),
      updated_by: auditorId,
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to issue invoice: ${error.message}`);
  }

  await dispatchDomainEvent(db, tenantId, 'invoice.issued', 'invoice', invoiceId, auditorId, {
    invoice_number: invoiceNumber,
    issued_at: data.issued_at
  });

  return data;
}
