'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { TimelineEvent, ActorSummary } from '@/types';

const FALLBACK_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'ev1',
    personaId: 'p1',
    personaHandle: 'bassterlord_xss',
    actorCanonicalName: 'LockBit 3.0 Syndicate',
    eventType: 'FORUM_POST',
    title: 'Persona Observed on Platform (XSS.is)',
    description:
      'Published affiliate revenue split terms (80/20) and operational rulebook in exclusive darknet vendor section.',
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
    title: 'Similar Identifier Detected (PGP Subkey Match)',
    description:
      'Persona registered new profile on Ramp forum publishing matching cryptographic PGP subkey ID 0x4A72B5C1.',
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
    title: 'Shared Financial Identifier Observed (Bitcoin Wallet)',
    description:
      'Announced updated operational Bitcoin deposit wallet bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh for partner verification.',
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
    title: 'Related Infrastructure Identified (Tor Onion Mirror)',
    description:
      'Active Tor Onion v3 negotiation mirror brought online on AS200651 Flokinet Ltd infrastructure providing redundant leak portal access.',
    sourceReference: 'Tor Network Sensor Scan #14',
    eventTimestamp: '2026-08-16T11:05:00Z',
    severity: 'MEDIUM',
  },
  {
    id: 'ev5',
    personaId: 'p1',
    personaHandle: 'bassterlord_xss',
    actorCanonicalName: 'LockBit 3.0 Syndicate',
    eventType: 'FORUM_POST',
    title: 'Writing Style Comparison Completed',
    description:
      'Linguistic analysis identified 87% similarity in vocabulary, bracket opening syntax, and punctuation cadence across both forum personas.',
    sourceReference: 'Writing Style Comparison Engine',
    eventTimestamp: '2026-08-15T08:30:00Z',
    severity: 'INFO',
  },
  {
    id: 'ev6',
    personaId: 'p2',
    personaHandle: 'basster_rampv2',
    actorCanonicalName: 'LockBit 3.0 Syndicate',
    eventType: 'PERSONA_MIGRATION',
    title: 'Strong Connection Detected (89.5% Confidence)',
    description:
      'Deterministic multi-signal connection established between @bassterlord_xss and @basster_rampv2 combining cryptographic keys and writing patterns.',
    sourceReference: 'Connection Analysis Engine',
    eventTimestamp: '2026-08-14T10:00:00Z',
    severity: 'HIGH',
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

function formatEventDate(isoString: string): { monthDay: string; yearTime: string } {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { monthDay: 'Recent', yearTime: '' };
    const month = d.toLocaleString('en-US', { month: 'short' });
    const day = d.getDate();
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return {
      monthDay: `${month} ${day}`,
      yearTime: `${d.getFullYear()} • ${time} UTC`,
    };
  } catch {
    return { monthDay: 'Recent', yearTime: '' };
  }
}

function getPlainEventCategory(eventType: string): string {
  switch (eventType) {
    case 'FORUM_POST':
      return 'Forum Activity';
    case 'PERSONA_MIGRATION':
      return 'Identity Movement';
    case 'WALLET_ANNOUNCEMENT':
    case 'WALLET_PAYMENT':
      return 'Financial Identifier';
    case 'INFRASTRUCTURE_DEPLOYMENT':
    case 'INFRA_ONLINE':
      return 'Technical Infrastructure';
    default:
      return 'Investigation Finding';
  }
}

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
        const actorsRes = await api.getActors();
        if (actorsRes && actorsRes.content && actorsRes.content.length > 0) {
          setActors(actorsRes.content);
        }

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

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header & Filter Bar */}
      <div className="flex flex-col gap-4 sticky top-0 bg-surface/95 backdrop-blur-md z-30 pb-4 border-b border-outline-variant/40 pt-2 -mt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant mb-1 font-mono text-xs">
              <span className="tracking-wider text-primary font-bold">
                INVESTIGATION TIMELINE
              </span>
              <span className="text-outline">/</span>
              <span className={`font-semibold ${isLiveApi ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isLiveApi ? 'Live Activity Feed' : 'Reference Case Study'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">
              Investigation Timeline
            </h1>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed font-sans">
              Chronological sequence of darknet observations, identifier discoveries, and connection milestones
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/linkage"
              className="btn-primary px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span>Connection Analysis</span>
            </Link>
            <Link
              href="/export"
              className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export Stream</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/50">
          {/* Actor Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant/60">
            <span className="material-symbols-outlined text-[16px] text-primary">
              groups
            </span>
            <select
              value={selectedActorId}
              onChange={(e) => {
                setSelectedActorId(e.target.value);
                router.push(`/timeline/${e.target.value}`);
              }}
              className="bg-transparent text-on-surface font-mono text-xs font-semibold outline-none cursor-pointer"
            >
              {actors.map((a) => (
                <option key={a.id} value={a.id} className="bg-surface-container">
                  {a.canonicalName}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-4 bg-outline-variant/50 mx-1 hidden sm:block" />

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-surface-container rounded-lg border border-outline-variant/50 p-0.5">
            {[
              { label: 'All Events', value: 'ALL' },
              { label: 'High Priority', value: 'HIGH', dot: 'bg-rose-400' },
              { label: 'Medium', value: 'MID', dot: 'bg-amber-400' },
              { label: 'Informational', value: 'LOW', dot: 'bg-primary' },
            ].map((sev) => (
              <button
                key={sev.value}
                onClick={() => setSelectedSeverity(sev.value)}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedSeverity === sev.value
                    ? 'bg-primary/20 text-primary border border-primary/30 font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {sev.dot && <div className={`w-2 h-2 rounded-full ${sev.dot}`} />}
                <span>{sev.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="font-mono text-xs text-outline font-semibold">
            {filteredEvents.length} Events Logged
          </div>
        </div>
      </div>

      {/* Clean Timeline Layout */}
      <div className="relative max-w-4xl mx-auto w-full pb-20 mt-2">
        {/* Vertical Center/Left Thread Line */}
        <div className="absolute left-[105px] md:left-[130px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-primary via-outline-variant/80 to-transparent z-0" />

        {/* Timeline Entries */}
        <div className="flex flex-col gap-5 relative z-10">
          {filteredEvents.map((ev, index) => {
            const { monthDay, yearTime } = formatEventDate(ev.eventTimestamp);
            const category = getPlainEventCategory(ev.eventType);

            return (
              <div key={ev.id || index} className="flex items-start gap-4 group">
                {/* 1. Clear Date Block on Left */}
                <div className="w-[90px] md:w-[115px] flex flex-col items-end text-right pt-2 shrink-0">
                  <span className="font-mono text-on-surface text-sm md:text-base font-bold tracking-tight">
                    {monthDay}
                  </span>
                  <span className="font-mono text-[10px] text-outline mt-0.5">
                    {yearTime}
                  </span>
                  {ev.personaHandle && (
                    <span className="font-mono text-[10px] text-tertiary mt-1 font-semibold truncate max-w-[100px]">
                      @{ev.personaHandle}
                    </span>
                  )}
                </div>

                {/* 2. Timeline Step Node */}
                <div className="w-6 flex justify-center pt-3 relative shrink-0">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ring-4 ring-surface z-10 transition-transform group-hover:scale-125 shadow-sm ${
                      ev.severity === 'CRITICAL' || ev.severity === 'HIGH'
                        ? 'bg-rose-400 ring-rose-400/20'
                        : ev.severity === 'MEDIUM'
                        ? 'bg-amber-400 ring-amber-400/20'
                        : 'bg-primary ring-primary/20'
                    }`}
                  />
                </div>

                {/* 3. Event Card */}
                <div className="flex-1 card-panel rounded-xl p-4 shadow-sm hover:border-primary/50 transition-all bg-surface-container border-outline-variant/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h3 className="font-bold text-on-surface text-sm font-sans leading-tight">
                      {ev.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold w-fit uppercase bg-surface-container-high text-outline border border-outline-variant/40">
                      {category}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed font-sans mb-3">
                    {ev.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 font-mono text-[11px] text-outline">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">source</span>
                      <span>Source: {ev.sourceReference || 'Darknet Monitoring Feed'}</span>
                    </div>
                    {ev.severity && (
                      <span
                        className={`text-[10px] font-bold ${
                          ev.severity === 'CRITICAL' || ev.severity === 'HIGH'
                            ? 'text-rose-400'
                            : ev.severity === 'MEDIUM'
                            ? 'text-amber-400'
                            : 'text-primary'
                        }`}
                      >
                        {ev.severity} PRIORITY
                      </span>
                    )}
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
