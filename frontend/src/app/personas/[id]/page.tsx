'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { PersonaDetail } from '@/types';
import { formatIsoDate } from '@/utils/formatters';

const FALLBACK_PERSONA_DETAIL: PersonaDetail = {
  id: 'b0000000-0000-0000-0000-000000000001',
  actorId: '2bee3f4c-1923-40da-a2e9-78b9a1e9eb79',
  actorCanonicalName: 'LockBit 3.0 Syndicate',
  handle: 'bassterlord_xss',
  platform: 'XSS.is Underground',
  reputationScore: 98.5,
  status: 'MIGRATED',
  activityTimezoneEstimated: 'UTC+3 (Moscow Standard Time)',
  firstSeenAt: '2022-08-10T00:00:00Z',
  lastSeenAt: '2026-07-30T00:00:00Z',
  identifiers: [
    {
      id: 'id1',
      type: 'Bitcoin Deposit Wallet',
      value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      metadata: '{"tx_count": 48, "total_received_btc": 28.45}',
      isVerified: true,
      firstSeenAt: '2023-10-12T00:00:00Z',
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
  ],
  stylometricSamples: [
    {
      id: 's1',
      sampleTitle: 'XSS Affiliate Guide Posting',
      rawText: 'Affiliate manual updated for RaaS operators with 80/20 revenue split.',
      tokenCount: 420,
      lexicalMetrics: '{"avg_sentence_len": 18.2, "ttr": 0.68, "cyrillic_leakage": true}',
      collectedAt: '2026-08-22T14:00:00Z',
    },
  ],
  timelineEvents: [
    {
      id: 'tl1',
      personaId: 'b0000000-0000-0000-0000-000000000001',
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
      personaId: 'b0000000-0000-0000-0000-000000000001',
      personaHandle: 'bassterlord_xss',
      actorCanonicalName: 'LockBit 3.0 Syndicate',
      eventType: 'PERSONA_MIGRATION',
      title: 'Migration Announcement to Alternative Darknet Boards',
      description: 'Announced transition to secondary boards while retaining PGP key subkey 0x4A72B5C1 for verification.',
      sourceReference: 'XSS.is Announcement Thread',
      eventTimestamp: '2026-07-30T10:00:00Z',
      severity: 'HIGH',
    },
  ],
};

export default function PersonaDetailPage() {
  const params = useParams();
  const personaId = params.id as string;

  const [persona, setPersona] = useState<PersonaDetail>(FALLBACK_PERSONA_DETAIL);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CONNECTIONS' | 'EVIDENCE' | 'TIMELINE'>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    async function loadPersona() {
      if (!personaId) return;
      try {
        setIsLoading(true);
        const data = await api.getPersona(personaId);
        if (data && data.handle) {
          setPersona(data);
          setIsLiveApi(true);
        } else {
          setPersona(FALLBACK_PERSONA_DETAIL);
          setIsLiveApi(false);
        }
      } catch (err) {
        console.warn('Backend persona API offline, using fallback investigation profile:', err);
        setPersona(FALLBACK_PERSONA_DETAIL);
        setIsLiveApi(false);
      } finally {
        setIsLoading(false);
      }
    }
    loadPersona();
  }, [personaId]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Identity Header */}
      <div className="card-panel rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-outline-variant/60 bg-surface-container shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[32px]">person</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-bold font-mono text-tertiary m-0 leading-tight">
                @{persona.handle}
              </h1>
              <span className="bg-primary/15 border border-primary/30 text-primary px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase">
                {persona.platform}
              </span>
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded font-mono text-[10px] font-semibold">
                Status: {persona.status}
              </span>
            </div>

            <div className="text-outline font-mono text-xs flex flex-wrap items-center gap-2 mb-2">
              <span className="text-on-surface font-semibold">
                Threat Syndicate: {persona.actorCanonicalName || 'LockBit 3.0 Syndicate'}
              </span>
              <span>•</span>
              <span>First Seen: {formatIsoDate(persona.firstSeenAt)}</span>
              <span>•</span>
              <span>Last Seen: {formatIsoDate(persona.lastSeenAt)}</span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed max-w-3xl font-sans">
              Key operational cybercrime handle active on darknet forums. Conducts RaaS affiliate recruitment and extortion negotiations using verified cryptographic PGP subkeys.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-end gap-2.5 w-full md:w-auto shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-outline font-semibold">Reputation Score:</span>
            <span className="font-mono text-sm font-bold text-primary">
              {persona.reputationScore.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Link
              href={`/linkage?source=${persona.id}`}
              className="btn-primary px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>Analyze Connections</span>
            </Link>
            {persona.actorId && (
              <Link
                href={`/actors/${persona.actorId}`}
                className="btn-secondary px-3.5 py-2 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">shield</span>
                <span>Parent Syndicate</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-outline uppercase font-bold tracking-wider">
            Primary Platform
          </span>
          <span className="text-xs font-bold text-on-surface font-mono truncate">
            {persona.platform}
          </span>
          <span className="text-[10px] text-outline">Darknet underground board</span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-outline uppercase font-bold tracking-wider">
            Active Hours
          </span>
          <span className="text-xs font-bold text-amber-400 font-mono">
            {persona.activityTimezoneEstimated || 'UTC+3 (Business Hours)'}
          </span>
          <span className="text-[10px] text-outline">Estimated diurnal schedule</span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-outline uppercase font-bold tracking-wider">
            Syndicate Link
          </span>
          <span className="text-xs font-bold text-rose-400 font-mono truncate">
            {persona.actorCanonicalName || 'LockBit 3.0 Syndicate'}
          </span>
          <span className="text-[10px] text-outline">Parent threat actor</span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-outline uppercase font-bold tracking-wider">
            Connection Confidence
          </span>
          <span className="text-xs font-bold text-emerald-400 font-mono">
            Strong Connection (89.5%)
          </span>
          <span className="text-[10px] text-outline">Correlated with @basster_rampv2</span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-outline uppercase font-bold tracking-wider">
            Tracked Identifiers
          </span>
          <span className="text-xs font-bold text-purple-400 font-mono">
            {persona.identifiers.length} Identifiers Monitored
          </span>
          <span className="text-[10px] text-outline">Wallets, PGP, and contacts</span>
        </div>
      </div>

      {/* 3. Investigation Tabs */}
      <div className="card-panel rounded-xl flex flex-col border-outline-variant/60 bg-surface-container shadow-sm min-h-[460px]">
        {/* Tab Headers */}
        <div className="border-b border-outline-variant/40 px-6 py-3.5 flex gap-8 font-mono text-xs font-semibold overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'OVERVIEW' },
            { id: 'CONNECTIONS', label: 'CONNECTIONS (1)' },
            { id: 'EVIDENCE', label: `EVIDENCE (${persona.identifiers.length + persona.infrastructure.length})` },
            { id: 'TIMELINE', label: `TIMELINE & ACTIVITY (${persona.timelineEvents.length})` },
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
              <div className="flex flex-col gap-4">
                <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                  Persona Profile &amp; Modus Operandi
                </h3>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2 text-xs text-on-surface-variant leading-relaxed font-sans">
                  <p>
                    <strong className="text-tertiary font-mono">@{persona.handle}</strong> operates on{' '}
                    <span className="text-primary font-bold">{persona.platform}</span>. The persona has established high forum reputation through verified escrow dealings and technical manual distribution.
                  </p>
                  <p>
                    Writing style analysis confirms consistent Russian/English phrasing patterns, punctuation habits, and greeting structures matching affiliated threat handles.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                  Operational Parameters
                </h3>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 font-mono text-xs space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-outline">Active Schedule:</span>
                    <span className="text-on-surface font-bold">{persona.activityTimezoneEstimated || 'UTC+3 (MSK)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Forum Reputation:</span>
                    <span className="text-emerald-400 font-bold">{persona.reputationScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Monitored Indicators:</span>
                    <span className="text-on-surface font-bold">{persona.identifiers.length} Items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Associated Syndicate:</span>
                    <span className="text-primary font-bold">{persona.actorCanonicalName || 'LockBit 3.0'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CONNECTIONS */}
        {activeTab === 'CONNECTIONS' && (
          <div className="p-6 flex flex-col gap-4">
            <div>
              <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                Correlated Identities &amp; Connections
              </h3>
              <p className="text-xs text-outline mt-0.5">
                Evaluated relationships supported by multiple forensic signals
              </p>
            </div>

            <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">link</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-tertiary">
                      @{persona.handle}
                    </span>
                    <span className="material-symbols-outlined text-outline text-[16px]">sync_alt</span>
                    <span className="font-mono text-sm font-bold text-primary">
                      @basster_rampv2
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
                    Identical cryptographic PGP subkey (0x4A72B5C1) and matching Russian/English syntax on Ramp forum.
                  </p>
                  <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-outline">
                    <span className="text-emerald-400 font-bold">4 Supporting Evidence Items</span>
                    <span>•</span>
                    <span>Platform: Ramp Forum</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2 w-full md:w-auto shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-outline">Connection Confidence:</span>
                  <span className="font-mono text-base font-bold text-emerald-400">89.5%</span>
                </div>
                <Link
                  href={`/linkage?source=${persona.id}`}
                  className="btn-primary px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm"
                >
                  Inspect Connection Analysis →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: EVIDENCE */}
        {activeTab === 'EVIDENCE' && (
          <div className="p-6 flex flex-col gap-6">
            <div>
              <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                Supporting Evidence &amp; Observed Indicators
              </h3>
              <p className="text-xs text-outline mt-0.5">
                Plain-English breakdown of verified forensic signals and financial deposit wallets
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment & Wallets */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-tertiary font-mono text-xs font-bold">
                  <span className="material-symbols-outlined text-[18px]">currency_bitcoin</span>
                  <span>Payment &amp; Financial Wallets</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  {persona.identifiers
                    .filter((id) => id.type.includes('Wallet') || id.type.includes('Deposit'))
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
                  <span>Cryptographic Keys &amp; Contacts</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  {persona.identifiers
                    .filter((id) => !id.type.includes('Wallet') && !id.type.includes('Deposit'))
                    .map((id) => (
                      <div key={id.id} className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30">
                        <div className="text-outline text-[11px] uppercase font-semibold">{id.type}</div>
                        <div className="text-primary select-all break-all mt-0.5 font-bold">{id.value}</div>
                        <div className="text-[10px] text-outline mt-1">First Seen: {formatIsoDate(id.firstSeenAt)}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Advanced Details Toggle */}
            <details className="pt-2 border-t border-outline-variant/40 text-[11px] font-mono text-outline cursor-pointer">
              <summary className="font-semibold text-primary hover:underline">
                Advanced Details &amp; Technical Metadata
              </summary>
              <div className="mt-2.5 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/40 space-y-2 text-[11px] font-mono text-on-surface-variant">
                <div>Persona UUID: {persona.id}</div>
                <div>Parent Actor UUID: {persona.actorId}</div>
                <div>Reputation Metric: {persona.reputationScore.toFixed(4)}</div>
                {persona.stylometricSamples.map((sample) => (
                  <div key={sample.id} className="truncate">
                    Lexical Metrics: {sample.lexicalMetrics || 'N/A'} (Tokens: {sample.tokenCount})
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Tab 4: TIMELINE */}
        {activeTab === 'TIMELINE' && (
          <div className="p-6 flex flex-col gap-4">
            <div>
              <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                Chronological Activity Stream
              </h3>
              <p className="text-xs text-outline mt-0.5">
                Timeline of observed forum postings and account announcements
              </p>
            </div>

            <div className="space-y-3">
              {persona.timelineEvents.map((tl) => (
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
