import { getOperationalContext } from '@/lib/auth/session';
import { ReactNode } from 'react';
import Link from 'next/link';

export default async function OperationalLayout({ children }: { children: ReactNode }) {
  // Enforces authentication and extracts tenant_id before ANY child renders
  const context = await getOperationalContext();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-slate-200 bg-slate-900 text-slate-400 shadow-xl">
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">PLINTH</span>
            <span className="text-xs uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 font-semibold tracking-widest">AI</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">Core Platform</div>
          
          <Link
            href="/"
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-slate-800 hover:text-white group"
          >
            <svg className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/jobs"
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-slate-800 hover:text-white group"
          >
            <svg className="h-5 w-5 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Jobs</span>
          </Link>

          <Link
            href="/staff"
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-slate-800 hover:text-white group"
          >
            <svg className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Staff</span>
          </Link>

          <Link
            href="/clients"
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-slate-800 hover:text-white group"
          >
            <svg className="h-5 w-5 text-slate-400 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Clients</span>
          </Link>

          <Link
            href="/time-entry"
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-slate-800 hover:text-white group"
          >
            <svg className="h-5 w-5 text-slate-400 group-hover:text-rose-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Time Entry</span>
          </Link>
        </nav>

        {/* Sidebar Footer / Tenancy Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
              {context.email ? context.email.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Tenant</p>
              <p className="text-xs text-slate-400 truncate font-mono">{context.tenantId}</p>
              <p className="text-sm font-medium text-slate-300 truncate mt-0.5">{context.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-72">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">Operational Intelligence Platform</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Live Sync Active
            </span>
          </div>
        </header>

        {/* Inner Content */}
        <main className="min-h-[calc(100vh-4rem)] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
