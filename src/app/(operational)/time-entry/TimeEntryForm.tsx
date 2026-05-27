'use client';

import { useState } from 'react';
import { createTimeEntryAction, updateTimeEntryAction } from '@/app/actions/time-entry';

export function TimeEntryForm({ jobs, onSave, existingEntry, onCancel }: { jobs: any[]; onSave: (entry: any) => void; existingEntry?: any; onCancel?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [date, setDate] = useState(existingEntry?.operational_date || new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState(existingEntry?.hours?.toString() || '');
  const [jobId, setJobId] = useState(existingEntry?.job_id || '');
  const [phaseId, setPhaseId] = useState(existingEntry?.job_phase_id || '');
  const [scopeId, setScopeId] = useState(existingEntry?.scope_id || '');
  const [componentId, setComponentId] = useState(existingEntry?.component_id || '');
  const [isBillable, setIsBillable] = useState(existingEntry?.is_billable ?? true);
  const [notes, setNotes] = useState(existingEntry?.notes || '');

  // Dependent Selections
  const selectedJob = jobs.find(j => j.id === jobId);
  const phases = selectedJob?.job_phases || [];
  const selectedPhase = phases.find((p: any) => p.id === phaseId);
  const scopes = selectedPhase?.job_scopes || [];
  const selectedScope = scopes.find((s: any) => s.id === scopeId);
  const components = selectedScope?.job_components || [];

  const handleJobChange = (e: any) => {
    setJobId(e.target.value);
    setPhaseId('');
    setScopeId('');
    setComponentId('');
  };

  const handlePhaseChange = (e: any) => {
    setPhaseId(e.target.value);
    setScopeId('');
    setComponentId('');
  };

  const handleScopeChange = (e: any) => {
    setScopeId(e.target.value);
    setComponentId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!jobId || !phaseId || !scopeId || !date || !hours || Number(hours) <= 0) {
        throw new Error('Please fill all required operational fields correctly.');
      }

      const payload = {
        staffId: '00000000-0000-0000-0000-000000000000', // Server action relies on session context, DTO expects string, will be overridden. 
        jobId,
        phaseId,
        scopeId,
        componentId: componentId || null,
        entryDate: date,
        hours: parseFloat(hours),
        isBillable,
        notes
      };

      let res;
      if (existingEntry) {
        res = await updateTimeEntryAction({ id: existingEntry.id, ...payload });
      } else {
        res = await createTimeEntryAction(payload as any);
      }

      if (res.success) {
        onSave(res.data);
      } else {
        throw new Error((res as any).message || (res as any).error || 'Validation Failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Primary Context Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Job</label>
          <select
            required
            value={jobId}
            onChange={handleJobChange}
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-semibold"
          >
            <option value="">Select Job...</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.job_number} - {job.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Hours</label>
          <input
            type="number"
            required
            min="0.1"
            step="0.1"
            max="24"
            value={hours}
            onChange={e => setHours(e.target.value)}
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono font-bold text-sm"
            placeholder="0.0"
          />
        </div>
      </div>

      {/* Structural Hierarchy Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-l-2 border-indigo-100 pl-3">
        <div>
          <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Phase</label>
          <select
            required
            disabled={!jobId || phases.length === 0}
            value={phaseId}
            onChange={handlePhaseChange}
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">Select Phase...</option>
            {phases.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Scope</label>
          <select
            required
            disabled={!phaseId || scopes.length === 0}
            value={scopeId}
            onChange={handleScopeChange}
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">Select Scope...</option>
            {scopes.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Component (Optional)</label>
          <select
            disabled={!scopeId || components.length === 0}
            value={componentId}
            onChange={e => setComponentId(e.target.value)}
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">Select Component...</option>
            {components.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Details Row */}
      <div className="flex items-start gap-4 pt-2">
        <div className="flex-1">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Operational notes (optional)"
            rows={2}
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="flex flex-col items-end gap-3 min-w-[140px]">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={isBillable}
              onChange={e => setIsBillable(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Billable</span>
          </label>
          
          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (existingEntry ? 'Update' : 'Log Hours')}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
