'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main className="min-h-screen bg-surface">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface font-body-md text-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Persistent Stitch Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative z-10 overflow-hidden">
        {/* Stitch TopAppBar */}
        <Header />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-margin-desktop custom-scroll">
          <div className="max-w-container-max-width mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
