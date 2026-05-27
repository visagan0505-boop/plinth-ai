'use client';

import { useState } from 'react';
import { createDeliverableAction } from '@/app/actions/deliverable';
import { RevisionManager } from './RevisionManager';
import { IssueTransmittalWizard } from './IssueTransmittalWizard';

export function DeliverablesMatrix({ jobId, deliverables: initialDeliverables, transmittals: initialTransmittals }: { jobId: string, deliverables: any[], transmittals: any[] }) {
  const [deliverables, setDeliverables] = useState(initialDeliverables);
  const [transmittals, setTransmittals] = useState(initialTransmittals);
  const [isAdding, setIsAdding] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  
  // New Deliverable State
  const [delivCode, setDelivCode] = useState('');
  const [delivName, setDelivName] = useState('');
  const [delivType, setDelivType] = useState('Drawing');

  const handleAddDeliverable = async () => {
    if (!delivCode || !delivName) return;
    const res = await createDeliverableAction({
      jobId,
      deliverableCode: delivCode,
      name: delivName,
      type: delivType
    });
    
    if (res.success) {
      setDeliverables([...deliverables, { ...res.data, revisions: [] }]);
      setDelivCode('');
      setDelivName('');
      setIsAdding(false);
    }
  };

  const handleRevisionUpdated = (updatedRevision: any, deliverableId: string) => {
    setDeliverables(prev => prev.map(d => {
      if (d.id === deliverableId) {
        const existing = d.revisions.findIndex((r: any) => r.id === updatedRevision.id);
        const newRevisions = [...d.revisions];
        if (existing >= 0) newRevisions[existing] = updatedRevision;
        else newRevisions.push(updatedRevision);
        return { ...d, revisions: newRevisions };
      }
      return d;
    }));
  };

  const handleTransmittalIssued = (newTransmittal: any) => {
    // When a transmittal is issued, we need to reload to get the updated status of revisions.
    // In a real app we'd trigger a router refresh or patch state. For now we will force a page reload to ensure strict consistency.
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Document Register Matrix</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-2 rounded-md bg-white border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Add Deliverable
          </button>
          <button
            onClick={() => setIsIssuing(true)}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Issue Transmittal
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm mb-4">
          <input
            type="text"
            placeholder="Code (e.g. S101)"
            value={delivCode}
            onChange={e => setDelivCode(e.target.value)}
            className="w-32 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-1.5 border"
          />
          <input
            type="text"
            placeholder="Deliverable Name"
            value={delivName}
            onChange={e => setDelivName(e.target.value)}
            className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-1.5 border"
          />
          <select 
            value={delivType}
            onChange={e => setDelivType(e.target.value)}
            className="w-40 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-1.5 border"
          >
            <option>Drawing</option>
            <option>Calculation</option>
            <option>Specification</option>
            <option>Report</option>
          </select>
          <button onClick={handleAddDeliverable} className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">Save</button>
        </div>
      )}

      {/* The Matrix */}
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-800 border-r border-slate-200 sticky left-0 bg-slate-50 min-w-[300px]">Deliverable</th>
              {transmittals.map((t, idx) => (
                <th key={t.id} className="px-4 py-3 font-semibold text-slate-600 border-r border-slate-200 text-center min-w-[120px]">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">TR-{t.transmittal_number || idx + 1}</div>
                  <div className="text-xs">{new Date(t.issue_date).toLocaleDateString()}</div>
                </th>
              ))}
              <th className="px-4 py-3 font-bold text-slate-500 text-center w-32">Current State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deliverables.map(d => (
              <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 border-r border-slate-200 sticky left-0 bg-white group-hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 inline-block px-1.5 py-0.5 rounded border border-indigo-100 mb-1">{d.deliverable_code}</div>
                      <div className="font-semibold text-slate-900 truncate max-w-[250px]">{d.name}</div>
                    </div>
                    <RevisionManager deliverable={d} onRevisionUpdated={handleRevisionUpdated} />
                  </div>
                </td>
                
                {/* Historical Cells */}
                {transmittals.map(t => {
                  // Find if this transmittal included any revision for this deliverable
                  const includedRevId = t.transmittal_items?.find((ti: any) => 
                    d.revisions.some((r: any) => r.id === ti.revision_id)
                  )?.revision_id;
                  
                  const rev = includedRevId ? d.revisions.find((r: any) => r.id === includedRevId) : null;
                  
                  return (
                    <td key={t.id} className="px-4 py-3 border-r border-slate-100 text-center align-middle">
                      {rev ? (
                        <span className="font-mono font-bold text-slate-800 text-lg">{rev.revision_number}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  );
                })}
                
                {/* Current State Cell */}
                <td className="px-4 py-3 text-center align-middle bg-slate-50/50">
                  <LatestRevisionBadge revisions={d.revisions} />
                </td>
              </tr>
            ))}
            {deliverables.length === 0 && (
              <tr>
                <td colSpan={transmittals.length + 2} className="px-4 py-8 text-center text-slate-500">
                  No deliverables created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isIssuing && (
        <IssueTransmittalWizard 
          jobId={jobId}
          deliverables={deliverables}
          onClose={() => setIsIssuing(false)}
          onSuccess={handleTransmittalIssued}
        />
      )}
    </div>
  );
}

function LatestRevisionBadge({ revisions }: { revisions: any[] }) {
  if (!revisions || revisions.length === 0) {
    return <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-200 px-2 py-1 rounded-full">Planned</span>;
  }
  
  // Sort revisions by created_at desc to find latest
  const sorted = [...revisions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const latest = sorted[0];
  
  if (latest.status === 'DRAFT') {
    return <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full shadow-sm">WIP (Rev {latest.revision_number})</span>;
  }
  
  return <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full shadow-sm">Issued (Rev {latest.revision_number})</span>;
}
