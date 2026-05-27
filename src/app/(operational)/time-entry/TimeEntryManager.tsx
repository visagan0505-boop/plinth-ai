'use client';

import { useState } from 'react';
import { TimeEntryForm } from './TimeEntryForm';
import { TimeEntryRow } from './TimeEntryRow';

export function TimeEntryManager({ initialEntries, jobs }: { initialEntries: any[]; jobs: any[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [isAdding, setIsAdding] = useState(false);

  // Group entries by date (descending)
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = entry.operational_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const handleEntrySaved = (newEntry: any) => {
    // In a real app, we might re-fetch or optimistically update. 
    // Here we'll just force a refresh or carefully append.
    setEntries(prev => [newEntry, ...prev].sort((a, b) => new Date(b.operational_date).getTime() - new Date(a.operational_date).getTime()));
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Recent Effort</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Log Effort
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-800">New Telemetry Record</h3>
            <button onClick={() => setIsAdding(false)} className="text-sm font-medium text-slate-500 hover:text-slate-700">Cancel</button>
          </div>
          <TimeEntryForm jobs={jobs} onSave={handleEntrySaved} />
        </div>
      )}

      {/* Grouped Entries List */}
      <div className="space-y-8">
        {sortedDates.map(date => {
          const dayEntries = groupedEntries[date];
          const totalHours = dayEntries.reduce((sum: number, e: any) => sum + Number(e.hours), 0);
          
          return (
            <div key={date} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="font-bold text-slate-900">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
                <span className="font-mono text-sm font-bold text-slate-600">{totalHours.toFixed(2)}h total</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden divide-y divide-slate-100">
                {dayEntries.map(entry => (
                  <TimeEntryRow key={entry.id} entry={entry} jobs={jobs} onUpdate={(updated) => {
                    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
                  }} />
                ))}
              </div>
            </div>
          );
        })}

        {entries.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500 font-medium">No telemetry recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
