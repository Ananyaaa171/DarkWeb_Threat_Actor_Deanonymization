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
    <div className="flex flex-col gap-6">
      {/* Hero Search Bar */}
      <div className="w-full max-w-4xl mx-auto">
        <form onSubmit={handleFormSubmit} className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[22px]">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across threat syndicates, darknet handles, crypto wallets, PGP keys, and onion hosts..."
            className="w-full bg-surface-container-lowest border border-outline-variant/70 text-on-surface py-3.5 pl-12 pr-28 rounded-xl shadow-inner focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-outline/70 text-sm font-sans"
          />
          <button
            type="submit"
            className="btn-primary absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Quick chip demo shortcuts */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-mono text-outline">
          <span className="font-semibold text-on-surface-variant">QUICK FILTERS:</span>
          <button
            type="button"
            onClick={() => {
              setQuery('bassterlord');
              setSelectedType('ALL');
              executeSearch('bassterlord', 'ALL');
            }}
            className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/60 hover:border-primary text-primary transition-colors cursor-pointer"
          >
            @bassterlord
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('0x4A72B5C1');
              setSelectedType('IDENTIFIER');
              executeSearch('0x4A72B5C1', 'IDENTIFIER');
            }}
            className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/60 hover:border-primary text-tertiary transition-colors cursor-pointer"
          >
            PGP Subkey 0x4A72B5C1
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('LockBit');
              setSelectedType('ACTOR');
              executeSearch('LockBit', 'ACTOR');
            }}
            className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/60 hover:border-primary text-on-surface transition-colors cursor-pointer"
          >
            LockBit Syndicate
          </button>
        </div>
      </div>

      {/* Main Filter & Results Layout */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[1400px] mx-auto">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-6">
          <div className="card-panel p-4 flex flex-col gap-5 border-outline-variant/60 rounded-xl shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">Search Filters</h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedType('ALL');
                  setMinConfidence(0);
                  setQuery('');
                  executeSearch('', 'ALL');
                }}
                className="text-primary font-mono hover:underline text-xs"
              >
                Reset
              </button>
            </div>

            {/* Entity Type Filter */}
            <div>
              <h4 className="font-mono text-[11px] font-semibold text-outline uppercase tracking-wider mb-2.5">
                Target Entity Type
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'All Indicators', value: 'ALL' },
                  { label: 'Threat Syndicates', value: 'ACTOR' },
                  { label: 'Darknet Personas', value: 'PERSONA' },
                  { label: 'Wallets & PGP Keys', value: 'IDENTIFIER' },
                  { label: 'Tor Infrastructure', value: 'INFRASTRUCTURE' },
                ].map((t) => (
                  <label key={t.value} className="flex items-center gap-2 cursor-pointer group select-none">
                    <input
                      type="radio"
                      name="entityType"
                      checked={selectedType === t.value}
                      onChange={() => {
                        setSelectedType(t.value);
                        executeSearch(query, t.value);
                      }}
                      className="accent-primary cursor-pointer"
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
                <h4 className="font-mono text-[11px] font-semibold text-outline uppercase tracking-wider">
                  Min. Confidence
                </h4>
                <span className="font-mono text-xs font-bold text-primary">
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
              <div className="flex justify-between mt-1 font-mono text-[10px] text-outline">
                <span>0% (All)</span>
                <span>100% (Exact)</span>
              </div>
            </div>

            {/* Data Source Notice */}
            <div className="pt-3 border-t border-outline-variant/40 text-[11px] font-mono text-outline">
              <span className="text-primary font-bold">Index Status: </span>
              {isLiveApi ? 'Intelligence Feed' : 'Reference Indicator Baseline'}
            </div>
          </div>
        </aside>

        {/* Search Results Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Results Header */}
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-on-surface-variant font-mono">
              Found <strong className="text-primary font-bold">{filteredByConfidence.length}</strong> indicator records
              {query && <span> for &quot;{query}&quot;</span>}
            </span>
            <div className="flex gap-2">
              <Link
                href="/export"
                className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>Export Dossier</span>
              </Link>
            </div>
          </div>

          {/* Data Table */}
          <div className="card-panel overflow-x-auto border-outline-variant/60 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40 text-outline font-mono">
                  <th className="px-4 py-3 uppercase tracking-wider font-semibold">
                    Indicator / Moniker
                  </th>
                  <th className="px-4 py-3 uppercase tracking-wider font-semibold">
                    Category
                  </th>
                  <th className="px-4 py-3 uppercase tracking-wider font-semibold">
                    Associated Syndicate
                  </th>
                  <th className="px-4 py-3 uppercase tracking-wider font-semibold w-36">
                    Attribution Score
                  </th>
                  <th className="px-4 py-3 uppercase tracking-wider font-semibold text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-outline font-mono text-xs">
                      Querying threat intelligence database...
                    </td>
                  </tr>
                ) : filteredByConfidence.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-outline font-mono text-xs">
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
                        <td className="px-4 py-3 font-semibold text-on-surface">
                          <Link
                            href={getEntityLink(res)}
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-primary text-[17px]">
                              {getEntityIcon(res.resultType)}
                            </span>
                            <span>{res.displayName}</span>
                          </Link>
                          {snippet && (
                            <div className="text-[11px] font-normal text-outline truncate max-w-md mt-0.5 font-mono">
                              {snippet}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-surface-variant text-on-surface-variant border border-outline-variant/60">
                            {res.resultType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-outline">
                          {res.actorName || res.category || '—'}
                        </td>
                        <td className="px-4 py-3">
                          {score !== null && score !== undefined ? (
                            <div className="flex items-center gap-2 w-32">
                              <div className="flex-1 h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    score >= 85
                                      ? 'bg-emerald-400'
                                      : score >= 70
                                      ? 'bg-primary'
                                      : 'bg-amber-400'
                                  }`}
                                  style={{ width: `${score}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-xs font-bold text-on-surface">
                                {score.toFixed(0)}%
                              </span>
                            </div>
                          ) : (
                            <span className="font-mono text-[11px] text-outline">IOC RECORD</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={getEntityLink(res)}
                            className="btn-secondary px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
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
