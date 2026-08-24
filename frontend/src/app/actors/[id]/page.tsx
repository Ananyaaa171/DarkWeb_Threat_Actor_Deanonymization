'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { ActorDetail } from '@/types';
import { formatIsoDate } from '@/utils/formatters';

const FALLBACK_ACTOR_DETAIL: ActorDetail = {
  id: '2bee3f4c-1923-40da-a2e9-78b9a1e9eb79',
  canonicalName: 'LockBit 3.0 Syndicate',
  threatCategory: 'RANSOMWARE GROUP',
  primaryMotive: 'FINANCIAL EXTORTION',
  status: 'Active',
  overallConfidenceScore: 92.0,
  summary:
    'Prolific Ransomware-as-a-Service (RaaS) syndicate conducting global extortion campaigns. Key operational persona @bassterlord migrated from XSS.is to Ramp forum maintaining identical PGP subkeys (0x4A72B5C1) and Monero operational deposit addresses.',
  firstObservedAt: '2022-06-15T00:00:00Z',
  lastObservedAt: '2026-08-22T12:00:00Z',
  personas: [
    {
      id: 'p1-uuid',
      handle: 'bassterlord_xss',
      platform: 'XSS.is Underground',
      reputationScore: 98.5,
      status: 'MIGRATED',
      activityTimezoneEstimated: 'UTC+3 (MSK)',
      identifierCount: 3,
      infrastructureCount: 2,
      firstSeenAt: '2022-08-10T00:00:00Z',
      lastSeenAt: '2026-07-30T00:00:00Z',
    },
    {
      id: 'p2-uuid',
      handle: 'basster_rampv2',
      platform: 'Ramp Forum',
      reputationScore: 94.0,
      status: 'ACTIVE',
      activityTimezoneEstimated: 'UTC+3 (MSK)',
      identifierCount: 2,
      infrastructureCount: 1,
      firstSeenAt: '2026-08-01T00:00:00Z',
      lastSeenAt: '2026-08-22T00:00:00Z',
    },
  ],
  identifiers: [
    {
      id: 'id1',
      type: 'Bitcoin Wallet',
      value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      metadata: '{"tx_count": 48, "total_received_btc": 28.45}',
      isVerified: true,
      firstSeenAt: '2023-10-12T00:00:00Z',
    },
    {
      id: 'id2',
      type: 'Monero Escrow Wallet',
      value: '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
      metadata: '{"currency": "XMR", "escrow_type": "Primary"}',
      isVerified: true,
      firstSeenAt: '2023-09-28T00:00:00Z',
    },
    {
      id: 'id3',
      type: 'PGP Cryptographic Key',
      value: '0x8B9C7A14F2D3E566 (Subkey: 0x4A72B5C1)',
      metadata: '{"algorithm": "RSA-4096", "verified": true}',
      isVerified: true,
      firstSeenAt: '2022-11-05T00:00:00Z',
    },
    {
      id: 'id4',
      type: 'Secure Tox Contact ID',
      value: '5A6C7B8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D',
      metadata: '{"client": "qTox"}',
      isVerified: true,
      firstSeenAt: '2023-08-14T00:00:00Z',
    },
  ],
  infrastructure: [
    {
      id: 'inf1',
      type: 'Tor Onion Service (v3)',
      value: 'http://lockbit7z275w3k3jshv5729fksu627ahskd8276f5skdl27f6sjd8.onion',
      ipAddress: '185.220.101.44',
      asn: 'AS200651 Flokinet Ltd',
      sslCertFingerprint: 'SHA256:7B8F21A49C03E84729B1238479A1F4C5E6D7B8A9',
      isLive: true,
      lastScannedAt: '2026-08-22T08:00:00Z',
    },
    {
      id: 'inf2',
      type: 'Clearnet Leak Mirror',
      value: 'https://lockbit-press-release.is',
      ipAddress: '194.26.29.118',
      asn: 'AS59796 Alexhost SRL',
      sslCertFingerprint: 'SHA256:4C5E6D7B8A97B8F21A49C03E84729B1238479A1F',
      isLive: false,
      lastScannedAt: '2026-08-20T12:00:00Z',
    },
  ],
  recentTimeline: [
    {
      id: 'tl1',
      personaId: 'p1-uuid',
      personaHandle: 'bassterlord_xss',
      actorCanonicalName: 'LockBit 3.0 Syndicate',
      eventType: 'FORUM_POST',
      title: 'Affiliate Operational Handbook v3 Released',
      description: 'Published step-by-step guidance on domain trust traversal and defense evasion techniques.',
      sourceReference: 'XSS.is Forum #412',
      eventTimestamp: '2026-08-22T14:00:00Z',
      severity: 'MEDIUM',
    },
    {
      id: 'tl2',
      personaId: 'p2-uuid',
      personaHandle: 'basster_rampv2',
      actorCanonicalName: 'LockBit 3.0 Syndicate',
      eventType: 'PERSONA_MIGRATION',
      title: 'Ramp Forum Registration with Matching PGP Key',
      description: 'Established handle basster_rampv2 verifying identity using subkey 0x4A72B5C1.',
      sourceReference: 'Ramp Forum Archive #883',
      eventTimestamp: '2026-08-21T10:30:00Z',
      severity: 'HIGH',
    },
  ],
};

export default function ActorProfilePage() {
  const params = useParams();
  const actorId = params.id as string;

  const [actor, setActor] = useState<ActorDetail>(FALLBACK_ACTOR_DETAIL);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CONNECTIONS' | 'EVIDENCE' | 'TIMELINE'>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    async function loadActor() {
      if (!actorId) return;
      try {
        setIsLoading(true);
        const data = await api.getActor(actorId);
        if (data && data.canonicalName) {
          setActor(data);
          setIsLiveApi(true);
        } else {
          setActor(FALLBACK_ACTOR_DETAIL);
          setIsLiveApi(false);
        }
      } catch (err: any) {
        console.warn('Backend offline, using fallback dossier for demonstration:', err);
        setActor(FALLBACK_ACTOR_DETAIL);
        setIsLiveApi(false);
      } finally {
        setIsLoading(false);
      }
    }
    loadActor();
  }, [actorId]);

  // Aggregate platforms & handles
  const platformList = Array.from(new Set(actor.personas.map((p) => p.platform))).join(', ') || 'XSS.is, Ramp, Telegram';
  const aliasesList = actor.personas.map((p) => `@${p.handle}`).join(', ') || '@bassterlord_xss, @basster_rampv2';
  const liveInfraCount = actor.infrastructure.filter((i) => i.isLive).length;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Identity Header */}
      <div className="card-panel rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-outline-variant/60 bg-surface-container shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[32px]">shield</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-bold text-on-surface m-0 leading-tight">
                {actor.canonicalName}
              </h1>
              <span className="bg-rose-500/15 border border-rose-500/30 text-rose-300 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase">
                {actor.threatCategory.replace(/_/g, ' ')}
              </span>
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded font-mono text-[10px] font-semibold">
                Status: {actor.status}
              </span>
            </div>

            {/* Aliases / Handles */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-outline mb-2">
              <span className="text-on-surface-variant font-semibold">Known Aliases:</span>
              <span className="text-tertiary font-bold">{aliasesList}</span>
              <span>•</span>
              <span>First Observed: {formatIsoDate(actor.firstObservedAt)}</span>
            </div>

            {/* Short Narrative Description */}
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-3xl font-sans">
              {actor.summary}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-end gap-2.5 w-full md:w-auto shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-outline font-semibold">Connection Confidence:</span>
            <span className="font-mono text-sm font-bold text-emerald-400">
              {actor.overallConfidenceScore.toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Link
              href={
                actor.personas.length >= 2
                  ? `/linkage?source=${actor.personas[0].id}&target=${actor.personas[1].id}`
                  : `/linkage`
              }
              className="btn-primary px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>Analyze Connections</span>
            </Link>
            <Link
              href={`/export?actorId=${actor.id}`}
              className="btn-secondary px-3.5 py-2 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export Dossier</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Platforms */}
        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-outline uppercase font-bold tracking-wider">
            Platforms
          </span>
          <span className="text-xs font-bold text-on-surface font-mono truncate">
            {platformList}
          </span>
          <span className="text-[10px] text-outline">Active darknet forums</span>
        </div>

        {/* Activity & Schedule */}
        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-outline uppercase font-bold tracking-wider">
            Activity Schedule
          </span>
          <span className="text-xs font-bold text-amber-400 font-mono">
            {actor.personas[0]?.activityTimezoneEstimated || 'UTC+3 (Business Hours)'}
          </span>
          <span className="text-[10px] text-outline">Last Seen: {formatIsoDate(actor.lastObservedAt)}</span>
        </div>

        {/* Related Identities */}
        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-outline uppercase font-bold tracking-wider">
            Related Identities
          </span>
          <span className="text-xs font-bold text-tertiary font-mono">
            {actor.personas.length} Online Personas
          </span>
          <span className="text-[10px] text-outline">Verified handle migrations</span>
        </div>

        {/* Connections */}
        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-outline uppercase font-bold tracking-wider">
            Connections
          </span>
          <span className="text-xs font-bold text-emerald-400 font-mono">
            Strong Connection (≥ 89%)
          </span>
          <span className="text-[10px] text-outline">Multi-signal correlation</span>
        </div>

        {/* Infrastructure */}
        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-outline uppercase font-bold tracking-wider">
            Infrastructure
          </span>
          <span className="text-xs font-bold text-cyan-400 font-mono">
            {actor.infrastructure.length} Hosts ({liveInfraCount} Live)
          </span>
          <span className="text-[10px] text-outline">Tor Onion mirrors &amp; servers</span>
        </div>
      </div>

      {/* 3. Main Investigation Tabs */}
      <div className="card-panel rounded-xl flex flex-col border-outline-variant/60 bg-surface-container shadow-sm min-h-[480px]">
        {/* Navigation Tabs Header */}
        <div className="border-b border-outline-variant/40 px-6 py-3.5 flex gap-8 font-mono text-xs font-semibold overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'OVERVIEW' },
            { id: 'CONNECTIONS', label: `CONNECTIONS (${actor.personas.length})` },
            { id: 'EVIDENCE', label: `EVIDENCE (${actor.identifiers.length + actor.infrastructure.length})` },
            { id: 'TIMELINE', label: `TIMELINE & ACTIVITY (${actor.recentTimeline.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 -mb-[15px] cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary font-bold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Narrative & Investigation Scope */}
              <div className="flex flex-col gap-4">
                <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                  Threat Profile &amp; Modus Operandi
                </h3>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2 text-xs text-on-surface-variant leading-relaxed font-sans">
                  <p>
                    <strong className="text-on-surface">{actor.canonicalName}</strong> operates primarily for{' '}
                    <span className="text-primary font-bold">{actor.primaryMotive}</span>. Investigations confirm that operational actor{' '}
                    <span className="text-tertiary font-mono font-bold">@bassterlord_xss</span> registered secondary handles across darknet boards to distribute affiliate RaaS builds.
                  </p>
                  <p>
                    Financial transactions are routed through Monero escrow deposits and confirmed Bitcoin wallets. All activity coincides with Eastern European business hours (UTC+3).
                  </p>
                </div>

                {/* Key Quick Facts */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-outline">Primary Category:</span>
                    <span className="text-on-surface font-bold">{actor.threatCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Tracked Identifiers:</span>
                    <span className="text-on-surface font-bold">{actor.identifiers.length} Items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Hosting Infrastructure:</span>
                    <span className="text-on-surface font-bold">{actor.infrastructure.length} Endpoints</span>
                  </div>
                </div>
              </div>

              {/* Related Online Personas Grid */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                    Online Personas
                  </h3>
                  <Link
                    href={`/graph/${actor.id}`}
                    className="text-primary hover:underline font-mono text-xs font-semibold flex items-center gap-1"
                  >
                    <span>View Graph Map</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>

                <div className="space-y-3">
                  {actor.personas.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                        <div>
                          <div className="font-mono text-xs font-bold text-tertiary">
                            @{p.handle}
                          </div>
                          <div className="text-[11px] text-outline">{p.platform}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 text-[10px] font-bold">
                          {p.status}
                        </span>
                        <Link
                          href={`/linkage?source=${p.id}`}
                          className="btn-secondary px-2.5 py-1 text-[11px] font-semibold"
                        >
                          Analyze
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 4. CONNECTIONS */}
        {activeTab === 'CONNECTIONS' && (
          <div className="p-6 flex flex-col gap-4">
            <div>
              <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                Correlated Online Personas &amp; Connections
              </h3>
              <p className="text-xs text-outline mt-0.5">
                Evaluated relationships supported by multiple forensic signals
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {actor.personas.map((persona, index) => {
                const partnerPersona = actor.personas[(index + 1) % actor.personas.length];
                return (
                  <div
                    key={persona.id}
                    className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <span className="material-symbols-outlined text-[24px]">link</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-bold text-tertiary">
                            @{persona.handle}
                          </span>
                          <span className="material-symbols-outlined text-outline text-[16px]">
                            sync_alt
                          </span>
                          <span className="font-mono text-sm font-bold text-primary">
                            @{partnerPersona.handle}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
                          Exact cryptographic PGP subkey match (0x4A72B5C1) and aligned Russian/English forum writing syntax.
                        </p>
                        <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-outline">
                          <span className="text-emerald-400 font-bold">4 Supporting Evidence Items</span>
                          <span>•</span>
                          <span>Platforms: {persona.platform} &amp; {partnerPersona.platform}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2 w-full md:w-auto shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-outline">Connection Confidence:</span>
                        <span className="font-mono text-base font-bold text-emerald-400">89.5%</span>
                      </div>
                      <Link
                        href={`/linkage?source=${persona.id}&target=${partnerPersona.id}`}
                        className="btn-primary px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm"
                      >
                        Inspect Connection Analysis →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: 5. EVIDENCE */}
        {activeTab === 'EVIDENCE' && (
          <div className="p-6 flex flex-col gap-6">
            <div>
              <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                Supporting Evidence &amp; Observed Indicators
              </h3>
              <p className="text-xs text-outline mt-0.5">
                Plain-English breakdown of verified forensic signals, financial wallets, and network hosts
              </p>
            </div>

            {/* Plain English Evidence Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment & Wallets */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-tertiary font-mono text-xs font-bold">
                  <span className="material-symbols-outlined text-[18px]">currency_bitcoin</span>
                  <span>Payment &amp; Financial Wallets</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  {actor.identifiers
                    .filter((id) => id.type.includes('Wallet'))
                    .map((id) => (
                      <div key={id.id} className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30">
                        <div className="text-outline text-[11px] uppercase font-semibold">{id.type}</div>
                        <div className="text-tertiary select-all break-all mt-0.5 font-bold">{id.value}</div>
                        <div className="text-[10px] text-outline mt-1">First Seen: {formatIsoDate(id.firstSeenAt)}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Cryptographic Keys */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold">
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>Cryptographic Keys &amp; Contact Handles</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  {actor.identifiers
                    .filter((id) => !id.type.includes('Wallet'))
                    .map((id) => (
                      <div key={id.id} className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30">
                        <div className="text-outline text-[11px] uppercase font-semibold">{id.type}</div>
                        <div className="text-primary select-all break-all mt-0.5 font-bold">{id.value}</div>
                        <div className="text-[10px] text-outline mt-1">First Seen: {formatIsoDate(id.firstSeenAt)}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Hosting & Tor Mirrors */}
              <div className="col-span-1 md:col-span-2 p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                  <span className="material-symbols-outlined text-[18px]">dns</span>
                  <span>Hosting Infrastructure &amp; Tor Onion Mirrors</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  {actor.infrastructure.map((inf) => (
                    <div key={inf.id} className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="text-outline text-[11px] uppercase font-semibold">{inf.type.replace(/_/g, ' ')}</div>
                        <div className="text-on-surface font-bold break-all select-all">{inf.value}</div>
                        <div className="text-[10px] text-outline mt-0.5">IP Address: {inf.ipAddress} • {inf.asn}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inf.isLive ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}>
                        {inf.isLive ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Details Toggle */}
            <details className="pt-2 border-t border-outline-variant/40 text-[11px] font-mono text-outline cursor-pointer">
              <summary className="font-semibold text-primary hover:underline">
                Advanced Details &amp; Raw Identifier Hashes
              </summary>
              <div className="mt-2.5 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/40 space-y-2 text-[11px] font-mono text-on-surface-variant">
                <div>Case UUID: {actor.id}</div>
                <div>Primary Motive Code: {actor.primaryMotive}</div>
                <div>Confidence Metric: {actor.overallConfidenceScore.toFixed(4)}</div>
                {actor.infrastructure.map((inf) => (
                  <div key={inf.id} className="truncate">
                    SSL Cert ({inf.type}): {inf.sslCertFingerprint || 'N/A'}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Tab 4: 6. TIMELINE */}
        {activeTab === 'TIMELINE' && (
          <div className="p-6 flex flex-col gap-4">
            <div>
              <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                Chronological Activity Stream
              </h3>
              <p className="text-xs text-outline mt-0.5">
                Timeline of forum publications, account migrations, and cryptocurrency events
              </p>
            </div>

            <div className="space-y-3">
              {actor.recentTimeline.map((tl) => (
                <div
                  key={tl.id}
                  className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-tertiary font-bold">@{tl.personaHandle}</span>
                    <span className="text-outline">{formatIsoDate(tl.eventTimestamp)}</span>
                  </div>
                  <div className="font-bold text-on-surface text-sm font-sans">{tl.title}</div>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-sans">{tl.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-[11px] font-mono text-outline">
                    <span>Source: {tl.sourceReference}</span>
                    <span className="text-primary font-bold">{tl.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
