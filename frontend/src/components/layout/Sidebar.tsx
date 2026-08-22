'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Investigation', href: '/investigation', icon: 'search' },
    { label: 'Actors', href: '/actors/2bee3f4c-1923-40da-a2e9-78b9a1e9eb79', icon: 'group', matchPrefix: '/actors' },
    { label: 'Graph', href: '/graph', icon: 'hub', matchPrefix: '/graph' },
    { label: 'Timeline', href: '/timeline', icon: 'timeline', matchPrefix: '/timeline' },
    { label: 'AI Analysis', href: '/linkage', icon: 'psychology', matchPrefix: '/linkage' },
    { label: 'Export Dossier', href: '/export', icon: 'file_download', matchPrefix: '/export' },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.matchPrefix) {
      return pathname.startsWith(item.matchPrefix);
    }
    return pathname === item.href;
  };

  return (
    <nav
      aria-label="Sidebar Navigation"
      className="bg-surface-container-low dark:bg-surface-container-low h-screen w-[240px] flex-shrink-0 border-r border-outline-variant flex flex-col hidden md:flex z-40"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-outline-variant/50 shrink-0">
        <span
          className="material-symbols-outlined text-primary mr-3 text-[22px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          security
        </span>
        <div className="flex flex-col">
          <span className="font-title-sm text-title-sm font-bold text-primary tracking-tight">
            DWD Platform
          </span>
          <span className="font-label-caps text-[10px] text-on-surface-variant">
            Intel Division
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-DEFAULT text-body-md font-body-md transition-colors duration-150 cursor-pointer active:opacity-80 group ${
                active
                  ? 'bg-secondary-container text-on-secondary-container border-l-2 border-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined mr-3 text-[20px] ${
                  active ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'
                }`}
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Navigation & Analyst Status */}
      <div className="p-3 border-t border-outline-variant/50 shrink-0 space-y-2">
        <div className="px-3 py-2 flex items-center rounded bg-surface-container-high/60 border border-outline-variant/30">
          <div className="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center mr-3 text-primary">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-caps text-[11px] text-on-surface font-bold">ANALYST OP-74</span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span>CTI Active</span>
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-on-surface-variant hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span className="font-label-caps">Lock Session</span>
        </Link>
      </div>
    </nav>
  );
}
