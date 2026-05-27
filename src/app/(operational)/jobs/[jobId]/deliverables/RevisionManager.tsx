'use client';

import { useState } from 'react';
import { createRevisionAction, updateRevisionAction } from '@/app/actions/deliverable';

export function RevisionManager({ deliverable, onRevisionUpdated }: { deliverable: any, onRevisionUpdated: (rev: any, dId: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newRevNum, setNewRevNum] = useState('');

  const handleAdd = async () => {
    if (!newRevNum) return;
    const res = await createRevisionAction({
      deliverableId: deliverable.id,
      revisionNumber: newRevNum
    });
    if (res.success) {
      onRevisionUpdated(res.data, deliverable.id);
      setIsAdding(false);
      setNewRevNum('');
    }
  };

  const handleAttachFile = async (revId: string) => {
    // Simulate attaching a blob URL
    const fakeUrl = `https://blob.plinth.ai/files/${deliverable.deliverable_code}_rev_${Date.now()}.pdf`;
    const res = await updateRevisionAction({
      id: revId,
      fileUrl: fakeUrl
    });
    if (res.success) {
      onRevisionUpdated(res.data, deliverable.id);
    }
  };

  // Sort asc by creation date
  const revisions = [...(deliverable.revisions || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
        title="Manage Revisions"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 shadow-xl rounded-lg z-10 p-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Revisions</h4>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
            {revisions.map(rev => (
              <div key={rev.id} className="flex flex-col gap-1 p-2 rounded bg-slate-50 border border-slate-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-800">Rev {rev.revision_number}</span>
                  {rev.status === 'DRAFT' ? (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded uppercase border border-amber-200">Draft</span>
                  ) : (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded uppercase border border-emerald-200">Issued</span>
                  )}
                </div>
                
                {rev.status === 'DRAFT' && (
                  <div className="mt-1 flex justify-between items-center border-t border-slate-200 pt-1">
                    <span className="text-slate-500 truncate mr-2">{rev.file_url ? 'File Attached' : 'No File'}</span>
                    {!rev.file_url && (
                      <button onClick={() => handleAttachFile(rev.id)} className="text-indigo-600 hover:underline font-semibold">Attach PDF</button>
                    )}
                  </div>
                )}
                {rev.status === 'ISSUED' && (
                  <div className="mt-1 text-slate-400 italic">Locked (Immutable)</div>
                )}
              </div>
            ))}
            {revisions.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-2">No revisions created.</p>
            )}
          </div>

          {!isAdding ? (
            <button onClick={() => setIsAdding(true)} className="w-full text-center text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded py-1.5 transition-colors">
              + New Revision
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Rev (e.g. A)" 
                value={newRevNum}
                onChange={e => setNewRevNum(e.target.value)}
                className="flex-1 rounded border-slate-300 px-2 py-1 text-xs" 
                autoFocus
              />
              <button onClick={handleAdd} className="bg-indigo-600 text-white rounded px-2 py-1 text-xs font-semibold">Add</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
