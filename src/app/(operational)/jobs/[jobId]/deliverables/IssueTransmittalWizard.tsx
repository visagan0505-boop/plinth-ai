'use client';

import { useState } from 'react';
import { issueTransmittalAction } from '@/app/actions/deliverable';

export function IssueTransmittalWizard({ jobId, deliverables, onClose, onSuccess }: { jobId: string, deliverables: any[], onClose: () => void, onSuccess: (t: any) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [reason, setReason] = useState('For Information');
  const [message, setMessage] = useState('');
  
  // Find all DRAFT revisions that have files attached (for realism, though our strict rule is just DRAFT)
  const availableDrafts: any[] = [];
  deliverables.forEach(d => {
    const drafts = d.revisions.filter((r: any) => r.status === 'DRAFT');
    drafts.forEach((dr: any) => {
      availableDrafts.push({ ...dr, deliverable: d });
    });
  });

  const [selectedRevIds, setSelectedRevIds] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setSelectedRevIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRevIds.length === 0) {
      setError('You must select at least one revision to issue.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const res = await issueTransmittalAction({
      jobId,
      issueReason: reason,
      message,
      revisionIds: selectedRevIds
    });
    
    if (res.success) {
      onSuccess(res.data);
    } else {
      setError(res.message || 'Failed to issue transmittal.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Issue Transmittal</h2>
            <p className="text-slate-300 text-xs mt-0.5">Formal release of engineering records.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 mb-6 font-semibold">
              {error}
            </div>
          )}
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-amber-800 text-sm flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Immutability Warning
            </h4>
            <p className="text-xs text-amber-700 mt-1">
              Issuing a transmittal permanently locks all selected revisions. This action cannot be undone. Any future changes will require generating new sequential revisions.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Issue Reason</label>
                <select 
                  value={reason} 
                  onChange={e => setReason(e.target.value)}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                >
                  <option>For Information</option>
                  <option>For Coordination</option>
                  <option>For Consent / Approval</option>
                  <option>For Tender</option>
                  <option>For Construction</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Revisions to Issue</label>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {availableDrafts.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No Draft revisions available to issue.</div>
                ) : (
                  availableDrafts.map(draft => (
                    <label key={draft.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={selectedRevIds.includes(draft.id)}
                        onChange={() => handleToggle(draft.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded">{draft.deliverable.deliverable_code}</span>
                          <span className="font-semibold text-sm text-slate-900">{draft.deliverable.name}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Revision <span className="font-mono font-bold text-slate-700">{draft.revision_number}</span> 
                          {draft.file_url ? ' • PDF Attached' : ' • No File Attached'}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Transmittal Message (Optional)</label>
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="Include a cover note..."
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
        </form>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || selectedRevIds.length === 0}
            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Locking...' : 'Lock & Issue Transmittal'}
          </button>
        </div>
      </div>
    </div>
  );
}
