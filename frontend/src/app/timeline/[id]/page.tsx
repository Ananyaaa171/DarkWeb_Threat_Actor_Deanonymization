'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { TimelineEvent, ActorSummary } from '@/types';
import { formatIsoDate, formatIsoTime } from '@/utils/formatters';

const FALLBACK_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'ev1',
    personaId: 'p1',
    personaHandle: 'bassterlord_xss',
    actorCanonicalName: 'LockBit 3.0 Syndicate',
    eventType: 'FORUM_POST',
    title: 'Affiliate Operational Handbook v3 Released on XSS.is',
    description:
      'Detailed revenue split terms (80/20) and explicit prohibition on targeting CIS critical infrastructure published in exclusive vendor section.',
    sourceReference: 'XSS.is Forum #412',
    eventTimestamp: '2026-08-22T14:22:05Z',
    severity: 'HIGH',
  },
  {
    id: 'ev2',
    personaId: 'p2',
    personaHandle: 'basster_rampv2',
    actorCanonicalName: 'LockBit 3.0 Syndicate',
    eventType: 'PERSONA_MIGRATION',
    title: 'Account Registration on Ramp Forum with Matching PGP Subkey',
    description:
      'New handle established referencing previous affiliate work with identical subkey ID 0x4A72B5C1.',
    sourceReference: 'Ramp User Profile #883',
    eventTimestamp: '2026-08-21T09:15:30Z',
    severity: 'HIGH',
  },
  {
    id: 'ev3',
    personaId: 'p1',
    personaHandle: 'bassterlord_xss',
    actorCanonicalName: 'LockBit 3.0 Syndicate',
    eventType: 'WALLET_ANNOUNCEMENT',
    title: 'New Bitcoin Escrow Deposit Address Configured',
    description:
      'Announced updated multi-sig operational wallet bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh for affiliate payout verification.',
    sourceReference: 'Exploit.in Escrow Channel',
    eventTimestamp: '2026-08-19T17:40:12Z',
    severity: 'CRITICAL',
  },
  {
    id: 'ev4',
    personaId: 'p1',
    personaHandle: 'bassterlord_xss',
    actorCanonicalName: 'LockBit 3.0 Syndicate',
    eventType: 'INFRASTRUCTURE_DEPLOYMENT',
    title: 'Tor Onion Negotiation Mirror Brought Online',
    description:
      'New Onion v3 portal live on AS200651 Flokinet Ltd infrastructure providing redundant leak access.',
    sourceReference: 'Tor Network Sensor #14',
    eventTimestamp: '2026-08-16T11:05:00Z',
    severity: 'MEDIUM',
  },
];

const FALLBACK_ACTORS: ActorSummary[] = [
  {
    id: '2bee3f4c-1923-40da-a2e9-78b9a1e9eb79',
    canonicalName: 'LockBit 3.0 Syndicate',
    threatCategory: 'RANSOMWARE',
    primaryMotive: 'FINANCIAL',
    status: 'ACTIVE',
    overallConfidenceScore: 92.5,
    personaCount: 2,
    associatedHandles: ['bassterlord_xss', 'basster_rampv2'],
    lastObservedAt: '2026-08-22T12:00:00Z',
  },
  {
    id: '8f6b1a3d-4c5e-4791-b283-9e1234567890',
    canonicalName: 'ShinyHunters Group',
    threatCategory: 'DATA_BROKER',
    primaryMotive: 'FINANCIAL',
    status: 'ACTIVE',
    overallConfidenceScore: 84.0,
    personaCount: 2,
    associatedHandles: ['shiny_breached', 'shiny_telegram'],
    lastObservedAt: '2026-08-20T08:30:00Z',
  },
];

export default function TimelinePage() {
  const params = useParams();
  const router = useRouter();
  const actorId = (params?.id as string) || '2bee3f4c-1923-40da-a2e9-78b9a1e9eb79';

  const [events, setEvents] = useState<TimelineEvent[]>(FALLBACK_TIMELINE_EVENTS);
  const [actors, setActors] = useState<ActorSummary[]>(FALLBACK_ACTORS);
  const [selectedActorId, setSelectedActorId] = useState<string>(actorId);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadTimeline() {
      try {
        setIsLoading(true);
        // Load actors list for filter selector
        const actorsRes = await api.getActors();
        if (actorsRes && actorsRes.content && actorsRes.content.length > 0) {
          setActors(actorsRes.content);
        }

        // Load timeline for selected actor
        const timelineRes = await api.getActorTimeline(selectedActorId);
        if (timelineRes && timelineRes.content && timelineRes.content.length > 0) {
          setEvents(timelineRes.content);
          setIsLiveApi(true);
        } else {
          setEvents(FALLBACK_TIMELINE_EVENTS);
          setIsLiveApi(false);
        }
      } catch (err: any) {
        console.warn('Backend timeline offline, rendering demonstration chronological events:', err);
        setEvents(FALLBACK_TIMELINE_EVENTS);
        setIsLiveApi(false);
      } finally {
        setIsLoading(false);
      }
    }
    loadTimeline();
  }, [selectedActorId]);

  const filteredEvents = events.filter((ev) => {
    if (selectedSeverity === 'ALL') return true;
    if (selectedSeverity === 'HIGH' && (ev.severity === 'HIGH' || ev.severity === 'CRITICAL')) return true;
    if (selectedSeverity === 'MID' && ev.severity === 'MEDIUM') return true;
    if (selectedSeverity === 'LOW' && ev.severity === 'INFO') return true;
    return false;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return {
          bg: 'bg-error',
          ring: 'shadow-[0_0_8px_rgba(255,180,171,0.5)]',
          badge: 'bg-rose-950/60 text-rose-300 border border-rose-500/30',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-tertiary-container',
          ring: 'shadow-[0_0_8px_rgba(223,116,18,0.5)]',
          badge: 'bg-amber-950/60 text-amber-300 border border-amber-500/30',
        };
      default:
        return {
          bg: 'bg-primary',
          ring: 'shadow-[0_0_8px_rgba(173,198,255,0.5)]',
          badge: 'bg-blue-950/60 text-blue-300 border border-blue-500/30',
        };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header & Filter Bar (Exact Stitch Timeline Header) */}
      <div className="flex flex-col gap-4 sticky top-0 bg-surface/95 backdrop-blur-md z-30 pb-4 border-b border-outline-variant/40 pt-2 -mt-2">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
              Intelligence Timeline
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Chronological synthesis of actor activities, persona migrations, and cryptographic events.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/export"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container hover:bg-surface-variant transition-colors text-body-sm font-body-sm text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Stream</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-low p-2 rounded-lg border border-outline-variant/50 font-body-sm">
          {/* Actor Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded border border-outline-variant/30">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              group
            </span>
            <select
              value={selectedActorId}
              onChange={(e) => {
                setSelectedActorId(e.target.value);
                router.push(`/timeline/${e.target.value}`);
              }}
              className="bg-transparent text-on-surface font-label-caps text-[11px] outline-none cursor-pointer"
            >
              {actors.map((a) => (
                <option key={a.id} value={a.id} className="bg-surface-container">
                  {a.canonicalName}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-4 bg-outline-variant/50 mx-1"></div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-surface rounded border border-outline-variant/30 p-0.5">
            {[
              { label: 'All', value: 'ALL' },
              { label: 'High', value: 'HIGH', dot: 'bg-error' },
              { label: 'Mid', value: 'MID', dot: 'bg-tertiary-container' },
              { label: 'Low', value: 'LOW', dot: 'bg-primary' },
            ].map((sev) => (
              <button
                key={sev.value}
                onClick={() => setSelectedSeverity(sev.value)}
                className={`px-3 py-1 rounded text-[12px] font-label-caps transition-colors flex items-center gap-1 ${
                  selectedSeverity === sev.value
                    ? 'bg-surface-variant text-on-surface font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {sev.dot && <div className={`w-2 h-2 rounded-full ${sev.dot}`}></div>}
                <span>{sev.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1"></div>

          <div className="font-label-caps text-[10px] text-outline font-bold">
            {filteredEvents.length} EVENTS CHRONICLED •{' '}
            <span className="text-primary">{isLiveApi ? 'LIVE TIMELINE' : 'DEMO STREAM'}</span>
          </div>
        </div>
      </div>

      {/* Timeline Layout (Exact Stitch Vertical Thread) */}
      <div className="relative max-w-5xl mx-auto w-full pb-20 mt-4">
        {/* Vertical Thread Line */}
        <div className="absolute left-[140px] md:left-[180px] top-4 bottom-0 w-[2px] bg-outline-variant/30 z-0"></div>

        {/* Timeline Entries */}
        <div className="flex flex-col gap-8 relative z-10">
          {filteredEvents.map((ev, index) => {
            const dateStr = formatIsoDate(ev.eventTimestamp);
            const timeStr = formatIsoTime(ev.eventTimestamp);
            const sevMeta = getSeverityBadge(ev.severity);

            return (
              <div key={ev.id || index} className="flex gap-4 group">
                {/* Timestamp & Context */}
                <div className="w-[120px] md:w-[160px] flex flex-col items-end text-right pt-1 shrink-0">
                  <span className="font-data-mono text-on-surface text-[13px] font-bold">
                    {timeStr}Z
                  </span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant mt-0.5 uppercase">
                    {dateStr}
                  </span>
                  <span className="font-label-caps text-[9px] text-tertiary mt-0.5">
                    @{ev.personaHandle || 'actor'}
                  </span>
                </div>

                {/* Indicator Circle */}
                <div className="w-8 flex justify-center pt-2 relative shrink-0">
                  <div
                    className={`w-3 h-3 rounded-full ${sevMeta.bg} ring-4 ring-surface ${sevMeta.ring} z-10 transition-transform group-hover:scale-125`}
                  ></div>
                </div>

                {/* Content Card (Stitch Card) */}
                <div className="flex-1 card-panel rounded-xl p-4 shadow-sm hover:border-outline transition-all cursor-pointer bg-surface-container">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface text-body-md font-sans">
                        {ev.title}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-label-caps text-[9px] ${sevMeta.badge}`}>
                      {ev.severity || 'INFO'}
                    </span>
                  </div>

                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-3">
                    {ev.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 font-label-caps text-[10px] text-outline">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">source</span>
                      <span>Source: {ev.sourceReference || 'Darknet Sensor Stream'}</span>
                    </div>
                    <span className="text-primary font-mono">{ev.eventType}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
