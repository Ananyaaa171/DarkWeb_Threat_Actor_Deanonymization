'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { EvidenceItem } from '@/types';
import { formatIsoDate } from '@/utils/formatters';

interface EvidenceCardData extends EvidenceItem {
  observedObservation: string;
  whyItMatters: string;
  connectedEntities: string;
  categoryLabel: 'Identity' | 'Writing Style' | 'Activity' | 'Technical' | 'Timeline';
  confidenceStrength: string;
}

const FALLBACK_EVIDENCE_ITEMS: EvidenceCardData[] = [
  {
    id: 'ev-1',
    factorCategory: 'IDENTIFIER',
    categoryLabel: 'Identity',
    title: 'Cryptographic PGP Subkey Exact Match',
    contributionPoints: 33.25,
    details: 'Identical PGP subkey 0x4A72B5C1 attached to both account profiles across two separate underground forums.',
    observedObservation: 'Operational PGP subkey 0x4A72B5C1 was published in public profile keyrings on both XSS.is and Ramp forum.',
    whyItMatters: 'Demonstrates mathematical possession of the identical private key, establishing near-certain deterministic identity continuity between handles.',
    connectedEntities: '@bassterlord_xss ↔ @basster_rampv2',
    confidenceStrength: 'Very High (+33.25 pts)',
    evidenceSnippet: 'pub: 94F8 2B31 8AC4 701E D5E2 1198 4A72 B5C1 09E8 33DF (RSA-4096)',
    source: 'XSS.is & Ramp Forum PGP Keyring Registry',
    sourceReliability: 'Confirmed Cryptographic Proof (Sensor Reliability A)',
    observedAt: '2026-08-21T09:15:00Z',
  },
  {
    id: 'ev-2',
    factorCategory: 'IDENTIFIER',
    categoryLabel: 'Identity',
    title: 'Shared Bitcoin Deposit Escrow Wallet',
    contributionPoints: 18.5,
    details: 'Deposit address bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh used for security deposit on both boards.',
    observedObservation: 'Transactions originating from the same wallet address funded verified vendor status on two different platforms.',
    whyItMatters: 'Direct financial linkage confirming shared operational treasury and fund management.',
    connectedEntities: '@bassterlord_xss ↔ @basster_rampv2',
    confidenceStrength: 'High (+18.50 pts)',
    evidenceSnippet: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh (28.45 BTC Ingested)',
    source: 'On-Chain Blockchain Ledger Analysis',
    sourceReliability: 'Direct Ledger Confirmation',
    observedAt: '2026-08-18T16:20:00Z',
  },
  {
    id: 'ev-3',
    factorCategory: 'STYLOMETRY',
    categoryLabel: 'Writing Style',
    title: 'Writing Style & Vocabulary Alignment',
    contributionPoints: 21.75,
    details: '87% linguistic alignment across vocabulary richness, punctuation ratios, and conversational sentence lengths.',
    observedObservation: 'Both accounts open announcements with identical bracket syntax "[!] Greetings to the board" and share Russian-to-English grammar idiosyncrasies.',
    whyItMatters: 'Indicates the same physical author or tight-knit drafting team authored the operational manuals.',
    connectedEntities: '@bassterlord_xss ↔ @basster_rampv2',
    confidenceStrength: 'Strong Match (+21.75 pts)',
    evidenceSnippet: 'Shared opening: "[!] Greetings to the board, regarding payload deployment..." (Cosine 0.87)',
    source: 'Cross-Forum Corpus NLP Engine',
    sourceReliability: 'Statistical Feature Correlation (95% Confidence)',
    observedAt: '2026-08-22T12:00:00Z',
  },
  {
    id: 'ev-4',
    factorCategory: 'BEHAVIOR',
    categoryLabel: 'Activity',
    title: 'Coinciding Diurnal Schedule & Active Hours',
    contributionPoints: 17.5,
    details: '94% correlation in message timestamps corresponding to UTC+3 (Moscow Standard Time) business hours.',
    observedObservation: 'Over 88% of forum postings and transaction settlements occur between 09:00 and 18:00 UTC with synchronized weekend lulls.',
    whyItMatters: 'Corroborates matching geographic timezone and daily operational schedule.',
    connectedEntities: '@bassterlord_xss ↔ @basster_rampv2',
    confidenceStrength: 'Consistent Schedule (+17.50 pts)',
    evidenceSnippet: 'Peak active window: 09:00 - 18:00 UTC (94% diurnal alignment)',
    source: 'Forum Timestamp Ingestion Feed',
    sourceReliability: 'Temporal Distribution Match',
    observedAt: '2026-08-22T14:00:00Z',
  },
  {
    id: 'ev-5',
    factorCategory: 'INFRASTRUCTURE',
    categoryLabel: 'Technical',
    title: 'Tor Onion Service Mirror Co-location',
    contributionPoints: 17.0,
    details: 'Both personas published links pointing to the identical Tor Onion v3 service mirror.',
    observedObservation: 'Identical .onion v3 address published in recruitment posts across both forums, hosted on AS200651.',
    whyItMatters: 'Demonstrates shared operational infrastructure and backend command-and-control access.',
    connectedEntities: '@bassterlord_xss ↔ @basster_rampv2',
    confidenceStrength: 'Strong Technical Link (+17.00 pts)',
    evidenceSnippet: 'http://lockbit7z275w3k3jshv5729fksu627ahskd8276f5skdl27f6sjd8.onion (ASN: AS200651)',
    source: 'Tor Network Passive Sensor Scan',
    sourceReliability: 'Direct Network Confirmation',
    observedAt: '2026-08-22T08:00:00Z',
  },
  {
    id: 'ev-6',
    factorCategory: 'BEHAVIOR',
    categoryLabel: 'Timeline',
    title: 'Sequential Migration Notice and Account Registration',
    contributionPoints: 15.0,
    details: 'Persona A posted a transition announcement 48 hours prior to Persona B registering with the matching key.',
    observedObservation: 'XSS.is migration notice posted on July 30, followed by Ramp forum registration on August 1.',
    whyItMatters: 'Sequential timing proves continuity of operations following forum moderation changes.',
    connectedEntities: '@bassterlord_xss ➔ @basster_rampv2',
    confidenceStrength: 'Chronological Succession (+15.00 pts)',
    evidenceSnippet: 'July 30, 2026 (Migration Notice) ➔ Aug 1, 2026 (Registration Verified)',
    source: 'Chronological Event Audit Trail',
    sourceReliability: 'Timestamped Forum Records',
    observedAt: '2026-08-01T08:15:00Z',
  },
];

function EvidenceContent() {
  const searchParams = useSearchParams();
  const linkageId = searchParams.get('linkageId') || 'link-lb-demo';

  const [evidenceList, setEvidenceList] = useState<EvidenceCardData[]>(FALLBACK_EVIDENCE_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    async function loadEvidence() {
      try {
        setIsLoading(true);
        const data = await api.getEvidence(linkageId);
        if (data && Array.isArray(data) && data.length > 0) {
          const transformed: EvidenceCardData[] = data.map((item, idx) => {
            let catLabel: EvidenceCardData['categoryLabel'] = 'Identity';
            if (item.factorCategory === 'STYLOMETRY') catLabel = 'Writing Style';
            else if (item.factorCategory === 'BEHAVIOR') catLabel = 'Activity';
            else if (item.factorCategory === 'INFRASTRUCTURE') catLabel = 'Technical';

            return {
              ...item,
              categoryLabel: catLabel,
              observedObservation: item.details || 'Observed forensic indicator during darknet monitoring.',
              whyItMatters: 'Provides corroborating evidence linking operational profiles across platforms.',
              connectedEntities: '@bassterlord_xss ↔ @basster_rampv2',
              confidenceStrength: `+${Number(item.contributionPoints ?? 0).toFixed(2)} pts`,
            };
          });
          setEvidenceList(transformed);
          setIsLiveApi(true);
        } else {
          setEvidenceList(FALLBACK_EVIDENCE_ITEMS);
          setIsLiveApi(false);
        }
      } catch {
        setEvidenceList(FALLBACK_EVIDENCE_ITEMS);
        setIsLiveApi(false);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvidence();
  }, [linkageId]);

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'Identity', label: 'Identity' },
    { id: 'Writing Style', label: 'Writing Style' },
    { id: 'Activity', label: 'Activity' },
    { id: 'Technical', label: 'Technical' },
    { id: 'Timeline', label: 'Timeline' },
  ];

  const filteredEvidence = evidenceList.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.categoryLabel === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.observedObservation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.whyItMatters.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.connectedEntities.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPoints = evidenceList.reduce((acc, curr) => acc + (curr.contributionPoints || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-1 font-mono text-xs">
            <span className="tracking-wider text-primary font-bold">
              INVESTIGATION EVIDENCE
            </span>
            <span className="text-outline">/</span>
            <span className={`font-semibold ${isLiveApi ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isLiveApi ? 'Live Evidence Feed' : 'Reference Case Dossier'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Supporting Evidence
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 font-sans">
            Verified forensic findings, cryptographic keys, behavioral signals, and technical co-locations
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/60 font-mono text-xs">
            <span className="text-outline">Total Findings:</span>
            <span className="text-primary font-bold">{filteredEvidence.length} Items</span>
          </div>
          <Link
            href="/linkage"
            className="btn-secondary px-3 py-2 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">psychology</span>
            <span>Connection Analysis</span>
          </Link>
        </div>
      </div>

      {/* 2. Filter Bar & Search */}
      <div className="card-panel rounded-xl p-4 border-outline-variant/60 bg-surface-container shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-outline hover:text-on-surface border border-outline-variant/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50 w-full md:w-72">
          <span className="material-symbols-outlined text-outline text-[16px]">search</span>
          <input
            type="text"
            placeholder="Search evidence observations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-on-surface placeholder:text-outline/70 outline-none w-full font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-outline hover:text-on-surface text-xs font-mono"
            >
              clear
            </button>
          )}
        </div>
      </div>

      {/* 3. Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvidence.map((item, idx) => (
          <div
            key={item.id || idx}
            className="card-panel rounded-xl p-5 border-outline-variant/60 bg-surface-container shadow-sm flex flex-col justify-between gap-3.5 hover:border-primary/50 transition-colors"
          >
            {/* Header: Category, Title & Confidence */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider ${
                      item.categoryLabel === 'Identity'
                        ? 'bg-tertiary/15 text-tertiary border border-tertiary/30'
                        : item.categoryLabel === 'Writing Style'
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : item.categoryLabel === 'Activity'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : item.categoryLabel === 'Technical'
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.categoryLabel}
                  </span>
                  <span className="text-[11px] font-mono text-outline">
                    {formatIsoDate(item.observedAt)}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-on-surface leading-tight">{item.title}</h3>
              </div>

              {/* Confidence / Strength */}
              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {item.confidenceStrength}
                </span>
              </div>
            </div>

            {/* Structured 4-Part Evidence Body */}
            <div className="space-y-2.5 text-xs">
              {/* 1. What was observed */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-1">
                <span className="font-mono text-[10px] text-outline uppercase font-bold tracking-wider">
                  1. What Was Observed
                </span>
                <p className="text-on-surface-variant font-sans leading-relaxed">
                  {item.observedObservation}
                </p>
              </div>

              {/* 2. Why it matters */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-1">
                <span className="font-mono text-[10px] text-primary uppercase font-bold tracking-wider">
                  2. Why It Matters
                </span>
                <p className="text-on-surface-variant font-sans leading-relaxed">
                  {item.whyItMatters}
                </p>
              </div>

              {/* 3. Which personas/entities it connects */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 font-mono text-xs">
                <span className="text-outline text-[11px]">3. Connected Personas:</span>
                <span className="text-tertiary font-bold">{item.connectedEntities}</span>
              </div>
            </div>

            {/* Cryptographic / Source Snippet */}
            {item.evidenceSnippet && (
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 font-mono text-[11px] text-tertiary break-all select-all flex items-center justify-between gap-2">
                <span>{item.evidenceSnippet}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(item.evidenceSnippet || '')}
                  title="Copy Evidence Snippet"
                  className="text-outline hover:text-primary transition-colors cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[15px]">content_copy</span>
                </button>
              </div>
            )}

            {/* Expandable "View Details" Control */}
            <details className="pt-2 border-t border-outline-variant/30 text-[11px] font-mono text-outline cursor-pointer">
              <summary className="hover:text-primary font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
                <span>View Details &amp; Technical Verification</span>
              </summary>
              <div className="mt-2 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/40 space-y-1.5 text-[10px] text-on-surface-variant">
                <div>Source Reference: {item.source || 'Automated Darknet Crawler'}</div>
                <div>Sensor Reliability: {item.sourceReliability || 'Confirmed Cryptographic Proof'}</div>
                <div>Point Contribution: {Number(item.contributionPoints ?? 0).toFixed(2)} pts</div>
                <div>Evidence Item UUID: {item.id}</div>
              </div>
            </details>
          </div>
        ))}
      </div>

      {filteredEvidence.length === 0 && (
        <div className="card-panel p-12 text-center text-xs font-mono text-outline rounded-xl border border-outline-variant/60 bg-surface-container">
          No supporting evidence found matching the selected filters.
        </div>
      )}
    </div>
  );
}

export default function EvidencePage() {
  return (
    <Suspense
      fallback={
        <div className="card-panel p-12 text-center text-xs font-mono text-outline">
          Loading Supporting Evidence...
        </div>
      }
    >
      <EvidenceContent />
    </Suspense>
  );
}
