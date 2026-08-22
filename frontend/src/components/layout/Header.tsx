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
    <header className="bg-surface-dim dark:bg-surface-dim w-full h-16 border-b border-outline-variant flex items-center justify-between px-margin-desktop sticky top-0 z-30 shrink-0">
      {/* Left: Brand & Search */}
      <div className="flex items-center flex-1">
        <div className="flex items-center mr-6">
          <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
            Dark Web Deanonymizer
          </span>
        </div>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center bg-surface-container-high rounded px-3 py-1.5 border border-outline-variant/40 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/60 transition-all w-96"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-2">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search actors, handles, wallets, PGP..."
            className="bg-transparent border-none outline-none text-body-sm font-body-sm text-on-surface placeholder:text-on-surface-variant w-full focus:ring-0 p-0"
          />
          <div className="flex items-center gap-1 ml-2 border-l border-outline-variant/30 pl-2">
            <span className="px-1.5 py-0.5 bg-surface-variant rounded text-[10px] font-label-caps text-on-surface-variant">
              ENTER
            </span>
          </div>
        </form>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center space-x-1 text-on-surface-variant">
          <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-label-caps text-[10px] mr-2 hidden sm:inline-block">
            TLP:AMBER+STRICT
          </span>

          <Link
            href="/timeline"
            className="p-2 rounded hover:text-primary transition-colors flex items-center justify-center hover:bg-surface-variant"
            title="Recent Activity"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
          </Link>
          <Link
            href="/graph"
            className="p-2 rounded hover:text-primary transition-colors flex items-center justify-center hover:bg-surface-variant"
            title="Relationship Graph"
          >
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </Link>
        </div>

        <div className="w-px h-6 bg-outline-variant mx-1 hidden sm:block"></div>

        <Link
          href="/investigation"
          className="btn-primary h-9 px-3.5 rounded font-label-caps text-label-caps flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>New Investigation</span>
        </Link>
      </div>
    </header>
  );
}
