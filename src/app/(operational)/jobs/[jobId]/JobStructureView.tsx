'use client';

import { useState } from 'react';
import { createPhaseAction } from '@/app/actions/phase';
import { createScopeAction } from '@/app/actions/scope';
import { createComponentAction } from '@/app/actions/component';

// Interfaces for the nested data structure
export interface ComponentData {
  id: string;
  name: string;
  estimated_hours: number;
  is_billable: boolean;
  sort_order: number;
}

export interface ScopeData {
  id: string;
  phase_id: string;
  name: string;
  is_included: boolean;
  sort_order: number;
  job_components: ComponentData[];
}

export interface PhaseData {
  id: string;
  job_id: string;
  name: string;
  status: string;
  fee_amount: number;
  estimated_hours: number;
  sort_order: number;
  job_scopes: ScopeData[];
}

export function JobStructureView({ jobId, phases }: { jobId: string; phases: PhaseData[] }) {
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('');

  const handleAddPhase = async () => {
    if (!newPhaseName.trim()) return;
    await createPhaseAction({
      jobId,
      name: newPhaseName,
      sortOrder: phases.length,
      status: 'not_started',
      estimatedHours: 0,
      feeAmount: 0
    });
    setNewPhaseName('');
    setIsAddingPhase(false);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Operational Breakdown</h3>
        <button
          onClick={() => setIsAddingPhase(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Phase
        </button>
      </div>

      {isAddingPhase && (
        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <input
            type="text"
            value={newPhaseName}
            onChange={(e) => setNewPhaseName(e.target.value)}
            placeholder="Phase Name (e.g. Detailed Design)"
            className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-1.5 border"
            autoFocus
          />
          <button onClick={handleAddPhase} className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">Save</button>
          <button onClick={() => setIsAddingPhase(false)} className="rounded bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50">Cancel</button>
        </div>
      )}

      <div className="space-y-4">
        {phases.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} />
        ))}
        {phases.length === 0 && !isAddingPhase && (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
            <p className="text-sm text-slate-500">No phases defined yet. Start breaking down this job.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PhaseCard({ phase }: { phase: PhaseData }) {
  const [isAddingScope, setIsAddingScope] = useState(false);
  const [newScopeName, setNewScopeName] = useState('');

  const handleAddScope = async () => {
    if (!newScopeName.trim()) return;
    await createScopeAction({
      phaseId: phase.id,
      name: newScopeName,
      sortOrder: phase.job_scopes?.length || 0,
      isIncluded: true
    });
    setNewScopeName('');
    setIsAddingScope(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* Phase Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 text-indigo-700 font-bold text-xs px-2 py-1 rounded uppercase tracking-wider">
            Phase
          </div>
          <h4 className="font-bold text-slate-900">{phase.name}</h4>
          <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
            {phase.status.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Est. Hours</span>
            <span className="font-mono font-semibold text-slate-700">{phase.estimated_hours}</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fee Amount</span>
            <span className="font-mono font-bold text-slate-900">${phase.fee_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      {/* Scopes List */}
      <div className="p-4 space-y-4">
        {(phase.job_scopes || []).map(scope => (
          <ScopeCard key={scope.id} scope={scope} />
        ))}
        
        {isAddingScope ? (
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-200 ml-4">
            <input
              type="text"
              value={newScopeName}
              onChange={(e) => setNewScopeName(e.target.value)}
              placeholder="Scope Name (e.g. Foundation Design)"
              className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-2.5 py-1.5 border"
              autoFocus
            />
            <button onClick={handleAddScope} className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">Save</button>
            <button onClick={() => setIsAddingScope(false)} className="rounded bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingScope(true)}
            className="ml-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Scope
          </button>
        )}
      </div>
    </div>
  );
}

function ScopeCard({ scope }: { scope: ScopeData }) {
  const [isAddingComp, setIsAddingComp] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompHours, setNewCompHours] = useState('0');

  const handleAddComp = async () => {
    if (!newCompName.trim()) return;
    await createComponentAction({
      scopeId: scope.id,
      name: newCompName,
      estimatedHours: parseFloat(newCompHours) || 0,
      sortOrder: scope.job_components?.length || 0,
      isBillable: true
    });
    setNewCompName('');
    setNewCompHours('0');
    setIsAddingComp(false);
  };

  return (
    <div className="ml-4 border-l-2 border-slate-200 pl-4 space-y-2 relative">
      {/* Scope Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 text-slate-600 font-bold text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">
            Scope
          </div>
          <h5 className="font-semibold text-sm text-slate-800">{scope.name}</h5>
          {!scope.is_included && (
             <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 uppercase">Excluded</span>
          )}
        </div>
      </div>

      {/* Components List */}
      <div className="space-y-1.5 mt-2">
        {(scope.job_components || []).map(comp => (
          <ComponentItem key={comp.id} component={comp} />
        ))}

        {isAddingComp ? (
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200 ml-4 mt-2">
            <input
              type="text"
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
              placeholder="Component (e.g. Gravity Modeling)"
              className="flex-1 rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs px-2 py-1 border"
              autoFocus
            />
            <input
              type="number"
              value={newCompHours}
              onChange={(e) => setNewCompHours(e.target.value)}
              placeholder="Hrs"
              className="w-16 rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs px-2 py-1 border"
              min="0"
              step="0.5"
            />
            <button onClick={handleAddComp} className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-500">Save</button>
            <button onClick={() => setIsAddingComp(false)} className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingComp(true)}
            className="ml-4 text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mt-1"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Component
          </button>
        )}
      </div>
    </div>
  );
}

function ComponentItem({ component }: { component: ComponentData }) {
  return (
    <div className="ml-4 flex items-center justify-between bg-white border border-slate-100 rounded px-3 py-2 shadow-sm group hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
        <span className="text-sm font-medium text-slate-700">{component.name}</span>
        {!component.is_billable && (
          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1 py-0.5 rounded uppercase">Overhead</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
          {component.estimated_hours}h
        </span>
      </div>
    </div>
  );
}
