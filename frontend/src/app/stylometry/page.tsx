'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { StylometricComparison, PersonaDetail } from '@/types';

interface PersonaOption {
  id: string;
  handle: string;
  platform: string;
  sampleSnippet: string;
}

const FALLBACK_PERSONAS: PersonaOption[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    handle: 'bassterlord_xss',
    platform: 'XSS.is Underground',
    sampleSnippet:
      '[!] Greetings to the board. We are releasing affiliate manual v3 for RaaS operators. Payout split is 80/20 via Monero escrow. Do not publish leaks without prior approval.',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    handle: 'basster_rampv2',
    platform: 'Ramp Forum',
    sampleSnippet:
      '[!] Greetings to the community. Updated affiliate rules and negotiation guidelines are now active on our panel. 80/20 split confirmed with escrow deposit.',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    handle: 'pompom_breached',
    platform: 'Breached.vc',
    sampleSnippet:
      'Database dump from retail portal available for auction. Starting bid 2.5 BTC. Contact via PGP for sample verification proof.',
  },
];

const FALLBACK_STYLOMETRY_COMPARISON: StylometricComparison = {
  sourcePersonaId: 'b0000000-0000-0000-0000-000000000001',
  targetPersonaId: 'b0000000-0000-0000-0000-000000000002',
  sourceFeatures: {
    ttr: 0.68,
    yulesK: 82.4,
    avgSentenceLength: 14.2,
    avgWordLength: 5.1,
    punctuationFrequency: 0.082,
    functionWordRatio: 0.38,
    smileyPatternFrequency: 0.0,
    totalTokens: 142,
    uniqueTokens: 97,
    totalSentences: 10,
  },
  targetFeatures: {
    ttr: 0.71,
    yulesK: 79.8,
    avgSentenceLength: 13.8,
    avgWordLength: 5.3,
    punctuationFrequency: 0.078,
    functionWordRatio: 0.40,
    smileyPatternFrequency: 0.0,
    totalTokens: 135,
    uniqueTokens: 96,
    totalSentences: 10,
  },
  ttrSimilarity: 0.95,
  yulesKSimilarity: 0.96,
  charTrigramSimilarity: 0.88,
  punctuationSimilarity: 0.92,
  sentenceLengthSimilarity: 0.94,
  wordLengthSimilarity: 0.96,
  smileySimilarity: 1.0,
  functionWordSimilarity: 0.91,
  overallStylometricScore: 87.0,
  analysisDetails:
    'The two personas show strong similarities in vocabulary richness, sentence structure, punctuation habits, and conversational greeting formulations.',
};

function StylometryContent() {
  const searchParams = useSearchParams();

  const [sourceId, setSourceId] = useState('b0000000-0000-0000-0000-000000000001');
  const [targetId, setTargetId] = useState('b0000000-0000-0000-0000-000000000002');
  const [textA, setTextA] = useState(FALLBACK_PERSONAS[0].sampleSnippet);
  const [textB, setTextB] = useState(FALLBACK_PERSONAS[1].sampleSnippet);
  const [comparison, setComparison] = useState<StylometricComparison>(FALLBACK_STYLOMETRY_COMPARISON);
  const [isComparing, setIsComparing] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    const src = searchParams.get('source');
    const tgt = searchParams.get('target');
    if (src && src !== sourceId) {
      setSourceId(src);
      const match = FALLBACK_PERSONAS.find((p) => p.id === src);
      if (match) setTextA(match.sampleSnippet);
    }
    if (tgt && tgt !== targetId) {
      setTargetId(tgt);
      const match = FALLBACK_PERSONAS.find((p) => p.id === tgt);
      if (match) setTextB(match.sampleSnippet);
    }
  }, [searchParams]);

  const handleSourceChange = (id: string) => {
    setSourceId(id);
    const match = FALLBACK_PERSONAS.find((p) => p.id === id);
    if (match) setTextA(match.sampleSnippet);
  };

  const handleTargetChange = (id: string) => {
    setTargetId(id);
    const match = FALLBACK_PERSONAS.find((p) => p.id === id);
    if (match) setTextB(match.sampleSnippet);
  };

  const runComparison = async () => {
    try {
      setIsComparing(true);
      const res = await api.compareStylometry({
        sourcePersonaId: sourceId,
        targetPersonaId: targetId,
        textA,
        textB,
      });
      if (res && typeof res.overallStylometricScore === 'number') {
        setComparison(res);
        setIsLiveApi(true);
      } else {
        setComparison(FALLBACK_STYLOMETRY_COMPARISON);
        setIsLiveApi(false);
      }
    } catch {
      setComparison(FALLBACK_STYLOMETRY_COMPARISON);
      setIsLiveApi(false);
    } finally {
      setIsComparing(false);
    }
  };

  useEffect(() => {
    runComparison();
  }, [sourceId, targetId]);

  const personaA = FALLBACK_PERSONAS.find((p) => p.id === sourceId) || FALLBACK_PERSONAS[0];
  const personaB = FALLBACK_PERSONAS.find((p) => p.id === targetId) || FALLBACK_PERSONAS[1];

  const score = comparison?.overallStylometricScore ?? 87.0;
  const isHighMatch = score >= 75;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-1 font-mono text-xs">
            <span className="tracking-wider text-primary font-bold">
              WRITING STYLE ANALYSIS
            </span>
            <span className="text-outline">/</span>
            <span className={`font-semibold ${isLiveApi ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isLiveApi ? 'Live Language Analysis' : 'Reference Case Study'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Writing Style Comparison
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 font-sans">
            Comparing vocabulary, punctuation habits, and phrasing structure between online personas
          </p>
        </div>

        {/* Persona Selectors Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/60 text-xs font-mono">
            <span className="text-outline font-semibold">Persona A:</span>
            <select
              value={sourceId}
              onChange={(e) => handleSourceChange(e.target.value)}
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
              onChange={(e) => handleTargetChange(e.target.value)}
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
            onClick={runComparison}
            disabled={isComparing}
            className="btn-primary px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isComparing ? 'sync' : 'compare_arrows'}
            </span>
            <span>{isComparing ? 'Comparing...' : 'Compare Writing Style'}</span>
          </button>
        </div>
      </div>

      {/* Hero Comparison Card */}
      <div className="card-panel rounded-xl p-6 border-outline-variant/60 bg-surface-container shadow-sm flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Persona A Header Card */}
          <div className="col-span-12 md:col-span-4 p-5 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-outline uppercase font-bold tracking-wider">
                Persona A
              </span>
              <span className="px-2 py-0.5 rounded bg-tertiary/10 text-tertiary border border-tertiary/30 font-mono text-[10px] font-bold">
                {personaA.platform}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/30 flex items-center justify-center text-tertiary shrink-0">
                <span className="material-symbols-outlined text-[24px]">person</span>
              </div>
              <div>
                <div className="text-base font-bold font-mono text-tertiary">
                  @{personaA.handle}
                </div>
                <div className="text-xs text-outline font-sans">
                  Observed darknet author
                </div>
              </div>
            </div>
          </div>

          {/* Writing Style Match Score */}
          <div className="col-span-12 md:col-span-4 flex flex-col items-center justify-center text-center px-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/80 flex items-center justify-center text-primary shadow mb-2">
              <span className="material-symbols-outlined text-[22px]">edit_note</span>
            </div>

            <span className="font-mono text-xs text-outline uppercase tracking-wider font-bold mb-1">
              Writing Style Match
            </span>

            <div className="font-mono text-4xl font-black text-on-surface my-1">
              {score.toFixed(0)}%
            </div>

            <div
              className={`px-3.5 py-1 rounded-full font-mono text-xs font-bold flex items-center gap-1.5 mt-1 ${
                isHighMatch
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isHighMatch ? 'check_circle' : 'info'}
              </span>
              <span>{isHighMatch ? 'STRONG STYLE MATCH' : 'MODERATE STYLE MATCH'}</span>
            </div>
          </div>

          {/* Persona B Header Card */}
          <div className="col-span-12 md:col-span-4 p-5 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-outline uppercase font-bold tracking-wider">
                Persona B
              </span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-mono text-[10px] font-bold">
                {personaB.platform}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">person_check</span>
              </div>
              <div>
                <div className="text-base font-bold font-mono text-primary">
                  @{personaB.handle}
                </div>
                <div className="text-xs text-outline font-sans">
                  Comparison profile
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plain Language Explanation Callout */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-primary/30 flex items-start gap-3.5">
          <span className="material-symbols-outlined text-primary text-[24px] shrink-0 mt-0.5">
            chat_bubble
          </span>
          <div>
            <div className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
              Plain-English Explanation
            </div>
            <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
              The two personas show strong similarities in vocabulary richness, sentence structure, punctuation habits, and conversational greeting formulations. Both accounts consistently use standardized bracket prefixes (e.g. <span className="font-mono text-tertiary">[!]</span>) and maintain an identical Russian-to-English translation phrasing cadence.
            </p>
          </div>
        </div>
      </div>

      {/* Simple Visual Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Indicator 1: Vocabulary */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span>Vocabulary Overlap</span>
            </div>
            <span className="font-mono text-xs font-bold text-on-surface">95% Match</span>
          </div>
          <p className="text-xs text-outline leading-relaxed">
            Identical word choices, technical extortion terminology, and phrasing distribution.
          </p>
        </div>

        {/* Indicator 2: Sentence Structure */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
              <span className="material-symbols-outlined text-[18px]">format_align_left</span>
              <span>Sentence Length</span>
            </div>
            <span className="font-mono text-xs font-bold text-on-surface">94% Match</span>
          </div>
          <p className="text-xs text-outline leading-relaxed">
            Consistent average sentence lengths (14.2 words vs. 13.8 words per sentence).
          </p>
        </div>

        {/* Indicator 3: Punctuation Habits */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Punctuation Habits</span>
            </div>
            <span className="font-mono text-xs font-bold text-on-surface">92% Match</span>
          </div>
          <p className="text-xs text-outline leading-relaxed">
            Matched comma frequencies, exclamation brackets, and delimiter habits.
          </p>
        </div>

        {/* Indicator 4: Phrasing Patterns */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
              <span className="material-symbols-outlined text-[18px]">handshake</span>
              <span>Greeting Formulations</span>
            </div>
            <span className="font-mono text-xs font-bold text-on-surface">88% Match</span>
          </div>
          <p className="text-xs text-outline leading-relaxed">
            Shared signature opening "[!] Greetings to the board" across darknet forums.
          </p>
        </div>
      </div>

      {/* Interactive Text Comparison Box */}
      <div className="card-panel rounded-xl p-5 border-outline-variant/60 bg-surface-container shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3">
          <div>
            <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
              Analyzed Forum Text Samples
            </h3>
            <p className="text-xs text-outline mt-0.5">
              Inspect or edit the darknet writing samples evaluated by the comparison engine
            </p>
          </div>
          <button
            onClick={runComparison}
            disabled={isComparing}
            className="btn-secondary px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            <span>Re-evaluate Text Samples</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-tertiary font-bold flex justify-between">
              <span>Sample Text A (@{personaA.handle})</span>
              <span className="text-outline font-normal">{(textA || '').split(/\s+/).length} words</span>
            </label>
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              rows={5}
              className="w-full p-3 rounded-lg bg-surface-container-low border border-outline-variant/50 text-xs font-mono text-on-surface outline-none focus:border-primary transition-colors leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-primary font-bold flex justify-between">
              <span>Sample Text B (@{personaB.handle})</span>
              <span className="text-outline font-normal">{(textB || '').split(/\s+/).length} words</span>
            </label>
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              rows={5}
              className="w-full p-3 rounded-lg bg-surface-container-low border border-outline-variant/50 text-xs font-mono text-on-surface outline-none focus:border-primary transition-colors leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Expandable Advanced Details Section */}
      <details className="card-panel rounded-xl p-5 border-outline-variant/60 bg-surface-container shadow-sm cursor-pointer">
        <summary className="font-mono text-xs font-bold text-primary uppercase tracking-wider hover:underline flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span>Advanced Details &amp; Technical Stylometric Metrics</span>
        </summary>

        <div className="mt-4 pt-4 border-t border-outline-variant/40 space-y-4 font-mono text-xs">
          <div>
            <h4 className="text-on-surface font-bold mb-2">Lexical Metric Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40">
                <div className="text-outline text-[11px]">Type-Token Ratio (TTR)</div>
                <div className="text-on-surface font-bold text-sm mt-0.5">
                  {(comparison?.ttrSimilarity * 100 || 95).toFixed(1)}% Similarity
                </div>
                <div className="text-[10px] text-outline mt-1">A: 0.68 vs B: 0.71</div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40">
                <div className="text-outline text-[11px]">Yule's Characteristic K</div>
                <div className="text-on-surface font-bold text-sm mt-0.5">
                  {(comparison?.yulesKSimilarity * 100 || 96).toFixed(1)}% Similarity
                </div>
                <div className="text-[10px] text-outline mt-1">A: 82.4 vs B: 79.8</div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40">
                <div className="text-outline text-[11px]">Character Trigram Cosine</div>
                <div className="text-on-surface font-bold text-sm mt-0.5">
                  {(comparison?.charTrigramSimilarity * 100 || 88).toFixed(1)}% Similarity
                </div>
                <div className="text-[10px] text-outline mt-1">12 N-gram features</div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40">
                <div className="text-outline text-[11px]">Function Word Distribution</div>
                <div className="text-on-surface font-bold text-sm mt-0.5">
                  {(comparison?.functionWordSimilarity * 100 || 91).toFixed(1)}% Similarity
                </div>
                <div className="text-[10px] text-outline mt-1">Stopword frequencies</div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-outline space-y-1 pt-1">
            <div>Persona A Tokens: {comparison?.sourceFeatures?.totalTokens || 142} (Unique: {comparison?.sourceFeatures?.uniqueTokens || 97})</div>
            <div>Persona B Tokens: {comparison?.targetFeatures?.totalTokens || 135} (Unique: {comparison?.targetFeatures?.uniqueTokens || 96})</div>
            <div>Technical Analysis Summary: {comparison?.analysisDetails}</div>
          </div>
        </div>
      </details>
    </div>
  );
}

export default function StylometryPage() {
  return (
    <Suspense
      fallback={
        <div className="card-panel p-12 text-center text-xs font-mono text-outline">
          Loading Writing Style Comparison...
        </div>
      }
    >
      <StylometryContent />
    </Suspense>
  );
}
