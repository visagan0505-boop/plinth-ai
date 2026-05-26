import React from 'react';
import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { getInvoiceById } from '@/lib/services/invoice';
import IssueInvoiceButton from './IssueInvoiceButton';

export default async function InvoiceDetailPage({ params }: { params: { jobId: string, invoiceId: string } }) {
  const context = await getOperationalContext();
  const db = await createClient();

  let invoice;
  try {
    invoice = await getInvoiceById(db, params.invoiceId, context.tenantId);
  } catch (err: any) {
    return <div className="p-8 text-red-600">Error: {err.message}</div>;
  }

  const isDraft = invoice.status === 'DRAFT';

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Invoice: {invoice.invoice_number || 'DRAFT'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Status: {invoice.status}</p>
        </div>
        <div>
          <IssueInvoiceButton invoiceId={invoice.id} jobId={params.jobId} isDraft={isDraft} />
        </div>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Line Items</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.invoice_line_items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{Number(item.quantity).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">${Number(item.unit_price).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">${Number(item.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-500">Subtotal</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">${Number(invoice.subtotal).toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-500">Tax</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">${Number(invoice.tax_total).toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-lg font-bold text-gray-900">Total</td>
                <td className="px-6 py-4 text-right text-lg font-bold text-gray-900">${Number(invoice.total_amount).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {invoice.notes && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Notes</h2>
          <div className="bg-gray-50 p-4 rounded text-gray-700 whitespace-pre-wrap">
            {invoice.notes}
          </div>
        </section>
      )}
    </div>
  );
}
