'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { LinkageAnalysis, EvidenceItem } from '@/types';
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
    'Based on multi-vector algorithmic analysis, there is an 89.50% confidence level (High-Confidence Linkage) that @bassterlord_xss and @basster_rampv2 represent the same physical threat actor. The strongest deterministic factor (33.25 / 35.00 pts) stems from an exact cryptographic PGP subkey match (0x4A72B5C1) embedded in escrow announcements. Furthermore, stylometric analysis of dark web forum posts indicates an 87.00% alignment in vocabulary richness, punctuation ratios, and structural greeting formulations. Behavioral profiling reflects identical UTC+3 working hour distributions with active posting windows between 09:00 and 18:00 UTC.',
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
      sourceReliability: 'A (Confirmed Cryptographic Proof)',
      observedAt: '2026-08-21T09:15:00Z',
    },
    {
      id: 'ev-2',
      factorCategory: 'STYLOMETRY',
      title: 'Writing Style & Vocabulary Overlap',
      contributionPoints: 21.75,
      details: 'Cosine similarity 0.87 across 12 stylometric features (character bigrams, punctuation frequencies).',
      evidenceSnippet: 'Shared signature greeting pattern: "[!] Greetings to the board, regarding payload deployment..."',
      source: 'Cross-Forum Corpus NLP Engine',
      sourceReliability: 'B (High Algorithmic Confidence)',
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
      sourceReliability: 'B (High)',
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
      sourceReliability: 'B (High)',
      observedAt: '2026-08-22T08:00:00Z',
    },
  ],
  computedAt: '2026-08-22T19:00:00Z',
};

function LinkageContent() {
  const searchParams = useSearchParams();

  // Deterministic default initial state for SSR / Hydration alignment
  const [sourceId, setSourceId] = useState('b0000000-0000-0000-0000-000000000001');
  const [targetId, setTargetId] = useState('b0000000-0000-0000-0000-000000000002');
  const [analysis, setAnalysis] = useState<LinkageAnalysis>(FALLBACK_LINKAGE);
  const [isComputing, setIsComputing] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);

  // Sync with searchParams after initial hydration
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
      handle: analysis?.sourcePersonaHandle || 'source_persona',
      platform: analysis?.sourcePersonaPlatform || 'Darknet Forum',
      actorName: 'LockBit 3.0 Syndicate',
      firstSeen: '2021-04-12',
      tags: ['Affiliate Core', 'RU/EN'],
      pgpKey: '0x4A72B5C1',
      wallet: 'bc1qxy2kg...0wlh',
    };

  const targetPersona: PersonaCardData =
    FALLBACK_PERSONAS.find((p) => p.id === targetId) || {
      id: targetId,
      handle: analysis?.targetPersonaHandle || 'target_persona',
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section (Exact Stitch AI Linkage Header) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-1 font-label-caps text-xs">
            <span className="tracking-widest text-primary font-bold">
              AI LINKAGE ANALYSIS
            </span>
            <span className="text-outline-variant">/</span>
            <span className="font-data-mono">INV-2026-884A</span>
            <span className="text-outline-variant">/</span>
            <span className={`font-data-mono text-[11px] font-bold ${isLiveApi ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isLiveApi ? 'SPRING BOOT DETERMINISTIC ENGINE' : 'DEMO ANALYSIS (SYNTHETIC)'}
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg font-bold text-on-surface tracking-tight">
            Persona Resolution Assessment
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1.5 max-w-2xl">
            Algorithmic 4-factor attribution matrix evaluating the mathematical probability that{' '}
            <strong className="text-tertiary">@{sourcePersona.handle}</strong> and{' '}
            <strong className="text-primary">@{targetPersona.handle}</strong> represent the same physical
            threat actor.
          </p>
        </div>

        {/* Persona Selector Toolbar & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Source Persona Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded border border-outline-variant text-xs font-label-caps">
            <span className="text-outline">SRC:</span>
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

          {/* Target Persona Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded border border-outline-variant text-xs font-label-caps">
            <span className="text-outline">TGT:</span>
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

          <Link
            href="/export"
            className="btn-secondary px-3.5 py-2 rounded text-body-sm font-body-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Report</span>
          </Link>

          <button
            onClick={() => runAnalysis(sourceId, targetId)}
            disabled={isComputing}
            className="btn-primary px-4 py-2 rounded text-body-sm font-body-sm font-semibold flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isComputing ? 'sync' : 'refresh'}
            </span>
            <span>{isComputing ? 'Computing...' : 'Re-Run Matrix'}</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout (Exact Stitch Bento) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Confidence Gauge Widget (Col Span 4) */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Abstract Radial Glow */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% -20%, #4d8eff 0%, transparent 70%)',
            }}
          ></div>

          <div className="font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase mb-6 self-start w-full border-b border-outline-variant pb-2 font-bold">
            Result Designation
          </div>

          {/* SVG Circular Gauge */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="45" stroke="#2d3449" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                fill="none"
                r="45"
                stroke={safeScore >= 85 ? '#10b981' : safeScore >= 70 ? '#4d8eff' : '#f59e0b'}
                strokeDasharray="282.7"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="8"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display-lg text-display-lg font-bold text-on-surface">
                {safeScore.toFixed(0)}%
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px]">
                Confidence
              </span>
            </div>
          </div>

          {/* Attribution Badge */}
          <div
            className={`px-5 py-2 rounded-full font-title-sm text-title-sm font-bold flex items-center gap-2 mb-2 ${
              safeScore >= 85
                ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/60 border border-amber-500/50 text-amber-300'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <span>{safeScore >= 85 ? 'High-Confidence Linkage' : 'Potential Linkage'}</span>
          </div>

          {/* Confidence Band Indicator */}
          <div className="flex items-center gap-4 w-full mt-4 bg-surface-container p-3 rounded border border-outline-variant/40">
            <span className="font-label-caps text-label-caps text-on-surface-variant w-14">Band:</span>
            <div className="flex-1 flex gap-1 h-2">
              <div className="h-full bg-[#10b981] flex-1 rounded-l"></div>
              <div className="h-full bg-primary flex-1"></div>
              <div className="h-full bg-[#f59e0b] flex-1 rounded-r opacity-40"></div>
            </div>
            <span className="font-label-caps text-label-caps text-emerald-400 font-bold">
              {analysis?.confidenceLevel || 'VERY_HIGH'}
            </span>
          </div>
        </div>

        {/* Persona Comparison Cards (Col Span 8) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col md:flex-row gap-6 items-stretch">
          {/* Source Persona */}
          <div className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-3">
              <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider font-bold">
                SOURCE PERSONA
              </span>
              <span className="px-2 py-0.5 bg-surface-variant rounded text-[10px] font-data-mono text-on-surface">
                ID: {sourcePersona.id.slice(0, 8)}
              </span>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded bg-surface-variant border border-outline-variant flex items-center justify-center text-tertiary shrink-0">
                <span className="material-symbols-outlined text-[28px]">person</span>
              </div>
              <div>
                <h2 className="font-title-sm text-title-sm font-bold text-tertiary">
                  @{sourcePersona.handle}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Active: {sourcePersona.platform}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(sourcePersona.tags || []).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-surface-container rounded border border-outline-variant text-[10px] font-label-caps text-on-surface-variant"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-2 pt-3 border-t border-outline-variant/40 font-data-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">First Seen:</span>
                <span className="text-on-surface">{sourcePersona.firstSeen}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Key PGP:</span>
                <span className="text-on-surface">{sourcePersona.pgpKey}</span>
              </div>
            </div>
          </div>

          {/* Connector Icon */}
          <div className="hidden md:flex flex-col items-center justify-center -mx-3 z-10">
            <div className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center shadow-lg text-primary">
              <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
            </div>
          </div>

          {/* Target Persona */}
          <div className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-3">
              <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider font-bold">
                TARGET PERSONA
              </span>
              <span className="px-2 py-0.5 bg-surface-variant rounded text-[10px] font-data-mono text-on-surface">
                ID: {targetPersona.id.slice(0, 8)}
              </span>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded bg-surface-variant border border-outline-variant flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[28px]">person_check</span>
              </div>
              <div>
                <h2 className="font-title-sm text-title-sm font-bold text-primary">
                  @{targetPersona.handle}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Active: {targetPersona.platform}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(targetPersona.tags || []).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-surface-container rounded border border-outline-variant text-[10px] font-label-caps text-on-surface-variant"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-2 pt-3 border-t border-outline-variant/40 font-data-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">First Seen:</span>
                <span className="text-on-surface">{targetPersona.firstSeen}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Crypto Wallet:</span>
                <span className="text-on-surface">{targetPersona.wallet}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Explanation Block (Col Span 12, Exact Stitch AI Block) */}
        <div className="col-span-12 bg-surface-container border border-primary/30 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
          <div className="flex items-start gap-4">
            <span
              className="material-symbols-outlined text-primary mt-1 text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              smart_toy
            </span>
            <div>
              <h3 className="font-title-sm text-title-sm font-bold text-on-surface mb-2">
                Gemini Forensic AI Synthesis &amp; Reasoning
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {analysis?.aiExplanationSummary || FALLBACK_LINKAGE.aiExplanationSummary}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Deterministic Factor Contribution Cards */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Factor 1: Identifiers */}
          <div className="card-panel p-4 flex flex-col gap-2 border-outline-variant bg-surface-container-low">
            <div className="flex justify-between items-center text-outline text-xs font-label-caps font-bold">
              <span>IDENTIFIERS (35%)</span>
              <span className="material-symbols-outlined text-[16px] text-tertiary">key</span>
            </div>
            <div className="font-display-lg text-[22px] font-bold text-on-surface">
              {Number(identifierScore).toFixed(2)} / 35.00
            </div>
            <div className="confidence-meter mt-1">
              <div
                className="confidence-fill conf-high"
                style={{ width: `${Math.min(100, Math.max(0, (Number(identifierScore) / 35) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-outline mt-1 leading-relaxed">
              Matching PGP subkeys, cryptocurrency deposit addresses, and Tox IDs.
            </p>
          </div>

          {/* Factor 2: Stylometry */}
          <div className="card-panel p-4 flex flex-col gap-2 border-outline-variant bg-surface-container-low">
            <div className="flex justify-between items-center text-outline text-xs font-label-caps font-bold">
              <span>STYLOMETRY (25%)</span>
              <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
            </div>
            <div className="font-display-lg text-[22px] font-bold text-on-surface">
              {Number(stylometricScore).toFixed(2)} / 25.00
            </div>
            <div className="confidence-meter mt-1">
              <div
                className="confidence-fill conf-high"
                style={{ width: `${Math.min(100, Math.max(0, (Number(stylometricScore) / 25) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-outline mt-1 leading-relaxed">
              Cosine similarity on vocabulary richness, punctuation ratios, and greeting formulas.
            </p>
          </div>

          {/* Factor 3: Behavior */}
          <div className="card-panel p-4 flex flex-col gap-2 border-outline-variant bg-surface-container-low">
            <div className="flex justify-between items-center text-outline text-xs font-label-caps font-bold">
              <span>BEHAVIOR (20%)</span>
              <span className="material-symbols-outlined text-[16px] text-[#f59e0b]">schedule</span>
            </div>
            <div className="font-display-lg text-[22px] font-bold text-on-surface">
              {Number(behavioralScore).toFixed(2)} / 20.00
            </div>
            <div className="confidence-meter mt-1">
              <div
                className="confidence-fill conf-high"
                style={{ width: `${Math.min(100, Math.max(0, (Number(behavioralScore) / 20) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-outline mt-1 leading-relaxed">
              Diurnal posting timezone alignment (UTC+3 Moscow Standard Time).
            </p>
          </div>

          {/* Factor 4: Infrastructure */}
          <div className="card-panel p-4 flex flex-col gap-2 border-outline-variant bg-surface-container-low">
            <div className="flex justify-between items-center text-outline text-xs font-label-caps font-bold">
              <span>INFRASTRUCTURE (20%)</span>
              <span className="material-symbols-outlined text-[16px] text-[#06b6d4]">dns</span>
            </div>
            <div className="font-display-lg text-[22px] font-bold text-on-surface">
              {Number(infrastructureScore).toFixed(2)} / 20.00
            </div>
            <div className="confidence-meter mt-1">
              <div
                className="confidence-fill conf-high"
                style={{ width: `${Math.min(100, Math.max(0, (Number(infrastructureScore) / 20) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-outline mt-1 leading-relaxed">
              Tor Onion v3 hidden service mirrors and hosting ASN co-location.
            </p>
          </div>
        </div>

        {/* Evidence Matrix Table (Col Span 12) */}
        <div className="col-span-12 card-panel rounded-lg p-5 border-outline-variant bg-surface-container">
          <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-3">
            <div>
              <h3 className="font-title-sm text-title-sm font-bold text-on-surface">
                Attribution Evidence Matrix
              </h3>
              <p className="font-body-sm text-body-sm text-outline">
                Deterministic forensic indicators weighted according to the SIH scoring specification
              </p>
            </div>
            <span className="font-label-caps text-xs text-primary font-mono font-bold">
              TOTAL POINTS: {safeScore.toFixed(2)} / 100.00
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="font-label-caps text-label-caps text-outline py-2.5 px-3">
                    FACTOR CATEGORY
                  </th>
                  <th className="font-label-caps text-label-caps text-outline py-2.5 px-3">
                    EVIDENCE FINDING
                  </th>
                  <th className="font-label-caps text-label-caps text-outline py-2.5 px-3">
                    POINTS CONTRIBUTED
                  </th>
                  <th className="font-label-caps text-label-caps text-outline py-2.5 px-3">
                    SOURCE RELIABILITY
                  </th>
                  <th className="font-label-caps text-label-caps text-outline py-2.5 px-3">
                    TIMESTAMP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 font-body-sm">
                {evidenceList.map((item, idx) => (
                  <tr key={item.id || idx} className="interactive-row">
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-label-caps text-[10px] bg-surface-container-highest border border-outline-variant text-primary font-bold">
                        {item.factorCategory}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-on-surface text-body-md">{item.title}</div>
                      <div className="text-[12px] text-outline mt-0.5">{item.details}</div>
                      {item.evidenceSnippet && (
                        <div className="text-[11px] font-mono text-tertiary bg-surface-dim p-2 rounded border border-outline-variant/30 mt-1.5 break-all">
                          {item.evidenceSnippet}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-data-mono font-bold text-emerald-400 text-[13px]">
                      +{Number(item.contributionPoints ?? 0).toFixed(2)} pts
                    </td>
                    <td className="py-3 px-3 font-data-mono text-[11px] text-on-surface-variant">
                      {item.sourceReliability || 'Verified Sensor'}
                    </td>
                    <td className="py-3 px-3 font-data-mono text-[11px] text-outline whitespace-nowrap">
                      {formatIsoDate(item.observedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LinkagePage() {
  return (
    <Suspense
      fallback={
        <div className="card-panel p-12 text-center text-xs font-mono text-outline">
          Loading AI Linkage Analysis...
        </div>
      }
    >
      <LinkageContent />
    </Suspense>
  );
}
