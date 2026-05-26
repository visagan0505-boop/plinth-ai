'use client';

import React, { useState } from 'react';
import { issueInvoiceAction } from '@/app/actions/finance';
import { useRouter } from 'next/navigation';

export default function IssueInvoiceButton({ invoiceId, jobId, isDraft }: { invoiceId: string, jobId: string, isDraft: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isDraft) return null;

  async function handleIssue() {
    setLoading(true);
    const res = await issueInvoiceAction(invoiceId, jobId);
    setLoading(false);
    if (res.success) {
      router.refresh();
    } else {
      alert(`Error issuing invoice: ${'message' in res ? res.message : 'Validation failed'}`);
    }
  }

  return (
    <button
      onClick={handleIssue}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? 'Issuing...' : 'Issue Invoice (Lock)'}
    </button>
  );
}
