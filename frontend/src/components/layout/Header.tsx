'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function Header() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/investigation?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="bg-surface-dim/95 backdrop-blur w-full h-16 border-b border-outline-variant/60 flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
      {/* Left: Search & Platform Title */}
      <div className="flex items-center flex-1 max-w-2xl">
        <div className="flex items-center mr-6 hidden xl:flex">
          <span className="font-headline-sm text-[15px] font-bold text-on-surface tracking-tight">
            Threat Intelligence Platform
          </span>
        </div>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center bg-surface-container-high/90 rounded-lg px-3.5 py-2 border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all w-full max-w-md"
        >
          <span className="material-symbols-outlined text-outline text-[18px] mr-2.5">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search threat actors, darknet handles, crypto wallets, PGP..."
            className="bg-transparent border-none outline-none text-body-sm text-on-surface placeholder:text-outline/70 w-full p-0 font-sans"
          />
          <div className="flex items-center ml-2 pl-2 border-l border-outline-variant/40">
            <span className="px-1.5 py-0.5 bg-surface-variant rounded text-[10px] font-mono text-outline font-medium">
              ↵
            </span>
          </div>
        </form>
      </div>

      {/* Right: Security Classification & Quick Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold tracking-wider hidden sm:inline-block cursor-help"
            title="Classification: Restricted to Authorized CTI Cyber Analysts"
          >
            TLP:AMBER+STRICT
          </span>

          <Link
            href="/timeline"
            className="p-2 rounded-lg hover:text-primary transition-colors flex items-center justify-center hover:bg-surface-variant text-on-surface-variant"
            title="Activity Timeline"
          >
            <span className="material-symbols-outlined text-[20px]">timeline</span>
          </Link>
          <Link
            href="/graph"
            className="p-2 rounded-lg hover:text-primary transition-colors flex items-center justify-center hover:bg-surface-variant text-on-surface-variant"
            title="Topological Graph"
          >
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </Link>
        </div>

        <div className="w-px h-6 bg-outline-variant/60 mx-1 hidden sm:block"></div>

        <Link
          href="/investigation"
          className="btn-primary h-9 px-4 rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-sm hover:shadow"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          <span>New Investigation</span>
        </Link>
      </div>
    </header>
  );
}
