'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createJobAction, updateJobAction } from '@/app/actions/job';
import { CreateJobDTO, UpdateJobDTO } from '@/lib/dtos/job';

interface JobFormProps {
  initialData?: any;
  lookups: {
    clients: { id: string; name: string }[];
    statuses: { id: string; name: string }[];
    jobTypes: { id: string; name: string }[];
    riskTiers: { id: string; name: string }[];
    staff: { id: string; full_name: string }[];
    offices: { id: string; name: string }[];
  };
}

export default function JobForm({ initialData, lookups }: JobFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [clientId, setClientId] = useState(initialData?.client_id || '');
  const [jobTypeId, setJobTypeId] = useState(initialData?.job_type_id || '');
  const [statusId, setStatusId] = useState(initialData?.status_id || '');
  const [riskTierId, setRiskTierId] = useState(initialData?.risk_tier_id || '');
  const [projectDirectorId, setProjectDirectorId] = useState(initialData?.project_director_id || '');
  const [designManagerId, setDesignManagerId] = useState(initialData?.design_manager_id || '');
  const [primaryOfficeId, setPrimaryOfficeId] = useState(initialData?.primary_office_id || '');
  
  // NZ Land Details
  const [lotNumber, setLotNumber] = useState(initialData?.lot_number || '');
  const [dpNumber, setDpNumber] = useState(initialData?.dp_number || '');
  const [openedDate, setOpenedDate] = useState(initialData?.opened_date || new Date().toISOString().split('T')[0]);
  const [targetCompletionDate, setTargetCompletionDate] = useState(initialData?.target_completion_date || '');
  const [description, setDescription] = useState(initialData?.description || '');

  // Address
  const initialAddress = initialData?.site_address || {};
  const [street, setStreet] = useState(initialAddress.street || '');
  const [suburb, setSuburb] = useState(initialAddress.suburb || '');
  const [city, setCity] = useState(initialAddress.city || '');
  const [region, setRegion] = useState(initialAddress.region || '');
  const [postcode, setPostcode] = useState(initialAddress.postcode || '');
  const [country, setCountry] = useState(initialAddress.country || 'NZ');

  // Financials
  const [feeValue, setFeeValue] = useState<number>(initialData?.fee_value || 0);
  const [projectRiskValue, setProjectRiskValue] = useState<number>(initialData?.project_risk_value || 0);

  // Dynamic Risk Warning Calculation
  const isRiskExceeded = feeValue > projectRiskValue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const siteAddress = street || city
      ? { street, suburb, city, region, postcode, country }
      : null;

    const payload: any = {
      name,
      clientId,
      jobTypeId,
      statusId,
      riskTierId,
      projectDirectorId,
      designManagerId: designManagerId || null,
      primaryOfficeId,
      siteAddress,
      lotNumber: lotNumber || null,
      dpNumber: dpNumber || null,
      feeValue: Number(feeValue),
      projectRiskValue: Number(projectRiskValue),
      openedDate,
      targetCompletionDate: targetCompletionDate || null,
      description: description || null,
    };

    if (initialData?.id) {
      payload.id = initialData.id;
    }

    startTransition(async () => {
      let res;
      if (initialData?.id) {
        res = await updateJobAction(payload as UpdateJobDTO);
      } else {
        res = await createJobAction(payload as CreateJobDTO);
      }

      if (res.success) {
        router.push(initialData?.id ? `/jobs/${initialData.id}` : '/jobs');
        router.refresh();
      } else {
        if (res.error === 'ValidationFailed') {
          const firstErr = res.details.issues[0];
          setErrorMsg(`${firstErr.path.join('.')}: ${firstErr.message}`);
        } else {
          setErrorMsg(res.message);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          Error: {errorMsg}
        </div>
      )}

      {/* Exceeded Risk Alert */}
      {isRiskExceeded && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4.5 flex gap-3 text-sm">
          <svg className="h-5.5 w-5.5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-bold text-amber-950">Governance Check: Fee Exceeds Risk</span>
            <p className="text-amber-800 mt-0.5">
              The entered fee value exceeds the project's risk value. A risk governance peer-review check or director sign-off may be triggered on submission.
            </p>
          </div>
        </div>
      )}

      {/* Grid 1: Basic Information */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Basic Engagement Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Job Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kirk Roberts Auckland HQ Redevelopment"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Client Organisation *</label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="">Select a Client</option>
              {lookups.clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Job Type *</label>
            <select
              required
              value={jobTypeId}
              onChange={(e) => setJobTypeId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="">Select Job Type</option>
              {lookups.jobTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Initial Status *</label>
            <select
              required
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="">Select Status</option>
              {lookups.statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Risk Governance Tier *</label>
            <select
              required
              value={riskTierId}
              onChange={(e) => setRiskTierId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="">Select Risk Tier</option>
              {lookups.riskTiers.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid 2: Resource Allocations */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Key Resource Allocations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Project Director *</label>
            <select
              required
              value={projectDirectorId}
              onChange={(e) => setProjectDirectorId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="">Select PD</option>
              {lookups.staff.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Design Manager (Optional)</label>
            <select
              value={designManagerId}
              onChange={(e) => setDesignManagerId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="">None</option>
              {lookups.staff.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Primary Office Location *</label>
            <select
              required
              value={primaryOfficeId}
              onChange={(e) => setPrimaryOfficeId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="">Select Office</option>
              {lookups.offices.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid 3: Financial Projections */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Financial Projections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Contract Fee Value ($) *</label>
            <input
              type="number"
              min="0"
              required
              value={feeValue}
              onChange={(e) => setFeeValue(Number(e.target.value))}
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Allocated Project Risk Limit ($) *</label>
            <input
              type="number"
              min="0"
              required
              value={projectRiskValue}
              onChange={(e) => setProjectRiskValue(Number(e.target.value))}
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Grid 4: NZ Land Registry & Site Address */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Site Registry & NZ Land Identifiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Lot Number (Optional)</label>
            <input
              type="text"
              value={lotNumber}
              onChange={(e) => setLotNumber(e.target.value)}
              placeholder="e.g. Lot 12"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">DP Number (Deposited Plan - Optional)</label>
            <input
              type="text"
              value={dpNumber}
              onChange={(e) => setDpNumber(e.target.value)}
              placeholder="e.g. DP 456789"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Site Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street Address"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  placeholder="Suburb"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Region"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="Postcode"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 5: Timeline & Description */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Timeline & Scope Outline</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Opened Date *</label>
            <input
              type="date"
              required
              value={openedDate}
              onChange={(e) => setOpenedDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target Completion Date</label>
            <input
              type="date"
              value={targetCompletionDate}
              onChange={(e) => setTargetCompletionDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description / Scope Details</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the detailed engineering scope of work..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          type="button"
          disabled={isPending}
          onClick={() => router.back()}
          className="rounded-lg border border-slate-200 bg-white py-2.5 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-indigo-600 py-2.5 px-6 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isPending && (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {initialData?.id ? 'Save Changes' : 'Create Job'}
        </button>
      </div>
    </form>
  );
}
