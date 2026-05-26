import { getOperationalContext } from '@/lib/auth/session';
import { ReactNode } from 'react';

export default async function OperationalLayout({ children }: { children: ReactNode }) {
  // Enforces authentication and extracts tenant_id before ANY child renders
  const context = await getOperationalContext();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold">Plinth AI - Operational Dashboard</h1>
        <p className="text-sm text-gray-500">Tenant: {context.tenantId}</p>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
