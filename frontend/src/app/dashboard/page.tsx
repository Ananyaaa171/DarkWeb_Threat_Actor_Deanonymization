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

            // Attempt to load live timeline from first actor
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

  // Exact API field bindings with resilient fallbacks
  const totalActors = dashboardStats?.totalThreatActors ?? (actors.length > 0 ? actors.length : 3);
  const totalPersonas = dashboardStats?.trackedPersonas ?? 7;
  const activeInvestigations = dashboardStats?.activeInvestigations ?? 4;
  const highConfidenceCount = dashboardStats?.highConfidenceLinkages ?? 2;

  return (
    <div className="flex flex-col gap-6">
      {/* Quick Investigation Entry Card (Stitch Banner) */}
      <div className="card-panel p-6 flex flex-col md:flex-row items-center gap-4 bg-gradient-to-r from-surface-container-high to-surface-container-lowest border border-outline-variant">
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-title-sm text-title-sm font-semibold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">travel_explore</span>
              <span>Initialize Quick Investigation</span>
            </h2>
            <div className="flex items-center gap-2 font-label-caps text-[10px]">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></span>
              <span className={isBackendConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {isBackendConnected ? 'LIVE / API CONNECTED' : 'DEMO MODE / FALLBACK'}
              </span>
            </div>
          </div>
          <form onSubmit={handleQuickAnalyze} className="relative flex w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Enter Moniker (@bassterlord), PGP Key (0x4A72B5C1), BTC Wallet, or Onion URL..."
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-l-lg pl-10 pr-4 py-3 font-data-mono text-data-mono text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <button
              type="submit"
              className="bg-surface-variant hover:bg-surface-bright text-on-surface border-y border-r border-outline-variant rounded-r-lg px-6 font-title-sm text-title-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Analyze</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>
        </div>
      </div>

      {/* 4 Stats Cards Grid (Exact Stitch Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Metric 1 */}
        <div className="card-panel p-4 flex flex-col gap-2 border-outline-variant">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Total Threat Actors
            </span>
            <span className="material-symbols-outlined text-outline-variant text-[20px]">
              group_off
            </span>
          </div>
          <div className="font-display-lg text-display-lg font-bold text-on-surface mt-1">
            {isLoading ? '...' : totalActors}
          </div>
          <div className="flex items-center gap-1 font-body-sm text-body-sm text-[#10B981]">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>LockBit, ShinyHunters, ALPHV</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-panel p-4 flex flex-col gap-2 border-outline-variant">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Tracked Personas
            </span>
            <span className="material-symbols-outlined text-outline-variant text-[20px]">masks</span>
          </div>
          <div className="font-display-lg text-display-lg font-bold text-on-surface mt-1">
            {isLoading ? '...' : totalPersonas}
          </div>
          <div className="flex items-center gap-1 font-body-sm text-body-sm text-[#F59E0B]">
            <span className="material-symbols-outlined text-[16px]">trending_flat</span>
            <span>XSS.is, Exploit.in, Ramp</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card-panel p-4 flex flex-col gap-2 border-outline-variant">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Active Investigations
            </span>
            <span className="material-symbols-outlined text-outline-variant text-[20px]">
              target
            </span>
          </div>
          <div className="font-display-lg text-display-lg font-bold text-on-surface mt-1">
            {isLoading ? '...' : activeInvestigations}
          </div>
          <div className="flex items-center gap-1 font-body-sm text-body-sm text-outline">
            <span className="material-symbols-outlined text-[16px]">pending_actions</span>
            <span>{activeInvestigations} active operations</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card-panel p-4 flex flex-col gap-2 border-l-4 border-l-[#EF4444] border-outline-variant">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              High-Conf Linkages
            </span>
            <span className="material-symbols-outlined text-[#EF4444] text-[20px]">link</span>
          </div>
          <div className="font-display-lg text-display-lg font-bold text-on-surface mt-1">
            {isLoading ? '...' : highConfidenceCount}
          </div>
          <div className="flex items-center gap-1 font-body-sm text-body-sm text-[#EF4444]">
            <span className="material-symbols-outlined text-[16px]">priority_high</span>
            <span>&gt;= 85% Attribution Match</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Profiles Table (Col 8) + Confidence Distribution & Recent Stream (Col 4) */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column: Active Threat Actors Table */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="card-panel p-5 flex flex-col gap-4 border-outline-variant">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div>
                <h3 className="font-title-sm text-title-sm font-bold text-on-surface">
                  Active Threat Actor Profiles
                </h3>
                <p className="font-body-sm text-body-sm text-outline">
                  Canonical syndicates and associated darknet forum handles
                </p>
              </div>

              <Link
                href="/investigation?type=ACTOR"
                className="font-label-caps text-label-caps text-primary hover:text-primary-fixed flex items-center gap-1"
              >
                <span>VIEW ALL ({totalActors})</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            {/* Loading & Empty State Handling */}
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px] animate-spin text-primary">sync</span>
                <span className="font-data-mono text-xs">Loading threat intelligence profiles...</span>
              </div>
            ) : actors.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px] text-outline">inbox</span>
                <span className="font-title-sm text-sm font-semibold">No Threat Actor Profiles Found</span>
                <p className="font-body-sm text-xs text-outline">Database has no indexed threat actors matching current criteria.</p>
              </div>
            ) : (
              /* Dense Professional Data Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-body-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low">
                      <th className="font-label-caps text-label-caps text-outline py-2.5 px-3">
                        THREAT ACTOR / SYNDICATE
                      </th>
                      <th className="font-label-caps text-label-caps text-outline py-2.5 px-3">
                        CATEGORY
                      </th>
                      <th className="font-label-caps text-label-caps text-outline py-2.5 px-3">
                        ASSOCIATED PERSONAS
                      </th>
                      <th className="font-label-caps text-label-caps text-outline py-2.5 px-3 w-40">
                        ATTRIBUTION
                      </th>
                      <th className="font-label-caps text-label-caps text-outline py-2.5 px-3 text-right">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 font-body-sm">
                    {actors.map((actor) => (
                      <tr key={actor.id} className="interactive-row transition-colors">
                        <td className="py-3 px-3">
                          <Link
                            href={`/actors/${actor.id}`}
                            className="font-semibold text-on-surface hover:text-primary flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px] text-rose-400">
                              shield_with_heart
                            </span>
                            <span>{actor.canonicalName}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-error-container/40 text-error border border-error/30 font-label-caps text-[10px]">
                            {actor.threatCategory}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-data-mono text-data-mono">
                          <div className="flex flex-wrap gap-1">
                            {actor.associatedHandles && actor.associatedHandles.length > 0 ? (
                              actor.associatedHandles.map((h) => (
                                <span
                                  key={h}
                                  className="px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant text-tertiary text-[11px]"
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
                            <span className="font-data-mono text-data-mono text-on-surface text-[12px] font-bold">
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
                            className="btn-secondary px-2.5 py-1 text-[11px] font-label-caps rounded inline-flex"
                          >
                            <span>Dossier</span>
                            <span className="material-symbols-outlined text-[14px]">
                              chevron_right
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Confidence Distribution & Recent Stream */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Attribution Confidence Distribution Panel */}
          <div className="card-panel p-5 flex flex-col gap-3 border-outline-variant">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2.5">
              <h3 className="font-label-caps text-label-caps font-bold text-on-surface uppercase">
                Attribution Confidence Distribution
              </h3>
              <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant font-label-caps text-[9px] text-primary">
                4-FACTOR
              </span>
            </div>

            <div className="space-y-3 font-body-sm text-body-sm">
              <div>
                <div className="flex justify-between text-on-surface-variant font-data-mono text-[12px] mb-1">
                  <span>VERY HIGH (&gt;= 85%)</span>
                  <span className="text-[#10B981] font-bold">2 Personas</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-on-surface-variant font-data-mono text-[12px] mb-1">
                  <span>HIGH (70% - 84%)</span>
                  <span className="text-primary font-bold">1 Persona</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-on-surface-variant font-data-mono text-[12px] mb-1">
                  <span>MODERATE (40% - 69%)</span>
                  <span className="text-[#F59E0B] font-bold">1 Persona</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                  <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-outline-variant font-label-caps text-[10px] text-outline">
              Formula: 35% ID + 25% Stylometry + 20% Behavior + 20% Infra
            </div>
          </div>

          {/* Recent Intelligence Stream */}
          <div className="card-panel p-5 flex flex-col gap-3 border-outline-variant">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2.5">
              <h3 className="font-label-caps text-label-caps font-bold text-on-surface uppercase">
                Recent Intelligence Stream
              </h3>
              <Link href="/timeline" className="font-label-caps text-[10px] text-primary hover:underline">
                Explore Full Feed
              </Link>
            </div>

            <div className="space-y-3">
              {timelineEvents.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded bg-surface-container-low border border-outline-variant flex flex-col gap-1 text-body-sm"
                >
                  <div className="flex items-center justify-between font-data-mono text-[11px]">
                    <span className="text-tertiary font-bold">@{ev.personaHandle || 'actor'}</span>
                    <span className="text-outline">
                      {formatIsoDate(ev.eventTimestamp)}
                    </span>
                  </div>
                  <div className="font-semibold text-on-surface text-[12px]">{ev.title}</div>
                  <p className="text-outline text-[11px] line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
