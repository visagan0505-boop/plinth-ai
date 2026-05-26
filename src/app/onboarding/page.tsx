'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitTenantOnboarding } from '@/app/actions/onboarding';

export default function OnboardingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tenant / Office / Discipline States
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [officeName, setOfficeName] = useState('Auckland HQ');
  const [disciplineName, setDisciplineName] = useState('Structural Engineering');

  // Staff States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [hourlyCostRate, setHourlyCostRate] = useState(65);
  const [hourlyBillRate, setHourlyBillRate] = useState(180);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await submitTenantOnboarding({
        tenantName,
        tenantSlug,
        officeName,
        disciplineName,
        fullName,
        email,
        role: 'director',
        hourlyCostRate: Number(hourlyCostRate),
        hourlyBillRate: Number(hourlyBillRate),
      });

      if (res.success) {
        router.push('/');
        router.refresh();
      } else {
        if (res.error === 'ValidationFailed') {
          const firstErr = res.details.issues[0];
          setErrorMsg(`${firstErr.path.join('.')}: ${firstErr.message}`);
        } else if (res.error === 'SlugUnavailable') {
          setErrorMsg('The requested tenant slug is already taken.');
        } else {
          setErrorMsg((res as any).message || 'An unexpected database error occurred.');
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Bootstrap <span className="bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">New Tenant</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">
            Deploy a sandboxed operational workspace for your consultancy.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {errorMsg && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-400">
              Error: {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Org Info */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Consultancy Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Practice Name *</label>
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => {
                      setTenantName(e.target.value);
                      // auto-slugify
                      setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }}
                    placeholder="e.g. Kirk Roberts Consulting"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white placeholder-slate-700 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Workspace URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value.toLowerCase())}
                    placeholder="kirk-roberts"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white placeholder-slate-700 outline-none focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Offices & Disciplines */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Primary Location</h3>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Office Name *</label>
                <input
                  type="text"
                  required
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white placeholder-slate-700 outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Core Engineering Area</h3>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Discipline Name *</label>
                <input
                  type="text"
                  required
                  value={disciplineName}
                  onChange={(e) => setDisciplineName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white placeholder-slate-700 outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Admin Director Profile */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Your Director/Staff Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white placeholder-slate-700 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Corporate Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@consulting.co.nz"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white placeholder-slate-700 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Financial Parameters */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Financial rate configuration (NZD)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Your Hourly Cost Rate ($) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={hourlyCostRate}
                    onChange={(e) => setHourlyCostRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Your Hourly Bill Rate ($) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={hourlyBillRate}
                    onChange={(e) => setHourlyBillRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/50">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center gap-2 rounded-lg bg-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all disabled:opacity-50"
            >
              {isPending && (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isPending ? 'Provisioning Workspace...' : 'Initialize Secure Sandbox'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
