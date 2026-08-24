'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { LinkageAnalysis, EvidenceItem, TimelineEvent } from '@/types';
import { formatIsoDate } from '@/utils/formatters';

interface PersonaCardData {
  id: string;
  handle: string;
  platform: string;
  actorName: string;
  firstSeen: string;
  tags: string[];
  pgpKey: string;
  wallet: string;
}

const FALLBACK_PERSONAS: PersonaCardData[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    handle: 'bassterlord_xss',
    platform: 'XSS.is Underground',
    actorName: 'LockBit 3.0 Syndicate',
    firstSeen: '2021-04-12',
    tags: ['Affiliate Core', 'RU/EN'],
    pgpKey: '0x4A72B5C1 (RSA-4096)',
    wallet: 'bc1qxy2kg...0wlh',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    handle: 'basster_rampv2',
    platform: 'Ramp Forum',
    actorName: 'LockBit 3.0 Syndicate',
    firstSeen: '2023-02-01',
    tags: ['Migrated Operator', 'EN/RU'],
    pgpKey: '0x4A72B5C1 (Subkey Matched)',
    wallet: '44AFFq5k...EP3A',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    handle: 'basster_support_tg',
    platform: 'Telegram Security Channel',
    actorName: 'LockBit 3.0 Syndicate',
    firstSeen: '2023-03-10',
    tags: ['Support Channel', 'RU/EN'],
    pgpKey: '0x4A72B5C1 (Direct)',
    wallet: 'bc1q9x32...e829',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    handle: 'pompom_breached',
    platform: 'Breached.vc',
    actorName: 'ShinyHunters Group',
    firstSeen: '2022-05-20',
    tags: ['Data Broker', 'EN'],
    pgpKey: '0x9923BF41',
    wallet: 'bc1qpom8...77a1',
  },
];

const FALLBACK_LINKAGE: LinkageAnalysis = {
  id: 'link-lb-demo',
  sourcePersonaId: 'b0000000-0000-0000-0000-000000000001',
  sourcePersonaHandle: 'bassterlord_xss',
  sourcePersonaPlatform: 'XSS.is Underground',
  targetPersonaId: 'b0000000-0000-0000-0000-000000000002',
  targetPersonaHandle: 'basster_rampv2',
  targetPersonaPlatform: 'Ramp Forum',
  attributionScore: 89.5,
  confidenceLevel: 'VERY_HIGH',
  identifierScore: 33.25, // out of 35
  stylometricScore: 21.75, // out of 25
  behavioralScore: 17.5, // out of 20
  infrastructureScore: 17.0, // out of 20
  aiExplanationSummary:
    'Based on multi-vector algorithmic analysis, there is an 89.50% confidence level (Strong Connection) that @bassterlord_xss and @basster_rampv2 represent the same physical threat actor. The strongest deterministic factor (33.25 / 35.00 pts) stems from an exact cryptographic PGP subkey match (0x4A72B5C1) embedded in escrow announcements. Furthermore, stylometric writing style analysis of dark web forum posts indicates an 87.00% alignment in vocabulary richness, punctuation ratios, and structural greeting formulations. Behavioral profiling reflects identical UTC+3 working hour distributions with active posting windows between 09:00 and 18:00 UTC.',
  analystReviewStatus: 'PENDING_REVIEW',
  evidenceItems: [
    {
      id: 'ev-1',
      factorCategory: 'IDENTIFIER',
      title: 'Cryptographic Subkey Exact Match',
      contributionPoints: 33.25,
      details: 'Identical PGP subkey 0x4A72B5C1 attached to both account profiles.',
      evidenceSnippet: 'pub: 94F8 2B31 8AC4 701E D5E2 1198 4A72 B5C1 09E8 33DF',
      source: 'XSS.is & Ramp Forum PGP Registry',
      sourceReliability: 'Confirmed Cryptographic Proof (High Reliability)',
      observedAt: '2026-08-21T09:15:00Z',
    },
    {
      id: 'ev-2',
      factorCategory: 'STYLOMETRY',
      title: 'Writing Style & Vocabulary Overlap',
      contributionPoints: 21.75,
      details: 'Cosine similarity 0.87 across 12 writing style features (character bigrams, punctuation frequencies).',
      evidenceSnippet: 'Shared signature greeting pattern: "[!] Greetings to the board, regarding payload deployment..."',
      source: 'Cross-Forum Corpus NLP Engine',
      sourceReliability: 'High Statistical Alignment',
      observedAt: '2026-08-22T12:00:00Z',
    },
    {
      id: 'ev-3',
      factorCategory: 'BEHAVIOR',
      title: 'Temporal Posting Window Alignment',
      contributionPoints: 17.5,
      details: '94% diurnal correlation in UTC+3 (Moscow Standard Time) business hours.',
      evidenceSnippet: '88% of forum messages submitted between 09:00 - 18:00 UTC.',
      source: 'Historical Darknet Forum Timestamp Ingestion',
      sourceReliability: 'Consistent Diurnal Match',
      observedAt: '2026-08-22T14:00:00Z',
    },
    {
      id: 'ev-4',
      factorCategory: 'INFRASTRUCTURE',
      title: 'Shared Onion Mirror & Hosting ASN',
      contributionPoints: 17.0,
      details: 'Referenced the same backend Tor mirror co-located on AS200651 Flokinet Ltd.',
      evidenceSnippet: 'http://lockbit7z275w3k3jshv5729fksu627ahskd8276f5skdl27f6sjd8.onion',
      source: 'Tor Infrastructure Passive Scanner',
      sourceReliability: 'Direct Network Co-location',
      observedAt: '2026-08-22T08:00:00Z',
    },
  ],
  computedAt: '2026-08-22T19:00:00Z',
};

const FALLBACK_CHRONOLOGICAL_TIMELINE: TimelineEvent[] = [
  {
    id: 'tl-1',
    personaId: 'b0000000-0000-0000-0000-000000000001',
    personaHandle: 'bassterlord_xss',
    actorCanonicalName: 'LockBit 3.0 Syndicate',
    eventType: 'FORUM_REGISTRATION',
    title: 'Initial Account Created on XSS.is',
    description: 'Persona established handle bassterlord_xss and deposited initial escrow collateral.',
    sourceReference: 'XSS.is Registration Log',
    eventTimestamp: '2022-08-10T00:00:00Z',
    severity: 'INFO',
  },
  {
    id: 'tl-2',
    personaId: 'b0000000-0000-0000-0000-000000000001',
    personaHandle: 'bassterlord_xss',
    actorCanonicalName: 'LockBit 3.0 Syndicate',
    eventType: 'PGP_PUBLICATION',
    title: 'PGP Key Master & Subkey Registered',
    description: 'Published primary PGP key with operational subkey 0x4A72B5C1 for encrypted affiliate negotiations.',
    sourceReference: 'XSS.is Public PGP Keyring',
    eventTimestamp: '2022-11-05T14:30:00Z',
    severity: 'MEDIUM',
  },
  {
    id: 'tl-3',
    personaId: 'b0000000-0000-0000-0000-000000000001',
    personaHandle: 'bassterlord_xss',
    actorCanonicalName: 'LockBit 3.0 Syndicate',
    eventType: 'MIGRATION_ANNOUNCEMENT',
    title: 'Cross-Forum Migration Notice Posted',
    description: 'Advised affiliates that future operations and negotiation channels would transition to Ramp forum.',
    sourceReference: 'XSS.is Pinned Thread #89',
    eventTimestamp: '2026-07-30T10:00:00Z',
    severity: 'HIGH',
  },
  {
    id: 'tl-4',
    personaId: 'b0000000-0000-0000-0000-000000000002',
    personaHandle: 'basster_rampv2',
    actorCanonicalName: 'LockBit 3.0 Syndicate',
    eventType: 'FORUM_REGISTRATION',
    title: 'Ramp Forum Registration with Matching PGP Key',
    description: 'Registered @basster_rampv2 and verified profile using matching subkey 0x4A72B5C1.',
    sourceReference: 'Ramp Forum User Profile #4021',
    eventTimestamp: '2026-08-01T08:15:00Z',
    severity: 'HIGH',
  },
  {
    id: 'tl-5',
    personaId: 'b0000000-0000-0000-0000-000000000002',
    personaHandle: 'basster_rampv2',
    actorCanonicalName: 'LockBit 3.0 Syndicate',
    eventType: 'FORUM_POST',
    title: 'Affiliate Operational Handbook v3 Released',
    description: 'Published identical operational manual text as previously seen on XSS.is.',
    sourceReference: 'Ramp Forum Archive #883',
    eventTimestamp: '2026-08-22T14:00:00Z',
    severity: 'MEDIUM',
  },
];

function LinkageContent() {
  const searchParams = useSearchParams();

  const [sourceId, setSourceId] = useState('b0000000-0000-0000-0000-000000000001');
  const [targetId, setTargetId] = useState('b0000000-0000-0000-0000-000000000002');
  const [analysis, setAnalysis] = useState<LinkageAnalysis>(FALLBACK_LINKAGE);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(FALLBACK_CHRONOLOGICAL_TIMELINE);
  const [isComputing, setIsComputing] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    const src = searchParams.get('source');
    const tgt = searchParams.get('target');
    if (src && src !== sourceId) setSourceId(src);
    if (tgt && tgt !== targetId) setTargetId(tgt);
  }, [searchParams]);

  const runAnalysis = async (src: string, tgt: string) => {
    if (!src || !tgt || src === tgt) return;
    try {
      setIsComputing(true);
      const res = await api.computeLinkage({
        sourcePersonaId: src,
        targetPersonaId: tgt,
        includeAiExplanation: true,
      });
      if (res && typeof res.attributionScore === 'number') {
        setAnalysis(res);
        setIsLiveApi(true);
      } else {
        setAnalysis(FALLBACK_LINKAGE);
        setIsLiveApi(false);
      }
    } catch {
      setAnalysis(FALLBACK_LINKAGE);
      setIsLiveApi(false);
    } finally {
      setIsComputing(false);
    }
  };

  useEffect(() => {
    runAnalysis(sourceId, targetId);
  }, [sourceId, targetId]);

  const sourcePersona: PersonaCardData =
    FALLBACK_PERSONAS.find((p) => p.id === sourceId) || {
      id: sourceId,
      handle: analysis?.sourcePersonaHandle || 'bassterlord_xss',
      platform: analysis?.sourcePersonaPlatform || 'XSS.is Underground',
      actorName: 'LockBit 3.0 Syndicate',
      firstSeen: '2021-04-12',
      tags: ['Affiliate Core', 'RU/EN'],
      pgpKey: '0x4A72B5C1',
      wallet: 'bc1qxy2kg...0wlh',
    };

  const targetPersona: PersonaCardData =
    FALLBACK_PERSONAS.find((p) => p.id === targetId) || {
      id: targetId,
      handle: analysis?.targetPersonaHandle || 'basster_rampv2',
      platform: analysis?.targetPersonaPlatform || 'Ramp Forum',
      actorName: 'LockBit 3.0 Syndicate',
      firstSeen: '2023-02-01',
      tags: ['Migrated Operator', 'EN/RU'],
      pgpKey: '0x4A72B5C1',
      wallet: '44AFFq5k...EP3A',
    };

  const score = typeof analysis?.attributionScore === 'number' ? analysis.attributionScore : 89.5;
  const safeScore = Math.min(100, Math.max(0, isNaN(score) ? 89.5 : score));
  const strokeDashoffset = Math.max(0, 282.7 - (282.7 * safeScore) / 100);

  const identifierScore = analysis?.identifierScore ?? 33.25;
  const stylometricScore = analysis?.stylometricScore ?? 21.75;
  const behavioralScore = analysis?.behavioralScore ?? 17.5;
  const infrastructureScore = analysis?.infrastructureScore ?? 17.0;
  const evidenceList: EvidenceItem[] = analysis?.evidenceItems || FALLBACK_LINKAGE.evidenceItems;

  const isStrongConnection = safeScore >= 75;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-1 font-mono text-xs">
            <span className="tracking-wider text-primary font-bold">
              CONNECTION ANALYSIS
            </span>
            <span className="text-outline">/</span>
            <span className={`font-semibold ${isLiveApi ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isLiveApi ? 'Live Attribution Engine' : 'Reference Case Study'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Cross-Persona Connection Analysis
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 font-sans">
            Evaluating investigative indicators correlating online identities across darknet platforms
          </p>
        </div>

        {/* Persona Selectors Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/60 text-xs font-mono">
            <span className="text-outline font-semibold">Persona A:</span>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="bg-transparent text-tertiary font-bold outline-none cursor-pointer"
            >
              {FALLBACK_PERSONAS.map((p) => (
                <option key={p.id} value={p.id} className="bg-surface-container text-on-surface">
                  @{p.handle} ({p.platform})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/60 text-xs font-mono">
            <span className="text-outline font-semibold">Persona B:</span>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="bg-transparent text-primary font-bold outline-none cursor-pointer"
            >
              {FALLBACK_PERSONAS.map((p) => (
                <option key={p.id} value={p.id} className="bg-surface-container text-on-surface">
                  @{p.handle} ({p.platform})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => runAnalysis(sourceId, targetId)}
            disabled={isComputing}
            className="btn-primary px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isComputing ? 'sync' : 'refresh'}
            </span>
            <span>{isComputing ? 'Analyzing...' : 'Recalculate Connection'}</span>
          </button>
        </div>
      </div>

      {/* 2. Persona A ↕ Persona B & Connection Confidence Hero Card */}
      <div className="card-panel rounded-xl p-6 border-outline-variant/60 bg-surface-container shadow-sm flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Persona A Card */}
          <div className="col-span-12 md:col-span-4 p-5 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-outline uppercase font-bold tracking-wider">
                Persona A
              </span>
              <span className="px-2 py-0.5 rounded bg-tertiary/10 text-tertiary border border-tertiary/30 font-mono text-[10px] font-bold">
                {sourcePersona.platform}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/30 flex items-center justify-center text-tertiary shrink-0">
                <span className="material-symbols-outlined text-[24px]">person</span>
              </div>
              <div>
                <div className="text-base font-bold font-mono text-tertiary">
                  @{sourcePersona.handle}
                </div>
                <div className="text-xs text-outline font-sans">
                  {sourcePersona.actorName}
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-outline-variant/40 font-mono text-[11px] text-outline flex justify-between">
              <span>PGP Subkey:</span>
              <span className="text-on-surface font-semibold">{sourcePersona.pgpKey}</span>
            </div>
          </div>

          {/* ↕ Connection Flow Indicator & Confidence Meter */}
          <div className="col-span-12 md:col-span-4 flex flex-col items-center justify-center text-center px-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/80 flex items-center justify-center text-primary shadow mb-3">
              <span className="material-symbols-outlined text-[22px]">sync_alt</span>
            </div>

            <span className="font-mono text-xs text-outline uppercase tracking-wider font-bold mb-1">
              Connection Confidence
            </span>

            <div className="font-mono text-4xl font-black text-on-surface my-1">
              {safeScore.toFixed(0)}%
            </div>

            <div
              className={`px-3.5 py-1 rounded-full font-mono text-xs font-bold flex items-center gap-1.5 mt-1 ${
                isStrongConnection
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isStrongConnection ? 'verified' : 'help'}
              </span>
              <span>{isStrongConnection ? 'STRONG CONNECTION' : 'MODERATE CONNECTION'}</span>
            </div>
          </div>

          {/* Persona B Card */}
          <div className="col-span-12 md:col-span-4 p-5 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-outline uppercase font-bold tracking-wider">
                Persona B
              </span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-mono text-[10px] font-bold">
                {targetPersona.platform}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">person_check</span>
              </div>
              <div>
                <div className="text-base font-bold font-mono text-primary">
                  @{targetPersona.handle}
                </div>
                <div className="text-xs text-outline font-sans">
                  {targetPersona.actorName}
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-outline-variant/40 font-mono text-[11px] text-outline flex justify-between">
              <span>PGP Subkey:</span>
              <span className="text-on-surface font-semibold">{targetPersona.pgpKey}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Why do we see this connection? (4 Plain-English Factor Cards) */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="font-mono text-sm font-bold text-on-surface uppercase tracking-wider">
            Why do we see this connection?
          </h2>
          <p className="text-xs text-outline mt-0.5">
            Breakdown of core investigative signals comparing Persona A and Persona B
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Factor 1 */}
          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Identity / Username Match</span>
              </div>
              <span className="font-mono text-xs font-bold text-on-surface">
                {Number(identifierScore).toFixed(1)} / 35
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
              Shared cryptographic PGP subkeys, cryptocurrency deposit addresses, and matching handles.
            </p>
          </div>

          {/* Factor 2 */}
          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Writing Style Match</span>
              </div>
              <span className="font-mono text-xs font-bold text-on-surface">
                {Number(stylometricScore).toFixed(1)} / 25
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
              Aligned vocabulary richness, sentence structure, punctuation habits, and Russian/English syntax.
            </p>
          </div>

          {/* Factor 3 */}
          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Activity Pattern Match</span>
              </div>
              <span className="font-mono text-xs font-bold text-on-surface">
                {Number(behavioralScore).toFixed(1)} / 20
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
              Coinciding UTC+3 business hour distributions and active darknet posting schedules.
            </p>
          </div>

          {/* Factor 4 */}
          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Technical Connection</span>
              </div>
              <span className="font-mono text-xs font-bold text-on-surface">
                {Number(infrastructureScore).toFixed(1)} / 20
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
              Shared hosting infrastructure, Tor Onion v3 service mirrors, and backend network hosts.
            </p>
          </div>
        </div>
      </div>

      {/* 4. AI Investigation Summary */}
      <div className="card-panel rounded-xl p-5 border-primary/40 bg-surface-container shadow-sm flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
            <div>
              <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                AI Investigation Summary
              </h3>
              <span className="text-[10px] font-mono text-primary font-semibold">
                Synthesized Cross-Platform Analysis
              </span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-[10px] text-outline font-semibold">
            Automated Synthesis
          </span>
        </div>

        {/* Real Backend Gemini Explanation */}
        <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/40">
          <p className="text-xs text-on-surface-variant leading-relaxed font-sans">
            {analysis?.aiExplanationSummary || FALLBACK_LINKAGE.aiExplanationSummary}
          </p>
        </div>

        {/* Required Disclaimer */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-outline/90 bg-surface-container-lowest px-3 py-2 rounded-lg border border-outline-variant/30">
          <span className="material-symbols-outlined text-[15px] text-amber-400 shrink-0">
            info
          </span>
          <span>AI-generated summary. Review the supporting evidence before drawing conclusions.</span>
        </div>

        {/* Expandable Advanced AI Details */}
        <details className="pt-2 border-t border-outline-variant/30 text-[11px] font-mono text-outline cursor-pointer">
          <summary className="hover:text-primary font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
            <span>Advanced AI Details</span>
          </summary>
          <div className="mt-2 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/40 space-y-1.5 text-[10px] text-on-surface-variant">
            <div className="flex justify-between">
              <span className="text-outline">Synthesis Status:</span>
              <span className="text-emerald-400 font-semibold">Complete</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Reasoning Signals:</span>
              <span className="text-primary font-semibold">4 Factors Correlated (Identity, Writing Style, Activity, Technical)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Forensic Confidence Base:</span>
              <span className="text-on-surface font-semibold">{safeScore.toFixed(2)} / 100.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Execution Context:</span>
              <span className="text-on-surface">Deterministic Multi-Signal Cross-Forum Synthesis</span>
            </div>
          </div>
        </details>
      </div>

      {/* 5. Supporting Evidence Cards */}
      <div className="card-panel rounded-xl p-5 border-outline-variant/60 bg-surface-container shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3">
          <div>
            <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
              Supporting Evidence
            </h3>
            <p className="text-xs text-outline mt-0.5">
              Forensic evidence and observations contributing to this connection
            </p>
          </div>
          <span className="text-xs text-primary font-mono font-bold bg-primary/10 px-2.5 py-1 rounded border border-primary/30">
            TOTAL SCORE: {safeScore.toFixed(2)} / 100.00
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidenceList.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/50 text-primary font-bold text-[10px]">
                  {item.factorCategory}
                </span>
                <span className="text-emerald-400 font-bold">
                  +{Number(item.contributionPoints ?? 0).toFixed(2)} pts
                </span>
              </div>

              <div>
                <h4 className="font-bold text-on-surface text-xs">{item.title}</h4>
                <p className="text-xs text-outline mt-0.5 font-sans leading-relaxed">{item.details}</p>
              </div>

              {item.evidenceSnippet && (
                <div className="text-[11px] font-mono text-tertiary bg-surface-container-lowest p-2.5 rounded border border-outline-variant/40 break-all select-all">
                  {item.evidenceSnippet}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-[10px] font-mono text-outline">
                <span>Reliability: {item.sourceReliability || 'Verified Sensor'}</span>
                <span>{formatIsoDate(item.observedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Chronological Timeline */}
      <div className="card-panel rounded-xl p-5 border-outline-variant/60 bg-surface-container shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
            Chronological Timeline
          </h3>
          <p className="text-xs text-outline mt-0.5">
            Sequential cross-platform activity, key announcements, and migration events
          </p>
        </div>

        <div className="space-y-3">
          {timelineEvents.map((tl) => (
            <div
              key={tl.id}
              className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-tertiary font-bold">@{tl.personaHandle}</span>
                <span className="text-outline">{formatIsoDate(tl.eventTimestamp)}</span>
              </div>
              <div className="font-bold text-on-surface text-xs font-sans">{tl.title}</div>
              <p className="text-xs text-on-surface-variant leading-relaxed font-sans">{tl.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-[11px] font-mono text-outline">
                <span>Source: {tl.sourceReference}</span>
                <span className="text-primary font-bold">{tl.severity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Expandable Section: Advanced Analysis Details */}
      <details className="card-panel rounded-xl p-5 border-outline-variant/60 bg-surface-container shadow-sm cursor-pointer">
        <summary className="font-mono text-xs font-bold text-primary uppercase tracking-wider hover:underline flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span>Advanced Analysis Details &amp; Technical Scoring Model</span>
        </summary>

        <div className="mt-4 pt-4 border-t border-outline-variant/40 space-y-4 font-mono text-xs">
          <div>
            <h4 className="text-on-surface font-bold mb-2">Multi-Factor Weighting Model</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40">
                <div className="text-outline text-[11px]">Factor 1</div>
                <div className="text-on-surface font-bold mt-0.5">Identifier Similarity</div>
                <div className="text-tertiary font-bold text-sm mt-1">35% Weight</div>
                <div className="text-[10px] text-outline mt-1">Points: {Number(identifierScore).toFixed(2)} / 35.00</div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40">
                <div className="text-outline text-[11px]">Factor 2</div>
                <div className="text-on-surface font-bold mt-0.5">Stylometric Similarity</div>
                <div className="text-primary font-bold text-sm mt-1">25% Weight</div>
                <div className="text-[10px] text-outline mt-1">Points: {Number(stylometricScore).toFixed(2)} / 25.00</div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40">
                <div className="text-outline text-[11px]">Factor 3</div>
                <div className="text-on-surface font-bold mt-0.5">Behavioral Similarity</div>
                <div className="text-amber-400 font-bold text-sm mt-1">20% Weight</div>
                <div className="text-[10px] text-outline mt-1">Points: {Number(behavioralScore).toFixed(2)} / 20.00</div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40">
                <div className="text-outline text-[11px]">Factor 4</div>
                <div className="text-on-surface font-bold mt-0.5">Infrastructure Similarity</div>
                <div className="text-cyan-400 font-bold text-sm mt-1">20% Weight</div>
                <div className="text-[10px] text-outline mt-1">Points: {Number(infrastructureScore).toFixed(2)} / 20.00</div>
              </div>
            </div>
          </div>

          {/* Analytical Indicator Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1 font-sans text-xs leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 font-mono text-amber-300">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>Important Analytical Disclaimer</span>
            </div>
            <p>
              Connection Confidence and factor similarity scores are mathematical and forensic analytical indicators intended to guide threat intelligence workflows. They represent probabilistic correlations and do not constitute definitive legal proof of physical identity without independent corroborating evidence.
            </p>
          </div>

          <div className="text-[11px] text-outline space-y-1 pt-1">
            <div>Linkage UUID: {analysis?.id || 'link-lb-demo'}</div>
            <div>Source Persona ID: {sourceId}</div>
            <div>Target Persona ID: {targetId}</div>
            <div>Evaluation Timestamp: {analysis?.computedAt || new Date().toISOString()}</div>
          </div>
        </div>
      </details>
    </div>
  );
}

export default function LinkagePage() {
  return (
    <Suspense
      fallback={
        <div className="card-panel p-12 text-center text-xs font-mono text-outline">
          Loading Connection Analysis...
        </div>
      }
    >
      <LinkageContent />
    </Suspense>
  );
}
