'use client';

import { useState } from 'react';
import { TimeEntryForm } from './TimeEntryForm';

export function TimeEntryRow({ entry, jobs, onUpdate }: { entry: any; jobs: any[]; onUpdate: (e: any) => void }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="p-4 bg-indigo-50/50 border-l-4 border-l-indigo-500">
        <TimeEntryForm 
          jobs={jobs} 
          existingEntry={entry} 
          onSave={(updated) => {
            onUpdate(updated);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  // Resolve Names for Display
  const job = jobs.find(j => j.id === entry.job_id);
  const phase = job?.job_phases?.find((p: any) => p.id === entry.job_phase_id);
  const scope = phase?.job_scopes?.find((s: any) => s.id === entry.scope_id);
  const component = scope?.job_components?.find((c: any) => c.id === entry.component_id);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {job?.job_number || 'UNKNOWN'}
          </span>
          <span className="text-sm font-bold text-slate-900 truncate">
            {job?.name || 'Unknown Job'}
          </span>
          {!entry.is_billable && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded uppercase border border-amber-200">Non-Billable</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
          <span>{phase?.name || 'Unknown Phase'}</span>
          <svg className="h-3 w-3 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span>{scope?.name || 'Unknown Scope'}</span>
          {component && (
            <>
              <svg className="h-3 w-3 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span>{component.name}</span>
            </>
          )}
        </div>

        {entry.notes && (
          <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100 inline-block max-w-full truncate">
            {entry.notes}
          </p>
        )}
      </div>

      <div className="mt-4 sm:mt-0 sm:ml-6 flex items-center justify-between sm:justify-end gap-6 shrink-0">
        <div className="text-right">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</span>
          <span className="font-mono text-xl font-bold text-slate-900">{Number(entry.hours).toFixed(2)}h</span>
        </div>
        
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Edit Time Entry"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
