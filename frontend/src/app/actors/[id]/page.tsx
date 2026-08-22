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
  primaryMotive: 'FINANCIAL',
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
      type: 'BTC Wallet',
      value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      metadata: '{"tx_count": 48, "total_received_btc": 28.45}',
      isVerified: true,
      firstSeenAt: '2023-10-12T00:00:00Z',
    },
    {
      id: 'id2',
      type: 'XMR Wallet',
      value: '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
      metadata: '{"currency": "XMR", "escrow_type": "Primary"}',
      isVerified: true,
      firstSeenAt: '2023-09-28T00:00:00Z',
    },
    {
      id: 'id3',
      type: 'PGP Key',
      value: '0x8B9C7A14F2D3E566 (Subkey: 0x4A72B5C1)',
      metadata: '{"algorithm": "RSA-4096", "verified": true}',
      isVerified: true,
      firstSeenAt: '2022-11-05T00:00:00Z',
    },
    {
      id: 'id4',
      type: 'Tox ID',
      value: '5A6C7B8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D',
      metadata: '{"client": "qTox"}',
      isVerified: true,
      firstSeenAt: '2023-08-14T00:00:00Z',
    },
  ],
  infrastructure: [
    {
      id: 'inf1',
      type: 'ONION_V3',
      value: 'http://lockbit7z275w3k3jshv5729fksu627ahskd8276f5skdl27f6sjd8.onion',
      ipAddress: '185.220.101.44',
      asn: 'AS200651 Flokinet Ltd',
      sslCertFingerprint: 'SHA256:7B8F21A49C03E84729B1238479A1F4C5E6D7B8A9',
      isLive: true,
      lastScannedAt: '2026-08-22T08:00:00Z',
    },
    {
      id: 'inf2',
      type: 'CLEARSIGNAL_MIRROR',
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
  const router = useRouter();
  const actorId = params.id as string;

  const [actor, setActor] = useState<ActorDetail>(FALLBACK_ACTOR_DETAIL);
  const [activeTab, setActiveTab] = useState<'IDENTIFIERS' | 'INFRASTRUCTURE' | 'PERSONAS' | 'TIMELINE'>('IDENTIFIERS');
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

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Header (Exact Stitch Card-Level-1) */}
      <div className="card-panel rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-outline-variant bg-surface-container">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded bg-surface-container-high border border-outline flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[32px] text-rose-400">warning</span>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display-lg text-display-lg font-bold text-on-surface m-0 leading-none">
                {actor.canonicalName}
              </h1>
              <span className="bg-surface-container-highest border border-outline-variant px-2 py-1 rounded text-outline font-label-caps text-[10px]">
                {actor.threatCategory}
              </span>
            </div>
            <div className="text-outline font-body-sm text-body-sm flex items-center gap-2">
              <span>ID: ACT-{actor.id.slice(0, 8).toUpperCase()}</span>
              <span>•</span>
              <span>
                First Seen: {formatIsoDate(actor.firstObservedAt)}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Status: {actor.status}</span>
              <span>•</span>
              <span className="text-primary font-mono text-[11px]">
                {isLiveApi ? 'SUPABASE LIVE' : 'DEMO CACHE'}
              </span>
            </div>
          </div>
        </div>

        {/* Attribution Confidence Meter & Actions */}
        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex flex-col items-end">
              <span className="font-label-caps text-label-caps text-outline mb-1 uppercase">
                ATTRIBUTION CONFIDENCE
              </span>
              <div className="flex items-center gap-2">
                <span className="font-data-mono text-data-mono text-on-surface font-bold">
                  {actor.overallConfidenceScore.toFixed(0)}%
                </span>
                <div className="w-24 h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${actor.overallConfidenceScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <Link
              href={
                actor.personas.length >= 2
                  ? `/linkage?source=${actor.personas[0].id}&target=${actor.personas[1].id}`
                  : `/linkage`
              }
              className="btn-primary h-9 px-4 rounded font-label-caps text-label-caps flex items-center gap-2 text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>Investigate Personas</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout (Exact Stitch Bento) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (Wide, 8 Cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Identifiers & Infrastructure Tabbed Panel */}
          <div className="card-panel rounded-lg flex flex-col min-h-[380px] border-outline-variant bg-surface-container">
            {/* Tabs Header */}
            <div className="border-b border-outline-variant px-4 py-3 flex gap-6">
              <button
                onClick={() => setActiveTab('IDENTIFIERS')}
                className={`font-label-caps text-label-caps pb-3 -mb-[13px] cursor-pointer transition-colors ${
                  activeTab === 'IDENTIFIERS'
                    ? 'text-primary border-b-2 border-primary font-bold'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                IDENTIFIERS ({actor.identifiers.length})
              </button>
              <button
                onClick={() => setActiveTab('INFRASTRUCTURE')}
                className={`font-label-caps text-label-caps pb-3 -mb-[13px] cursor-pointer transition-colors ${
                  activeTab === 'INFRASTRUCTURE'
                    ? 'text-primary border-b-2 border-primary font-bold'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                INFRASTRUCTURE ({actor.infrastructure.length})
              </button>
              <button
                onClick={() => setActiveTab('TIMELINE')}
                className={`font-label-caps text-label-caps pb-3 -mb-[13px] cursor-pointer transition-colors ${
                  activeTab === 'TIMELINE'
                    ? 'text-primary border-b-2 border-primary font-bold'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                ACTIVITY STREAM ({actor.recentTimeline.length})
              </button>
            </div>

            {/* Tab 1: Identifiers Table */}
            {activeTab === 'IDENTIFIERS' && (
              <div className="flex-1 overflow-auto p-4">
                <table className="w-full text-left border-collapse font-body-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low">
                      <th className="font-label-caps text-label-caps text-outline py-2 px-3">TYPE</th>
                      <th className="font-label-caps text-label-caps text-outline py-2 px-3">VALUE</th>
                      <th className="font-label-caps text-label-caps text-outline py-2 px-3">SEEN</th>
                      <th className="font-label-caps text-label-caps text-outline py-2 px-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="font-data-mono text-data-mono divide-y divide-outline-variant/30">
                    {actor.identifiers.map((id) => (
                      <tr key={id.id} className="interactive-row">
                        <td className="py-3 px-3 text-on-surface font-semibold">{id.type}</td>
                        <td className="py-3 px-3 text-tertiary break-all">{id.value}</td>
                        <td className="py-3 px-3 text-outline text-[12px] whitespace-nowrap">
                          {formatIsoDate(id.firstSeenAt)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            onClick={() => navigator.clipboard.writeText(id.value)}
                            title="Copy Indicator"
                            className="material-symbols-outlined text-[16px] text-outline cursor-pointer hover:text-primary"
                          >
                            content_copy
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Infrastructure Table */}
            {activeTab === 'INFRASTRUCTURE' && (
              <div className="flex-1 overflow-auto p-4">
                <table className="w-full text-left border-collapse font-body-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low">
                      <th className="font-label-caps text-label-caps text-outline py-2 px-3">TYPE</th>
                      <th className="font-label-caps text-label-caps text-outline py-2 px-3">HOST / ONION</th>
                      <th className="font-label-caps text-label-caps text-outline py-2 px-3">BACKEND IP / ASN</th>
                      <th className="font-label-caps text-label-caps text-outline py-2 px-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="font-data-mono text-data-mono divide-y divide-outline-variant/30">
                    {actor.infrastructure.map((inf) => (
                      <tr key={inf.id} className="interactive-row">
                        <td className="py-3 px-3 text-on-surface font-semibold">{inf.type}</td>
                        <td className="py-3 px-3 text-primary break-all">{inf.value}</td>
                        <td className="py-3 px-3 text-outline text-[12px]">
                          <div>{inf.ipAddress || 'Hidden Tor Service'}</div>
                          <div className="text-[10px] text-on-surface-variant">{inf.asn || 'AS200651'}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-label-caps ${
                              inf.isLive
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {inf.isLive ? 'ONLINE' : 'OFFLINE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Timeline Activity */}
            {activeTab === 'TIMELINE' && (
              <div className="flex-1 overflow-auto p-4 space-y-3 font-body-sm">
                {actor.recentTimeline.map((tl) => (
                  <div
                    key={tl.id}
                    className="p-3 rounded bg-surface-container-low border border-outline-variant/50 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between font-data-mono text-[11px]">
                      <span className="text-tertiary">@{tl.personaHandle}</span>
                      <span className="text-outline">
                        {formatIsoDate(tl.eventTimestamp)}
                      </span>
                    </div>
                    <div className="font-semibold text-on-surface text-[12px]">{tl.title}</div>
                    <p className="text-outline text-[11px]">{tl.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Associated Personas (Stitch Cards) */}
          <div className="card-panel rounded-lg flex flex-col p-5 border-outline-variant bg-surface-container">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-title-sm text-title-sm font-bold text-on-surface">
                Associated Forum Personas
              </h3>
              <Link
                href={`/graph/${actor.id}`}
                className="text-primary hover:text-primary-fixed transition-colors font-label-caps text-label-caps flex items-center gap-1"
              >
                <span>VIEW TOPOLOGICAL GRAPH</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actor.personas.map((p) => (
                <div
                  key={p.id}
                  className="bg-surface-dim border border-outline-variant rounded-lg p-4 flex flex-col gap-3 hover:bg-surface-variant transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div>
                        <div className="font-bold text-on-surface text-body-md font-mono text-tertiary">
                          @{p.handle}
                        </div>
                        <div className="text-outline text-[11px] font-label-caps">{p.platform}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-primary border border-outline-variant font-label-caps text-[9px]">
                      {p.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-label-caps text-[11px] text-outline pt-2 border-t border-outline-variant/40">
                    <span>Reputation: {p.reputationScore}%</span>
                    <span>{p.activityTimezoneEstimated || 'UTC+3 (MSK)'}</span>
                  </div>

                  <Link
                    href={`/linkage?source=${p.id}`}
                    className="btn-secondary w-full justify-center py-1.5 text-xs font-label-caps mt-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">psychology</span>
                    <span>Cross-Attribution AI Linkage</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): Summary & Quick Actions */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Actor Intelligence Summary */}
          <div className="card-panel rounded-lg p-5 flex flex-col gap-3 border-outline-variant bg-surface-container">
            <h3 className="font-label-caps text-label-caps font-bold text-on-surface uppercase border-b border-outline-variant pb-2">
              Intelligence Dossier Brief
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              {actor.summary}
            </p>
            <div className="pt-3 border-t border-outline-variant flex flex-col gap-2 font-label-caps text-[11px]">
              <div className="flex justify-between">
                <span className="text-outline">OPERATIONAL MOTIVE:</span>
                <span className="text-primary font-bold">{actor.primaryMotive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">LINKED PERSONAS:</span>
                <span className="text-tertiary font-bold">{actor.personas.length} Handles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">IOC COUNT:</span>
                <span className="text-on-surface font-bold">
                  {actor.identifiers.length + actor.infrastructure.length} Indicators
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="card-panel rounded-lg p-5 flex flex-col gap-3 border-outline-variant bg-surface-container">
            <h3 className="font-label-caps text-label-caps font-bold text-on-surface uppercase border-b border-outline-variant pb-2">
              Forensic Navigation
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href={`/graph/${actor.id}`}
                className="btn-secondary w-full justify-between px-3 py-2 text-xs font-label-caps"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">hub</span>
                  <span>Topological Graph</span>
                </div>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
              <Link
                href={`/timeline/${actor.id}`}
                className="btn-secondary w-full justify-between px-3 py-2 text-xs font-label-caps"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">timeline</span>
                  <span>Chronological Stream</span>
                </div>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
              <Link
                href={`/export?actorId=${actor.id}`}
                className="btn-primary w-full justify-between px-3 py-2 text-xs font-label-caps"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Export Dossier (PDF/STIX)</span>
                </div>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
