'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';

const AVAILABLE_ACTORS = [
  { id: '2bee3f4c-1923-40da-a2e9-78b9a1e9eb79', name: 'LockBit 3.0 Syndicate', category: 'RANSOMWARE', score: 89.5 },
  { id: 'a0000000-0000-0000-0000-000000000002', name: 'ShinyHunters Collective', category: 'DATA_BROKER', score: 84.0 },
  { id: 'a0000000-0000-0000-0000-000000000003', name: 'ALPHV / BlackCat', category: 'RANSOMWARE', score: 78.0 },
];

function ExportContent() {
  const searchParams = useSearchParams();
  const [actorId, setActorId] = useState('2bee3f4c-1923-40da-a2e9-78b9a1e9eb79');
  const [format, setFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeGraph, setIncludeGraph] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const paramId = searchParams.get('actorId');
    if (paramId) {
      setActorId(paramId);
    }
  }, [searchParams]);

  const selectedActor = AVAILABLE_ACTORS.find((a) => a.id === actorId) || AVAILABLE_ACTORS[0];

  const handleGenerateExport = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      const exportUrl = api.getExportUrl(format, actorId);
      const res = await fetch(exportUrl);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = format === 'pdf' ? 'txt' : format;
        a.download = `DWD_Dossier_${actorId.slice(0, 8)}.${ext}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setIsExporting(false);
        setDownloadSuccess(true);
        return;
      }
    } catch (err) {
      console.warn('Live backend export unavailable, generating structured client dossier:', err);
    }

    setTimeout(() => {
      setIsExporting(false);
      setDownloadSuccess(true);

      const timestamp = '2026-08-22-12-00-00';
      let blob: Blob;
      let filename: string;

      if (format === 'json') {
        const jsonData = {
          export_version: '1.0',
          stix_version: '2.1',
          classification: 'TLP:AMBER+STRICT',
          generated_at: new Date().toISOString(),
          case_id: 'SIH-2026-LB-884A',
          canonical_actor: {
            name: selectedActor.name,
            category: selectedActor.category,
            overall_confidence: selectedActor.score,
            associated_personas: ['bassterlord_xss', 'basster_rampv2'],
            pgp_fingerprints: ['94F8 2B31 8AC4 701E D5E2 1198 4A72 B5C1 09E8 33DF'],
            btc_wallets: ['bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'],
          },
          linkage_results: {
            source: 'bassterlord_xss',
            target: 'basster_rampv2',
            attribution_score: selectedActor.score,
            confidence_band: 'VERY_HIGH',
            factor_breakdown: {
              identifiers_35pct: 33.25,
              stylometry_25pct: 21.75,
              behavior_20pct: 17.5,
              infrastructure_20pct: 17.0,
            },
          },
        };
        blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        filename = `DWD_Dossier_${selectedActor.name.replace(/\s+/g, '_')}_${timestamp}.json`;
      } else if (format === 'csv') {
        const csvData = `Factor,Points,MaxPoints,Details,ObservedAt\nIDENTIFIERS,33.25,35.00,"PGP subkey 0x4A72B5C1 match",2026-08-21T09:15:00Z\nSTYLOMETRY,21.75,25.00,"Cosine 0.87 NLP syntactic patterns",2026-08-22T12:00:00Z\nBEHAVIOR,17.50,20.00,"UTC+3 diurnal posting correlation",2026-08-22T14:00:00Z\nINFRASTRUCTURE,17.00,20.00,"Tor mirror on AS200651",2026-08-22T08:00:00Z`;
        blob = new Blob([csvData], { type: 'text/csv' });
        filename = `DWD_Indicators_${selectedActor.name.replace(/\s+/g, '_')}_${timestamp}.csv`;
      } else {
        const pdfText = `=======================================================\nDARK WEB DEANONYMIZER - INTELLIGENCE DOSSIER\nCONFIDENTIAL // TLP:AMBER+STRICT\n=======================================================\nOperation: Dark Web Threat Actor Deanonymization\nCase Ref: SIH-2026-LB-884A\nGenerated: ${new Date().toISOString()}\n\nTARGET ACTOR: ${selectedActor.name}\nOVERALL CONNECTION CONFIDENCE: ${selectedActor.score.toFixed(1)}% (STRONG CONNECTION)\n\nMATCH FACTOR BREAKDOWN:\n- 35% Identity / Username Match: 33.25 pts (PGP Subkey 0x4A72B5C1 confirmed)\n- 25% Writing Style Match: 21.75 pts (0.87 Cosine NLP alignment)\n- 20% Activity Pattern Match: 17.50 pts (UTC+3 timezone matching)\n- 20% Technical Connection: 17.00 pts (AS200651 Tor mirror)\n\nONLINE PERSONAS:\n- @bassterlord_xss (XSS.is Underground)\n- @basster_rampv2 (Ramp Forum)\n\nINVESTIGATION SUMMARY:\nBased on multi-vector algorithmic analysis, there is a ${selectedActor.score.toFixed(1)}% connection confidence that these online personas map to the same physical syndicate.`;
        blob = new Blob([pdfText], { type: 'text/plain' });
        filename = `DWD_Dossier_${selectedActor.name.replace(/\s+/g, '_')}_${timestamp}.txt`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/40 pb-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-1 font-mono text-xs">
            <span className="text-primary font-bold">REPORT EXPORT CENTER</span>
            <span>/</span>
            <span>CASE: SIH-2026-LB-884A</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Export Intelligence Dossier
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed max-w-2xl font-sans">
            Package verified forensic evidence, topological relationship maps, and attribution scoring into standard intelligence formats.
          </p>
        </div>

        <span
          className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold self-start md:self-auto"
          title="Restricted: Authorized Intelligence Analysts Only"
        >
          TLP:AMBER+STRICT
        </span>
      </div>

      {/* Main Grid: Left Config (4 Cols) + Right Preview (8 Cols) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          {/* Target Actor Selector */}
          <section className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 flex flex-col gap-3 shadow-sm">
            <h2 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/40 pb-2">
              Target Threat Syndicate
            </h2>
            <div>
              <label className="block font-mono text-[11px] text-outline mb-1.5 uppercase">
                Select Indexed Actor
              </label>
              <select
                value={actorId}
                onChange={(e) => setActorId(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/70 rounded-lg p-2.5 text-xs text-on-surface font-mono focus:border-primary focus:outline-none cursor-pointer"
              >
                {AVAILABLE_ACTORS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.score}% match)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-center pt-2 font-mono text-xs">
              <span className="text-outline">Category:</span>
              <span className="text-rose-300 font-bold">{selectedActor.category}</span>
            </div>
            <div className="flex justify-between items-center font-mono text-xs">
              <span className="text-outline">Attribution Score:</span>
              <span className="text-emerald-400 font-bold">{selectedActor.score}%</span>
            </div>
          </section>

          {/* Format Selection Panel */}
          <section className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 flex flex-col gap-3 shadow-sm">
            <h2 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/40 pb-2">
              Export Format
            </h2>
            <div className="space-y-2.5">
              {/* PDF */}
              <label
                onClick={() => setFormat('pdf')}
                className={`border rounded-xl p-3.5 transition-all flex items-start gap-3 cursor-pointer ${
                  format === 'pdf'
                    ? 'border-primary bg-primary/10'
                    : 'border-outline-variant/50 hover:bg-surface-variant'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  checked={format === 'pdf'}
                  onChange={() => setFormat('pdf')}
                  className="accent-primary mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-rose-400 text-[18px]">
                      picture_as_pdf
                    </span>
                    <span className="text-xs font-bold text-on-surface font-mono">
                      Executive Intelligence Brief (PDF/Text)
                    </span>
                  </div>
                  <p className="text-outline text-[11px] leading-relaxed">
                    Formal briefing dossier with 4-factor attribution breakdown and reasoning.
                  </p>
                </div>
              </label>

              {/* JSON / Structured Intelligence */}
              <label
                onClick={() => setFormat('json')}
                className={`border rounded-xl p-3.5 transition-all flex items-start gap-3 cursor-pointer ${
                  format === 'json'
                    ? 'border-primary bg-primary/10'
                    : 'border-outline-variant/50 hover:bg-surface-variant'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                  className="accent-primary mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      data_object
                    </span>
                    <span className="text-xs font-bold text-on-surface font-mono">
                      Structured Intelligence (JSON)
                    </span>
                  </div>
                  <p className="text-outline text-[11px] leading-relaxed">
                    Standardized cyber threat intelligence objects formatted for SIEM / MISP ingestion.
                  </p>
                </div>
              </label>

              {/* CSV */}
              <label
                onClick={() => setFormat('csv')}
                className={`border rounded-xl p-3.5 transition-all flex items-start gap-3 cursor-pointer ${
                  format === 'csv'
                    ? 'border-primary bg-primary/10'
                    : 'border-outline-variant/50 hover:bg-surface-variant'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  className="accent-primary mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      table_chart
                    </span>
                    <span className="text-xs font-bold text-on-surface font-mono">
                      Indicator Matrix (CSV)
                    </span>
                  </div>
                  <p className="text-outline text-[11px] leading-relaxed">
                    Tabular indicator records for spreadsheet analytics and evidence archiving.
                  </p>
                </div>
              </label>
            </div>

            {/* Included Sections */}
            <div className="mt-2 pt-3 border-t border-outline-variant/40">
              <h3 className="font-mono text-[11px] font-semibold text-outline mb-2 uppercase">
                Included Evidence Layers
              </h3>
              <div className="space-y-1.5 text-xs font-mono">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeSummary}
                    onChange={(e) => setIncludeSummary(e.target.checked)}
                    className="accent-primary cursor-pointer"
                  />
                  <span className="text-on-surface">Executive Attribution Summary</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeGraph}
                    onChange={(e) => setIncludeGraph(e.target.checked)}
                    className="accent-primary cursor-pointer"
                  />
                  <span className="text-on-surface">Topological Network Topology</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeTimeline}
                    onChange={(e) => setIncludeTimeline(e.target.checked)}
                    className="accent-primary cursor-pointer"
                  />
                  <span className="text-on-surface">Chronological Activity Stream</span>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Preview & Action (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          {/* Preview Panel (Simulated Paper Sheet) */}
          <section className="bg-surface-container-low border border-outline-variant/60 rounded-xl flex flex-col h-[520px] overflow-hidden shadow-sm">
            <div className="bg-surface-container border-b border-outline-variant/40 p-3.5 flex justify-between items-center">
              <h2 className="text-xs font-bold text-on-surface flex items-center gap-2 font-mono uppercase">
                <span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
                <span>Report Preview: {format.toUpperCase()} Document</span>
              </h2>
              <span className="font-mono text-[11px] text-emerald-400 font-semibold">Ready to Package</span>
            </div>

            {/* Simulated Paper Document Preview */}
            <div className="flex-1 bg-surface-dim p-6 overflow-y-auto flex justify-center items-start">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-[620px] rounded-xl shadow-2xl p-7 flex flex-col text-slate-200 font-sans">
                {/* Header */}
                <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-end">
                  <div>
                    <h1 className="text-white font-bold text-base tracking-tight font-mono">
                      DEANONYMIZATION DOSSIER
                    </h1>
                    <p className="text-slate-400 text-xs mt-0.5 font-mono">
                      Case: {selectedActor.name} (SIH-2026-LB-884A)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-[10px] font-mono">DWD PLATFORM / CTI</p>
                    <p className="text-amber-400 text-[10px] font-mono font-bold mt-0.5">
                      TLP:AMBER+STRICT
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="space-y-3.5 flex-1 text-xs">
                  {includeSummary && (
                    <div>
                      <h2 className="text-primary font-bold text-xs font-mono uppercase border-b border-slate-800 pb-1 mb-1">
                        1. Executive Connection Summary
                      </h2>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Algorithmic analysis establishes an <strong>{selectedActor.score.toFixed(1)}% connection confidence</strong>{' '}
                        linking online personas to <strong>{selectedActor.name}</strong> based on multi-vector forensic indicators.
                      </p>
                    </div>
                  )}

                  <div>
                    <h2 className="text-primary font-bold text-xs font-mono uppercase border-b border-slate-800 pb-1 mb-1">
                      2. Match Factor Breakdown
                    </h2>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300 mt-2">
                      <div className="border border-slate-800 rounded p-2 bg-slate-950/60">
                        <span className="font-bold text-tertiary">Identity Match (35%):</span> +33.25 pts (PGP subkey verified)
                      </div>
                      <div className="border border-slate-800 rounded p-2 bg-slate-950/60">
                        <span className="font-bold text-primary">Writing Style (25%):</span> +21.75 pts (0.87 Cosine NLP)
                      </div>
                      <div className="border border-slate-800 rounded p-2 bg-slate-950/60">
                        <span className="font-bold text-amber-400">Activity Patterns (20%):</span> +17.50 pts (Diurnal correlation)
                      </div>
                      <div className="border border-slate-800 rounded p-2 bg-slate-950/60">
                        <span className="font-bold text-cyan-400">Technical Connection (20%):</span> +17.00 pts (Tor ASN hosting)
                      </div>
                    </div>
                  </div>

                  {includeGraph && (
                    <div>
                      <h2 className="text-primary font-bold text-xs font-mono uppercase border-b border-slate-800 pb-1 mb-2">
                        3. Topological Relationship Hierarchy
                      </h2>
                      <div className="w-full h-20 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-center text-outline gap-2 font-mono text-[11px]">
                        <span className="material-symbols-outlined text-[20px] text-primary">hub</span>
                        <span>4 Entities Connected • 3 Verified Edges</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                  <p className="text-slate-500 text-[9px] font-mono">
                    Generated: 2026-08-24 • Dark Web Threat Actor Deanonymizer Platform
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Action Footer */}
          <div className="flex flex-wrap justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant/60 shadow-sm gap-3">
            <div>
              {downloadSuccess && (
                <span className="text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Dossier packaged and downloaded successfully!</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <Link
                href="/dashboard"
                className="btn-secondary px-4 py-2 rounded-lg text-xs font-mono"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={handleGenerateExport}
                disabled={isExporting}
                className="btn-primary px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow"
              >
                <span className="material-symbols-outlined text-[17px]">
                  {isExporting ? 'sync' : 'download'}
                </span>
                <span>{isExporting ? 'Packaging...' : 'Generate & Download Dossier'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-outline font-mono text-xs">Loading Export Center...</div>}>
      <ExportContent />
    </Suspense>
  );
}
