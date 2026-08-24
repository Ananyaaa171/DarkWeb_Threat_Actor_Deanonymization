'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ username?: string; role?: string; unit?: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dwd_auth_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Threat Explorer', href: '/investigation', icon: 'travel_explore' },
    { label: 'Actor Dossiers', href: '/actors/2bee3f4c-1923-40da-a2e9-78b9a1e9eb79', icon: 'groups', matchPrefix: '/actors' },
    { label: 'Topological Graph', href: '/graph', icon: 'hub', matchPrefix: '/graph' },
    { label: 'Activity Timeline', href: '/timeline', icon: 'timeline', matchPrefix: '/timeline' },
    { label: 'Connection Analysis', href: '/linkage', icon: 'psychology', matchPrefix: '/linkage' },
    { label: 'Supporting Evidence', href: '/evidence', icon: 'fact_check', matchPrefix: '/evidence' },
    { label: 'Writing Style Analysis', href: '/stylometry', icon: 'edit_note', matchPrefix: '/stylometry' },
    { label: 'Export Dossier', href: '/export', icon: 'file_download', matchPrefix: '/export' },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.matchPrefix) {
      return pathname.startsWith(item.matchPrefix);
    }
    return pathname === item.href;
  };

  const displayName = currentUser?.username ? currentUser.username.split('@')[0].toUpperCase() : 'ANALYST OP-74';
  const displayUnit = currentUser?.unit || currentUser?.role || 'CTI Division';

  return (
    <nav
      aria-label="Sidebar Navigation"
      className="bg-surface-container-low dark:bg-surface-container-low h-screen w-[240px] flex-shrink-0 border-r border-outline-variant flex flex-col hidden md:flex z-40 select-none"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-outline-variant/50 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mr-3 text-primary">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            security
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-title-sm text-title-sm font-bold text-on-surface tracking-tight">
            Dark Web Intel
          </span>
          <span className="font-label-caps text-[10px] text-primary font-semibold tracking-wider">
            SIH DEANONYMIZER
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-label-caps text-outline tracking-wider font-semibold">
          INTELLIGENCE MODULES
        </div>
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded text-body-sm font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] group ${
                active
                  ? 'bg-primary/15 text-primary border-l-2 border-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined mr-3 text-[19px] transition-colors ${
                  active ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'
                }`}
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[13px]">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Navigation & Analyst Status */}
      <div className="p-3 border-t border-outline-variant/50 shrink-0 space-y-2">
        <div className="px-3 py-2.5 flex items-center rounded-lg bg-surface-container-high/60 border border-outline-variant/40">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mr-2.5 text-primary shrink-0">
            <span className="material-symbols-outlined text-[17px]">verified_user</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-caps text-[11px] text-on-surface font-bold truncate">
              {displayName}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span className="truncate">{displayUnit}</span>
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-on-surface-variant hover:text-rose-400 transition-colors rounded hover:bg-rose-500/10"
        >
          <span className="material-symbols-outlined text-[16px]">lock</span>
          <span className="font-label-caps text-[11px]">Lock Session</span>
        </Link>
      </div>
    </nav>
  );
}
