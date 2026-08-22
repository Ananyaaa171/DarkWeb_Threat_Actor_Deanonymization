'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { SearchResult } from '@/types';

const FALLBACK_SEARCH_RESULTS: SearchResult[] = [
  {
    resultType: 'ACTOR',
    entityId: 'a0000000-0000-0000-0000-000000000001',
    actorId: 'a0000000-0000-0000-0000-000000000001',
    displayName: 'LockBit Syndicate Core',
    actorName: 'LockBit Syndicate Core',
    handle: null,
    category: 'RANSOMWARE',
    confidenceScore: 92.5,
    confidence: 92.5,
    lastObservedAt: '2026-08-22T12:00:00Z',
    metadataSnippet: 'Active RaaS developer with cross-forum migration footprint across XSS.is and Ramp.',
    secondaryText: 'Active RaaS developer with cross-forum migration footprint across XSS.is and Ramp.',
  },
  {
    resultType: 'PERSONA',
    entityId: 'b0000000-0000-0000-0000-000000000001',
    actorId: 'a0000000-0000-0000-0000-000000000001',
    displayName: '@bassterlord_xss',
    actorName: 'LockBit Syndicate Core',
    handle: 'bassterlord_xss',
    personaHandle: 'bassterlord_xss',
    category: 'XSS.is',
    confidenceScore: 98.5,
    confidence: 98.5,
    lastObservedAt: '2023-01-20T15:45:00Z',
    metadataSnippet: 'Forum Veteran profile on XSS.is with 2,400+ reputation points.',
    secondaryText: 'Forum Veteran profile on XSS.is with 2,400+ reputation points.',
  },
  {
    resultType: 'PERSONA',
    entityId: 'b0000000-0000-0000-0000-000000000002',
    actorId: 'a0000000-0000-0000-0000-000000000001',
    displayName: '@basster_rampv2',
    actorName: 'LockBit Syndicate Core',
    handle: 'basster_rampv2',
    personaHandle: 'basster_rampv2',
    category: 'Ramp Forum',
    confidenceScore: 94.0,
    confidence: 94.0,
    lastObservedAt: '2026-08-15T18:30:00Z',
    metadataSnippet: 'Active Ramp forum account advertising affiliate training and manual.',
    secondaryText: 'Active Ramp forum account advertising affiliate training and manual.',
  },
  {
    resultType: 'IDENTIFIER',
    entityId: 'c0000000-0000-0000-0000-000000000001',
    actorId: 'a0000000-0000-0000-0000-000000000001',
    displayName: '0x4A72B5C1 (PGP Subkey)',
    actorName: 'LockBit Syndicate Core',
    handle: null,
    category: 'PGP_KEY',
    confidenceScore: 95.0,
    confidence: 95.0,
    lastObservedAt: '2026-08-15T18:30:00Z',
    metadataSnippet: 'RSA 4096-bit signing subkey verified on Ramp and historical XSS.is posts.',
    secondaryText: 'RSA 4096-bit signing subkey verified on Ramp and historical XSS.is posts.',
  },
  {
    resultType: 'INFRASTRUCTURE',
    entityId: 'd0000000-0000-0000-0000-000000000001',
    actorId: 'a0000000-0000-0000-0000-000000000001',
    displayName: 'lockbit7xx...onion',
    actorName: 'LockBit Syndicate Core',
    handle: null,
    category: 'ONION_SERVICE',
    confidenceScore: 90.0,
    confidence: 90.0,
    lastObservedAt: '2026-08-22T08:00:00Z',
    metadataSnippet: 'Active Tor Onion v3 negotiation mirror co-located on AS200651 Flokinet Ltd.',
    secondaryText: 'Active Tor Onion v3 negotiation mirror co-located on AS200651 Flokinet Ltd.',
  },
];

function InvestigationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'ALL';

  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState(initialType);
  const [minConfidence, setMinConfidence] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);

  const executeSearch = async (searchTerm: string, type: string) => {
    try {
      setIsLoading(true);
      const q = searchTerm.trim();
      const res = await api.search({
        q: q || undefined,
        type: type !== 'ALL' ? type : undefined,
      });

      if (res && res.length > 0) {
        setResults(res);
        setIsLiveApi(true);
      } else {
        if (q) {
          // If a specific query was submitted and returned 0 live matches, show 0 results
          setResults([]);
          setIsLiveApi(true);
        } else {
          // If empty query, show baseline fallback dataset
          setResults(FALLBACK_SEARCH_RESULTS);
          setIsLiveApi(false);
        }
      }
    } catch (err: any) {
      console.warn('Live search offline, filtering demonstration dataset:', err);
      let filtered = FALLBACK_SEARCH_RESULTS;
      if (type !== 'ALL') {
        filtered = filtered.filter((r) => r.resultType === type);
      }
      if (searchTerm.trim()) {
        const qLower = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.displayName.toLowerCase().includes(qLower) ||
            (r.actorName && r.actorName.toLowerCase().includes(qLower)) ||
            (r.handle && r.handle.toLowerCase().includes(qLower)) ||
            (r.personaHandle && r.personaHandle.toLowerCase().includes(qLower))
        );
      }
      setResults(filtered);
      setIsLiveApi(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(initialQuery || 'LockBit', initialType);
  }, [initialQuery, initialType]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, selectedType);
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'ACTOR':
        return 'group';
      case 'PERSONA':
        return 'person';
      case 'IDENTIFIER':
        return 'key';
      case 'INFRASTRUCTURE':
        return 'language';
      default:
        return 'search';
    }
  };

  const getEntityLink = (res: SearchResult) => {
    if (res.resultType === 'ACTOR') {
      const actorId = res.actorId || res.entityId;
      return `/actors/${actorId}`;
    }
    if (res.resultType === 'PERSONA') {
      if (res.actorId) return `/actors/${res.actorId}`;
      return `/linkage?source=${res.entityId || res.personaId}`;
    }
    if (res.actorId) {
      return `/actors/${res.actorId}`;
    }
    return `/graph`;
  };

  const getScore = (r: SearchResult): number | null => {
    return r.confidence ?? r.confidenceScore ?? null;
  };

  const filteredByConfidence = results.filter((r) => {
    const score = getScore(r);
    return score === null || score >= minConfidence;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Search Bar (Exact Stitch Hero) */}
      <div className="w-full max-w-4xl mx-auto">
        <form onSubmit={handleFormSubmit} className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[24px]">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across actors, personas, identifiers, and infrastructure..."
            className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md py-4 pl-12 pr-28 rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-on-surface-variant text-body-md"
          />
          <button
            type="submit"
            className="btn-primary absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 text-xs font-label-caps"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Quick chip demo shortcuts */}
        <div className="flex items-center gap-2 mt-3 text-xs font-label-caps text-on-surface-variant">
          <span>QUICK SUGGESTIONS:</span>
          <button
            onClick={() => {
              setQuery('bassterlord');
              setSelectedType('ALL');
              executeSearch('bassterlord', 'ALL');
            }}
            className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant hover:border-primary text-primary transition-colors cursor-pointer"
          >
            @bassterlord
          </button>
          <button
            onClick={() => {
              setQuery('0x4A72B5C1');
              setSelectedType('IDENTIFIER');
              executeSearch('0x4A72B5C1', 'IDENTIFIER');
            }}
            className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant hover:border-primary text-tertiary transition-colors cursor-pointer"
          >
            PGP Subkey
          </button>
          <button
            onClick={() => {
              setQuery('LockBit');
              setSelectedType('ACTOR');
              executeSearch('LockBit', 'ACTOR');
            }}
            className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant hover:border-primary text-on-surface transition-colors cursor-pointer"
          >
            LockBit Syndicate
          </button>
        </div>
      </div>

      {/* Main Filter & Results Layout */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[1400px] mx-auto">
        {/* Filters Sidebar (Stitch Aside Panel) */}
        <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-6">
          <div className="card-panel p-4 flex flex-col gap-5 border-outline-variant">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <h3 className="font-label-caps text-label-caps text-on-surface uppercase">Filters</h3>
              <button
                onClick={() => {
                  setSelectedType('ALL');
                  setMinConfidence(0);
                  setQuery('');
                  executeSearch('', 'ALL');
                }}
                className="text-primary font-body-sm hover:underline text-xs"
              >
                Clear All
              </button>
            </div>

            {/* Entity Type Filter */}
            <div>
              <h4 className="font-body-sm text-body-sm text-on-surface-variant mb-3 font-semibold">
                Entity Type
              </h4>
              <div className="space-y-2 font-body-sm text-body-sm">
                {[
                  { label: 'All Entities', value: 'ALL' },
                  { label: 'Threat Actors', value: 'ACTOR' },
                  { label: 'Darknet Personas', value: 'PERSONA' },
                  { label: 'Identifiers & Wallets', value: 'IDENTIFIER' },
                  { label: 'Onion Infrastructure', value: 'INFRASTRUCTURE' },
                ].map((t) => (
                  <label key={t.value} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="entityType"
                      checked={selectedType === t.value}
                      onChange={() => {
                        setSelectedType(t.value);
                        executeSearch(query, t.value);
                      }}
                      className="accent-primary"
                    />
                    <span className="text-on-surface group-hover:text-primary transition-colors">
                      {t.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Min Confidence Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-body-sm text-body-sm text-on-surface-variant font-semibold">
                  Min. Confidence
                </h4>
                <span className="font-data-mono text-[12px] font-bold text-primary">
                  {minConfidence}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full accent-primary bg-surface-container-lowest h-1.5 rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-1 font-data-mono text-[10px] text-outline">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Data Source Notice */}
            <div className="pt-3 border-t border-outline-variant text-[11px] font-mono text-outline">
              <span className="text-primary font-bold">Source: </span>
              {isLiveApi ? 'Spring Boot REST + Supabase' : 'Offline Demonstration Cache'}
            </div>
          </div>
        </aside>

        {/* Search Results Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Results Header */}
          <div className="flex justify-between items-center px-1">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Found <strong className="text-on-surface">{filteredByConfidence.length}</strong> results
              for query &quot;{query || 'ALL'}&quot;
            </span>
            <div className="flex gap-2">
              <Link
                href="/export"
                className="btn-secondary px-3 py-1.5 rounded text-xs font-label-caps flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export</span>
              </Link>
            </div>
          </div>

          {/* Stitch Data Table */}
          <div className="card-panel overflow-x-auto border-outline-variant">
            <table className="w-full text-left border-collapse whitespace-nowrap font-body-sm">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
                    RESULT NAME / INDICATOR
                  </th>
                  <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
                    TYPE
                  </th>
                  <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">
                    ASSOCIATED GROUP
                  </th>
                  <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant w-36">
                    CONFIDENCE
                  </th>
                  <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant text-right">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-outline font-data-mono text-xs">
                      Querying threat intelligence database...
                    </td>
                  </tr>
                ) : filteredByConfidence.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-outline font-data-mono text-xs">
                      No threat indicators matched the query &quot;{query}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredByConfidence.map((res, i) => {
                    const score = getScore(res);
                    const snippet = res.metadataSnippet || res.secondaryText;
                    return (
                      <tr
                        key={`${res.entityId || res.actorId}-${i}`}
                        className="interactive-row transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-bold text-on-surface">
                          <Link
                            href={getEntityLink(res)}
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-primary text-[18px]">
                              {getEntityIcon(res.resultType)}
                            </span>
                            <span>{res.displayName}</span>
                          </Link>
                          {snippet && (
                            <div className="text-[11px] font-normal text-outline truncate max-w-md mt-0.5">
                              {snippet}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-label-caps bg-surface-variant text-on-surface-variant border border-outline-variant">
                            {res.resultType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-data-mono text-data-mono text-outline">
                          {res.actorName || res.category || '—'}
                        </td>
                        <td className="px-4 py-3">
                          {score !== null && score !== undefined ? (
                            <div className="flex items-center gap-2 w-32">
                              <div className="flex-1 h-1 bg-surface-container-lowest rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    score >= 85
                                      ? 'bg-[#10B981]'
                                      : score >= 70
                                      ? 'bg-primary'
                                      : 'bg-[#F59E0B]'
                                  }`}
                                  style={{ width: `${score}%` }}
                                ></div>
                              </div>
                              <span className="font-data-mono text-data-mono text-[12px] font-bold text-on-surface">
                                {score.toFixed(0)}%
                              </span>
                            </div>
                          ) : (
                            <span className="font-data-mono text-[11px] text-outline">INDICATOR</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={getEntityLink(res)}
                            className="btn-secondary px-2.5 py-1 text-[11px] font-label-caps rounded inline-flex items-center gap-1"
                          >
                            <span>Investigate</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvestigationPage() {
  return (
    <Suspense
      fallback={
        <div className="card-panel p-12 text-center text-xs font-mono text-outline">
          Loading Investigation Console...
        </div>
      }
    >
      <InvestigationContent />
    </Suspense>
  );
}
