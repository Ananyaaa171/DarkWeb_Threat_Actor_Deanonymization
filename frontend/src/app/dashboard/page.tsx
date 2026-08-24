'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { ActorSummary, DashboardStats, TimelineEvent } from '@/types';
import { formatIsoDate } from '@/utils/formatters';

const FALLBACK_ACTORS: ActorSummary[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    canonicalName: 'LockBit Syndicate Core',
    threatCategory: 'RANSOMWARE',
    primaryMotive: 'FINANCIAL',
    status: 'ACTIVE',
    overallConfidenceScore: 92.5,
    personaCount: 3,
    associatedHandles: ['bassterlord_xss', 'basster_rampv2', 'basster_support_tg'],
    lastObservedAt: '2026-08-22T12:00:00Z',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    canonicalName: 'ShinyHunters Data Collective',
    threatCategory: 'DATA_BROKER',
    primaryMotive: 'FINANCIAL',
    status: 'ACTIVE',
    overallConfidenceScore: 84.0,
    personaCount: 2,
    associatedHandles: ['pompom_breached', 'shiny_telegram'],
    lastObservedAt: '2026-08-20T08:30:00Z',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    canonicalName: 'ALPHV / BlackCat Group',
    threatCategory: 'RANSOMWARE',
    primaryMotive: 'FINANCIAL',
    status: 'DORMANT',
    overallConfidenceScore: 78.0,
    personaCount: 2,
    associatedHandles: ['alphv_leak', 'blackcat_rep'],
    lastObservedAt: '2026-08-15T16:45:00Z',
  },
];

const FALLBACK_TIMELINE: TimelineEvent[] = [
  {
    id: 'e1',
    personaId: 'b0000000-0000-0000-0000-000000000001',
    personaHandle: 'bassterlord_xss',
    actorCanonicalName: 'LockBit Syndicate Core',
    eventType: 'FORUM_POST',
    title: 'New Ransomware-as-a-Service Rules Posted on XSS.is',
    description: 'Detailed revenue split terms (80/20) and explicit prohibition on targeting CIS critical infrastructure.',
    sourceReference: 'XSS.is Archive #412',
    eventTimestamp: '2026-08-22T14:20:00Z',
    severity: 'MEDIUM',
  },
  {
    id: 'e2',
    personaId: 'b0000000-0000-0000-0000-000000000002',
    personaHandle: 'basster_rampv2',
    actorCanonicalName: 'LockBit Syndicate Core',
    eventType: 'PERSONA_MIGRATION',
    title: 'Account Registration on Ramp Forum with Matching PGP Subkey',
    description: 'New handle established referencing previous affiliate work with identical subkey ID 0x4A72B5C1.',
    sourceReference: 'Ramp User Profile #883',
    eventTimestamp: '2026-08-21T09:15:00Z',
    severity: 'HIGH',
  },
  {
    id: 'e3',
    personaId: 'b0000000-0000-0000-0000-000000000004',
    personaHandle: 'pompom_breached',
    actorCanonicalName: 'ShinyHunters Data Collective',
    eventType: 'BREACH_ANNOUNCED',
    title: 'Telecommunications Database Leaked on Breached Portal',
    description: '14 million records offered for sale with Bitcoin escrow deposit verification.',
    sourceReference: 'Breached Forums Archive',
    eventTimestamp: '2026-08-20T18:00:00Z',
    severity: 'CRITICAL',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [actors, setActors] = useState<ActorSummary[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [quickQuery, setQuickQuery] = useState('');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setIsLoading(true);

        const [statsResult, actorsResult] = await Promise.allSettled([
          api.getDashboardStats(),
          api.getActors({ size: 10 }),
        ]);

        let hasLiveConnection = false;

        if (statsResult.status === 'fulfilled' && statsResult.value) {
          if (isMounted) {
            setDashboardStats(statsResult.value);
            hasLiveConnection = true;
          }
        }

        if (
          actorsResult.status === 'fulfilled' &&
          actorsResult.value &&
          actorsResult.value.content &&
          actorsResult.value.content.length > 0
        ) {
          if (isMounted) {
            setActors(actorsResult.value.content);
            hasLiveConnection = true;

            // Load timeline from first actor
            try {
              const timelineRes = await api.getActorTimeline(actorsResult.value.content[0].id, { size: 5 });
              if (timelineRes && timelineRes.content && timelineRes.content.length > 0) {
                setTimelineEvents(timelineRes.content);
              } else {
                setTimelineEvents(FALLBACK_TIMELINE);
              }
            } catch (_) {
              setTimelineEvents(FALLBACK_TIMELINE);
            }
          }
        } else {
          if (isMounted) {
            setActors(FALLBACK_ACTORS);
            setTimelineEvents(FALLBACK_TIMELINE);
          }
        }

        if (isMounted) {
          setIsBackendConnected(hasLiveConnection);
        }
      } catch (err: any) {
        console.warn('Dashboard load encountered error, utilizing fallback threat records:', err?.message || err);
        if (isMounted) {
          setActors(FALLBACK_ACTORS);
          setTimelineEvents(FALLBACK_TIMELINE);
          setIsBackendConnected(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      router.push(`/investigation?q=${encodeURIComponent(quickQuery.trim())}`);
    }
  };

  // Real API bindings with resilient fallbacks
  const totalActors = dashboardStats?.totalThreatActors ?? (actors.length > 0 ? actors.length : 3);
  const totalPersonas = dashboardStats?.trackedPersonas ?? 7;
  const activeInvestigations = dashboardStats?.activeInvestigations ?? 4;
  const highConfidenceCount = dashboardStats?.highConfidenceLinkages ?? 2;
  const monitoredIdentifiers = dashboardStats?.monitoredIdentifiers ?? 12;
  const activeInfrastructure = dashboardStats?.activeInfrastructure ?? 6;

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Intelligence Status Bar */}
      <div className="card-panel p-5 flex flex-col md:flex-row items-center gap-4 bg-gradient-to-r from-surface-container to-surface-container-high border border-outline-variant/60 rounded-xl shadow-sm">
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div>
              <h2 className="font-mono text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">travel_explore</span>
                <span>Threat Indicator Lookup &amp; Fast Search</span>
              </h2>
              <p className="text-xs text-outline mt-0.5">
                Query monikers, PGP keys, cryptocurrency deposit wallets, or hidden service URLs
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono self-start sm:self-auto">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></span>
              <span className={isBackendConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-medium'}>
                {isBackendConnected ? 'CURRENT INTELLIGENCE' : 'REFERENCE DEMO DATASET'}
              </span>
            </div>
          </div>
          <form onSubmit={handleQuickAnalyze} className="relative flex w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[19px]">
              search
            </span>
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Search moniker (@bassterlord), PGP subkey (0x4A72B5C1), BTC wallet, or onion service..."
              className="w-full bg-surface-container-lowest border border-outline-variant/70 rounded-l-lg pl-10 pr-4 py-2.5 font-mono text-xs text-on-surface placeholder:text-outline/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <button
              type="submit"
              className="bg-primary text-on-primary hover:bg-primary-fixed border-y border-r border-primary/40 rounded-r-lg px-5 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Search</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>
        </div>
      </div>

      {/* Top-Level Cards Grid: 6 Core Monitoring Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Threat Actors */}
        <div className="card-panel p-4 flex flex-col justify-between border-outline-variant/60 rounded-xl bg-surface-container hover:border-primary/40 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Threat Actors
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <span className="material-symbols-outlined text-[16px]">shield</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono">
              {isLoading ? '...' : totalActors}
            </div>
          </div>
          <p className="text-[11px] text-outline mt-2 leading-tight">
            Known threat groups and criminal syndicates
          </p>
        </div>

        {/* Card 2: Online Personas */}
        <div className="card-panel p-4 flex flex-col justify-between border-outline-variant/60 rounded-xl bg-surface-container hover:border-primary/40 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Online Personas
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <span className="material-symbols-outlined text-[16px]">masks</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono">
              {isLoading ? '...' : totalPersonas}
            </div>
          </div>
          <p className="text-[11px] text-outline mt-2 leading-tight">
            Digital identities currently being investigated
          </p>
        </div>

        {/* Card 3: Active Cases */}
        <div className="card-panel p-4 flex flex-col justify-between border-outline-variant/60 rounded-xl bg-surface-container hover:border-primary/40 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Active Cases
              </span>
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono">
              {isLoading ? '...' : activeInvestigations}
            </div>
          </div>
          <p className="text-[11px] text-outline mt-2 leading-tight">
            Ongoing investigation workflows
          </p>
        </div>

        {/* Card 4: Strong Connections */}
        <div className="card-panel p-4 flex flex-col justify-between border-l-4 border-l-emerald-500 border-outline-variant/60 rounded-xl bg-surface-container hover:border-primary/40 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Strong Connections
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-[16px]">link</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono">
              {isLoading ? '...' : highConfidenceCount}
            </div>
          </div>
          <p className="text-[11px] text-outline mt-2 leading-tight">
            Relationships supported by multiple signals
          </p>
        </div>

        {/* Card 5: Identifiers Monitored */}
        <div className="card-panel p-4 flex flex-col justify-between border-outline-variant/60 rounded-xl bg-surface-container hover:border-primary/40 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Identifiers Monitored
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <span className="material-symbols-outlined text-[16px]">key</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono">
              {isLoading ? '...' : monitoredIdentifiers}
            </div>
          </div>
          <p className="text-[11px] text-outline mt-2 leading-tight">
            Tracked wallets, PGP keys, and handles
          </p>
        </div>

        {/* Card 6: Infrastructure Tracked */}
        <div className="card-panel p-4 flex flex-col justify-between border-outline-variant/60 rounded-xl bg-surface-container hover:border-primary/40 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Infrastructure Tracked
              </span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <span className="material-symbols-outlined text-[16px]">dns</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono">
              {isLoading ? '...' : activeInfrastructure}
            </div>
          </div>
          <p className="text-[11px] text-outline mt-2 leading-tight">
            Onion services, darknet domains, and servers
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: 1. Active Investigations Table & 2. Connection Analysis */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Active Investigations & Monitored Syndicates Table */}
          <div className="card-panel p-5 flex flex-col gap-4 border-outline-variant/60 rounded-xl bg-surface-container">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div>
                <h3 className="font-mono text-sm font-bold text-on-surface">
                  Active Threat Syndicates &amp; Investigations
                </h3>
                <p className="text-xs text-outline mt-0.5">
                  Monitored cybercrime groups, active personas, and connection confidence
                </p>
              </div>

              <Link
                href="/investigation?type=ACTOR"
                className="font-mono text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>VIEW ALL ({totalActors})</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="py-10 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-[28px] animate-spin text-primary">sync</span>
                <span className="font-mono text-xs text-outline">Loading active investigations...</span>
              </div>
            ) : actors.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[28px] text-outline">inbox</span>
                <span className="text-xs font-semibold">No Threat Actor Records Found</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant/40 bg-surface-container-low text-outline font-mono">
                      <th className="py-2.5 px-3 uppercase tracking-wider font-semibold">Threat Syndicate</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider font-semibold">Category</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider font-semibold">Online Personas</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider font-semibold w-40">Connection Confidence</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {actors.map((actor) => (
                      <tr key={actor.id} className="interactive-row transition-colors">
                        <td className="py-3 px-3">
                          <Link
                            href={`/actors/${actor.id}`}
                            className="font-semibold text-on-surface hover:text-primary flex items-center gap-2 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[17px] text-rose-400">shield</span>
                            <span>{actor.canonicalName}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-mono text-[10px] font-semibold">
                            {actor.threatCategory.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <div className="flex flex-wrap gap-1">
                            {actor.associatedHandles && actor.associatedHandles.length > 0 ? (
                              actor.associatedHandles.map((h) => (
                                <span
                                  key={h}
                                  className="px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant/60 text-tertiary text-[11px]"
                                >
                                  @{h}
                                </span>
                              ))
                            ) : (
                              <span className="text-outline text-[11px]">None listed</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-on-surface text-xs font-bold w-9">
                              {actor.overallConfidenceScore.toFixed(0)}%
                            </span>
                            <div className="confidence-meter flex-1">
                              <div
                                className={`confidence-fill ${
                                  actor.overallConfidenceScore >= 85
                                    ? 'conf-high'
                                    : actor.overallConfidenceScore >= 70
                                    ? 'conf-med'
                                    : 'conf-low'
                                }`}
                                style={{ width: `${actor.overallConfidenceScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/actors/${actor.id}`}
                            className="btn-secondary px-2.5 py-1 text-[11px] font-mono font-semibold rounded inline-flex items-center gap-1"
                          >
                            <span>Dossier</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Connection Analysis Showcase Card */}
          <div className="card-panel p-5 flex flex-col gap-4 border-outline-variant/60 rounded-xl bg-surface-container shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/40 pb-3">
              <div>
                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
                  HIGHLIGHTED FINDING
                </span>
                <h3 className="font-mono text-sm font-bold text-on-surface">
                  CONNECTION ANALYSIS
                </h3>
              </div>
              <Link
                href="/linkage"
                className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Full Connection Analysis</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>

            {/* Persona Relationship Highlight */}
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-tertiary font-mono text-xs font-bold">
                  @bassterlord_xss
                </div>
                <span className="material-symbols-outlined text-primary text-[20px]">
                  sync_alt
                </span>
                <div className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-primary font-mono text-xs font-bold">
                  @basster_rampv2
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
                    Connection Confidence
                  </span>
                  <span className="font-mono text-lg font-bold text-emerald-400">
                    89.5%
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Strong Connection</span>
                </span>
              </div>
            </div>

            {/* 4 Simple Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-tertiary font-mono font-bold text-[11px]">
                  <span className="material-symbols-outlined text-[15px]">key</span>
                  <span>Identity / Username Match</span>
                </div>
                <p className="text-[11px] text-outline leading-tight">
                  Cryptographic PGP subkey (0x4A72B5C1) and shared Bitcoin escrow wallet.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-primary font-mono font-bold text-[11px]">
                  <span className="material-symbols-outlined text-[15px]">edit_note</span>
                  <span>Writing Style Match</span>
                </div>
                <p className="text-[11px] text-outline leading-tight">
                  Aligned sentence structures, punctuation habits, and Russian/English syntax.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-[11px]">
                  <span className="material-symbols-outlined text-[15px]">schedule</span>
                  <span>Activity Pattern Match</span>
                </div>
                <p className="text-[11px] text-outline leading-tight">
                  Active diurnal posting distribution matching UTC+3 working schedule.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-[11px]">
                  <span className="material-symbols-outlined text-[15px]">dns</span>
                  <span>Technical Connection</span>
                </div>
                <p className="text-[11px] text-outline leading-tight">
                  Shared Tor Onion v3 service mirror and autonomous network co-location.
                </p>
              </div>
            </div>

            {/* Advanced Details Expandable Section */}
            <details className="pt-2 border-t border-outline-variant/40 text-[11px] font-mono text-outline cursor-pointer">
              <summary className="font-semibold text-primary hover:underline">
                View Analysis Details &amp; Technical Scoring
              </summary>
              <div className="mt-2.5 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/40 space-y-1.5 text-on-surface-variant text-[11px]">
                <div className="flex justify-between">
                  <span>Identity / Username Match Weight:</span>
                  <span className="text-on-surface font-bold">33.25 / 35.00 pts (95%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Writing Style Match Weight:</span>
                  <span className="text-on-surface font-bold">21.75 / 25.00 pts (87%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Activity Pattern Match Weight:</span>
                  <span className="text-on-surface font-bold">17.50 / 20.00 pts (88%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Technical Connection Weight:</span>
                  <span className="text-on-surface font-bold">17.00 / 20.00 pts (85%)</span>
                </div>
                <div className="pt-1.5 border-t border-outline-variant/30 flex justify-between font-bold text-primary">
                  <span>Total Calculated Connection Score:</span>
                  <span>89.50 / 100.00 pts</span>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Right Column: 1. Supporting Evidence Stream & 2. Recommended Next Steps */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Recommended Priority Actions for the Analyst */}
          <div className="card-panel p-5 flex flex-col gap-3.5 border-outline-variant/60 rounded-xl bg-surface-container shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2.5">
              <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">checklist</span>
                <span>What to Investigate Next</span>
              </h3>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-mono text-[9px] font-bold">
                PRIORITY QUEUE
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Task 1 */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-rose-400 uppercase">
                    Review Connection
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold">89.5% Match</span>
                </div>
                <p className="font-semibold text-on-surface text-[12px]">
                  Confirm LockBit persona linkage between XSS.is and Ramp forum
                </p>
                <Link
                  href="/linkage"
                  className="font-mono text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 mt-1"
                >
                  <span>Open Connection Workspace</span>
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </Link>
              </div>

              {/* Task 2 */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-amber-400 uppercase">
                    Graph Inspection
                  </span>
                  <span className="font-mono text-[10px] text-outline">Network Nodes</span>
                </div>
                <p className="font-semibold text-on-surface text-[12px]">
                  Inspect onion mirror hosting infrastructure associated with ShinyHunters
                </p>
                <Link
                  href="/graph/a0000000-0000-0000-0000-000000000001"
                  className="font-mono text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 mt-1"
                >
                  <span>Explore Relationship Graph</span>
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </Link>
              </div>

              {/* Task 3 */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase">
                    Dossier Export
                  </span>
                  <span className="font-mono text-[10px] text-outline">Ready for Briefing</span>
                </div>
                <p className="font-semibold text-on-surface text-[12px]">
                  Generate court-ready intelligence brief and evidence matrix for LockBit 3.0
                </p>
                <Link
                  href="/export"
                  className="font-mono text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 mt-1"
                >
                  <span>Export Case Dossier</span>
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Supporting Evidence Stream */}
          <div className="card-panel p-5 flex flex-col gap-3 border-outline-variant/60 rounded-xl bg-surface-container shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2.5">
              <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[17px]">history_edu</span>
                <span>Supporting Evidence Stream</span>
              </h3>
              <Link href="/timeline" className="font-mono text-[11px] text-primary hover:underline font-medium">
                Full Feed →
              </Link>
            </div>

            <div className="space-y-2.5">
              {timelineEvents.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-tertiary font-bold">@{ev.personaHandle || 'threat_actor'}</span>
                    <span className="text-outline">
                      {formatIsoDate(ev.eventTimestamp)}
                    </span>
                  </div>
                  <div className="font-semibold text-on-surface text-[12px]">{ev.title}</div>
                  <p className="text-outline text-[11px] line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>
                  <div className="text-[10px] font-mono text-primary/80 mt-0.5">
                    Source: {ev.sourceReference}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
