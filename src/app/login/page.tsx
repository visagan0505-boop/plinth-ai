'use client';

import React, { useState, useTransition } from 'react';
import { loginAction } from '@/app/actions/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email) return;

    startTransition(async () => {
      const res = await loginAction(email);
      if (res.success) {
        setMessage({ type: 'success', text: res.message });
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">PLINTH</span>
            <span className="text-slate-400"> AI</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">
            AI-native Operational Intelligence for Structural Engineering
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {message && (
            <div
              className={`rounded-lg border p-4 text-sm font-semibold ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Corporate Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@engineering.co.nz"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-3 px-4 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
            />
          </div>

          <div>
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
              {isPending ? 'Sending...' : 'Request Passwordless Access'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-600 pt-4 border-t border-slate-800/50">
          Secure Tenant Authentication powered by Supabase Auth
        </div>
      </div>
    </div>
  );
}
