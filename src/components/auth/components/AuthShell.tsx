import { ReactNode } from 'react';

// Same centred-card layout as the login/register page.
export default function AuthShell({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-4 rounded-lg bg-white shadow">
        {title && <h2 className="text-2xl font-bold text-center">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
