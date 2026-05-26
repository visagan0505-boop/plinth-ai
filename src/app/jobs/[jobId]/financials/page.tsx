import React from 'react';
import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { getJobProfitabilityAction } from '@/app/actions/finance';
import { listJobInvoices } from '@/lib/services/finance-ui';
import Link from 'next/link';

export default async function JobFinancialsPage({ params }: { params: { jobId: string } }) {
  const context = await getOperationalContext();
  const db = await createClient();

  const [profitabilityRes, invoices] = await Promise.all([
    getJobProfitabilityAction(params.jobId),
    listJobInvoices(db, params.jobId, context.tenantId)
  ]);

  if (!profitabilityRes.success) {
    return <div className="p-8 text-red-600">Error: {profitabilityRes.error}</div>;
  }

  const { data: profit } = profitabilityRes;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Job Financials</h1>
        <p className="text-sm text-gray-500 mt-2">Operational WIP and Realized Profitability</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">WIP Operational Visibility</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Total Fee Value" value={`$${profit.wipSnapshot.jobFeeValue.toLocaleString()}`} />
          <MetricCard title="Remaining Fee Budget" value={`$${profit.wipSnapshot.remainingFeeBudget.toLocaleString()}`} />
          <MetricCard title="Unbilled WIP Value" value={`$${profit.wipSnapshot.unbilledWipValue.toLocaleString()}`} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Profitability Snapshot</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Realized Revenue" value={`$${profit.realizedRevenue.toLocaleString()}`} />
          <MetricCard title="Total Operational Cost" value={`$${profit.totalOperationalCost.toLocaleString()}`} />
          <MetricCard 
            title="Profit Margin" 
            value={`${profit.profitMarginPercentage.toFixed(1)}% ($${profit.profitMarginValue.toLocaleString()})`} 
          />
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invoices</h2>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued Date</th>
                <th className="px-6 py-3 relative"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.invoice_number || 'DRAFT'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(inv.total_amount).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/jobs/${params.jobId}/invoices/${inv.id}`} className="text-blue-600 hover:text-blue-900">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No invoices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ title, value }: { title: string, value: string | number }) {
  return (
    <div className="bg-white overflow-hidden rounded-lg shadow px-4 py-5 sm:p-6">
      <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{value}</dd>
    </div>
  );
}
