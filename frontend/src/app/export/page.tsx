'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ExportPage() {
  const [format, setFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeGraph, setIncludeGraph] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleGenerateExport = () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    setTimeout(() => {
      setIsExporting(false);
      setDownloadSuccess(true);

      // Trigger client-side demonstration download
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
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
            name: 'LockBit 3.0 Syndicate',
            category: 'RANSOMWARE',
            overall_confidence: 89.5,
            associated_personas: ['bassterlord_xss', 'basster_rampv2'],
            pgp_fingerprints: ['94F8 2B31 8AC4 701E D5E2 1198 4A72 B5C1 09E8 33DF'],
            btc_wallets: ['bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'],
          },
          linkage_results: {
            source: 'bassterlord_xss',
            target: 'basster_rampv2',
            attribution_score: 89.5,
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
        filename = `DWD_Dossier_LockBit_${timestamp}.json`;
      } else if (format === 'csv') {
        const csvData = `Factor,Points,MaxPoints,Details,ObservedAt\nIDENTIFIERS,33.25,35.00,"PGP subkey 0x4A72B5C1 match",2026-08-21T09:15:00Z\nSTYLOMETRY,21.75,25.00,"Cosine 0.87 NLP syntactic patterns",2026-08-22T12:00:00Z\nBEHAVIOR,17.50,20.00,"UTC+3 diurnal posting correlation",2026-08-22T14:00:00Z\nINFRASTRUCTURE,17.00,20.00,"Tor mirror on AS200651",2026-08-22T08:00:00Z`;
        blob = new Blob([csvData], { type: 'text/csv' });
        filename = `DWD_Indicators_LockBit_${timestamp}.csv`;
      } else {
        // PDF summary text
        const pdfText = `=======================================================\nDARK WEB DEANONYMIZER - COURT-READY DOSSIER REPORT\nCONFIDENTIAL // TLP:AMBER+STRICT\n=======================================================\nOperation: Dark Web Threat Actor Deanonymization\nCase Ref: SIH-2026-LB-884A\nGenerated: ${new Date().toISOString()}\n\nTARGET ACTOR: LockBit 3.0 Syndicate\nOVERALL ATTRIBUTION CONFIDENCE: 89.50% (HIGH-CONFIDENCE LINKAGE)\n\nFACTOR BREAKDOWN (Deterministic Formula):\n- 35% Identifiers Overlap: 33.25 pts (PGP Subkey 0x4A72B5C1 confirmed)\n- 25% Stylometric Similarity: 21.75 pts (0.87 Cosine NLP alignment)\n- 20% Behavioral Alignment: 17.50 pts (UTC+3 timezone matching)\n- 20% Infrastructure Overlap: 17.00 pts (AS200651 Tor mirror)\n\nLINKED PERSONAS:\n- @bassterlord_xss (XSS.is Underground)\n- @basster_rampv2 (Ramp Forum)\n\nGEMINI AI FORENSIC REASONING:\nBased on multi-vector algorithmic analysis, there is an 89.50% confidence level that @bassterlord_xss and @basster_rampv2 represent the same physical operator.`;
        blob = new Blob([pdfText], { type: 'text/plain' });
        filename = `DWD_Executive_Dossier_LockBit_${timestamp}.txt`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/40 pb-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-1 font-label-caps text-xs">
            <span className="text-primary font-bold">EXPORT CENTER</span>
            <span>/</span>
            <span>CASE: SIH-2026-LB-884A</span>
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
            Export Investigation Dossier
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Generate evidentiary reports for authorized cyber law enforcement and threat intelligence teams.
          </p>
        </div>

        <span className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-label-caps text-xs">
          TLP:AMBER+STRICT
        </span>
      </div>

      {/* Main Grid: Left Config (4 Cols) + Right Preview (8 Cols) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Investigation Summary Panel */}
          <section className="bg-surface-container-low border border-outline-variant rounded-lg p-6 flex flex-col gap-4">
            <h2 className="font-title-sm text-title-sm font-bold text-on-surface border-b border-outline-variant pb-2">
              Export Payload Summary
            </h2>
            <div className="space-y-3 font-body-sm text-body-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/40">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">group</span>
                  <span>Target Actors</span>
                </span>
                <span className="font-data-mono text-data-mono text-on-surface font-bold">
                  LockBit 3.0
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/40">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">masks</span>
                  <span>Linked Personas</span>
                </span>
                <span className="font-data-mono text-data-mono text-on-surface">2 Personas</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/40">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">
                    timeline
                  </span>
                  <span>Event Nodes</span>
                </span>
                <span className="font-data-mono text-data-mono text-on-surface">4 Chronological</span>
              </div>

              {/* Confidence Score */}
              <div className="pt-2">
                <div className="flex justify-between items-end mb-1 font-label-caps text-xs">
                  <span className="text-on-surface-variant">Attribution Score</span>
                  <span className="text-primary font-bold">89.5% VERY HIGH</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '89.5%' }} />
                </div>
              </div>
            </div>
          </section>

          {/* Format Selection Panel */}
          <section className="bg-surface-container-low border border-outline-variant rounded-lg p-6 flex flex-col gap-4">
            <h2 className="font-title-sm text-title-sm font-bold text-on-surface border-b border-outline-variant pb-2">
              Format Selection
            </h2>
            <div className="space-y-3">
              {/* PDF */}
              <label
                onClick={() => setFormat('pdf')}
                className={`border rounded-lg p-4 transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                  format === 'pdf'
                    ? 'border-primary bg-surface-container'
                    : 'border-outline-variant hover:bg-surface-variant'
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
                    <span className="material-symbols-outlined text-rose-400 text-[20px]">
                      picture_as_pdf
                    </span>
                    <span className="font-title-sm text-sm font-bold text-on-surface">
                      Court-Ready PDF Dossier
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    Comprehensive intelligence brief with attribution formula, visual graphs, and Gemini AI synthesis.
                  </p>
                </div>
              </label>

              {/* JSON / STIX 2.1 */}
              <label
                onClick={() => setFormat('json')}
                className={`border rounded-lg p-4 transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                  format === 'json'
                    ? 'border-primary bg-surface-container'
                    : 'border-outline-variant hover:bg-surface-variant'
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
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      data_object
                    </span>
                    <span className="font-title-sm text-sm font-bold text-on-surface">
                      Structured STIX 2.1 / JSON
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    Full threat actor graph hierarchy and indicators formatted for SIEM / MISP ingestion.
                  </p>
                </div>
              </label>

              {/* CSV */}
              <label
                onClick={() => setFormat('csv')}
                className={`border rounded-lg p-4 transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                  format === 'csv'
                    ? 'border-primary bg-surface-container'
                    : 'border-outline-variant hover:bg-surface-variant'
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
                    <span className="material-symbols-outlined text-tertiary text-[20px]">
                      table_chart
                    </span>
                    <span className="font-title-sm text-sm font-bold text-on-surface">
                      Flattened CSV Indicators
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    Tabular indicator records for spreadsheet analytics and evidence logging.
                  </p>
                </div>
              </label>
            </div>

            {/* Included Sections */}
            <div className="mt-4 pt-4 border-t border-outline-variant">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase">
                Included Sections
              </h3>
              <div className="space-y-2 font-body-sm text-body-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSummary}
                    onChange={(e) => setIncludeSummary(e.target.checked)}
                    className="accent-primary"
                  />
                  <span className="text-on-surface">Executive AI Summary</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeGraph}
                    onChange={(e) => setIncludeGraph(e.target.checked)}
                    className="accent-primary"
                  />
                  <span className="text-on-surface">Topological Graph Visualizations</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTimeline}
                    onChange={(e) => setIncludeTimeline(e.target.checked)}
                    className="accent-primary"
                  />
                  <span className="text-on-surface">Chronological Activity Log</span>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Preview & Action (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Preview Panel (Simulated Paper Sheet) */}
          <section className="bg-surface-container-low border border-outline-variant rounded-lg flex flex-col h-[560px] overflow-hidden">
            <div className="bg-surface-container border-b border-outline-variant p-4 flex justify-between items-center">
              <h2 className="font-title-sm text-title-sm text-on-surface flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                <span>Preview: {format.toUpperCase()} Intelligence Report</span>
              </h2>
              <span className="font-data-mono text-xs text-outline">Live PDF Engine</span>
            </div>

            {/* Simulated Paper Document Preview */}
            <div className="flex-1 bg-surface-dim p-6 overflow-y-auto flex justify-center items-start">
              <div className="bg-white w-[90%] max-w-[580px] rounded shadow-2xl p-8 flex flex-col text-slate-900 font-sans">
                {/* Paper Header */}
                <div className="border-b-2 border-slate-200 pb-4 mb-5 flex justify-between items-end">
                  <div>
                    <h1 className="text-slate-900 font-bold text-xl tracking-tight">
                      INTELLIGENCE BRIEF
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Case: LockBit 3.0 Attribution (SIH-2026-LB-884A)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-[10px] font-mono">DWD PLATFORM / INTEL DIV</p>
                    <p className="text-rose-600 text-[10px] font-mono font-bold mt-0.5">
                      CONFIDENTIAL / TLP:AMBER
                    </p>
                  </div>
                </div>

                {/* Paper Body */}
                <div className="space-y-4 flex-1 text-xs">
                  {includeSummary && (
                    <div>
                      <h2 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-1 mb-1">
                        1. Executive Attribution Summary
                      </h2>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Algorithmic analysis establishes an <strong>89.50% confidence score</strong>{' '}
                        linking forum persona @bassterlord_xss to @basster_rampv2, attributed to the
                        LockBit 3.0 Syndicate.
                      </p>
                    </div>
                  )}

                  <div>
                    <h2 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-1 mb-1">
                      2. Deterministic 4-Factor Breakdown
                    </h2>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-700 mt-2">
                      <div className="border border-slate-200 rounded p-2 bg-slate-50">
                        <span className="font-bold">Identifiers (35%):</span> +33.25 pts (PGP 0x4A72B5C1)
                      </div>
                      <div className="border border-slate-200 rounded p-2 bg-slate-50">
                        <span className="font-bold">Stylometry (25%):</span> +21.75 pts (0.87 Cosine NLP)
                      </div>
                      <div className="border border-slate-200 rounded p-2 bg-slate-50">
                        <span className="font-bold">Behavior (20%):</span> +17.50 pts (UTC+3 MSK)
                      </div>
                      <div className="border border-slate-200 rounded p-2 bg-slate-50">
                        <span className="font-bold">Infrastructure (20%):</span> +17.00 pts (AS200651)
                      </div>
                    </div>
                  </div>

                  {includeGraph && (
                    <div>
                      <h2 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-1 mb-2">
                        3. Topological Relationship Map
                      </h2>
                      <div className="w-full h-24 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-3xl">hub</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Paper Footer */}
                <div className="mt-6 pt-3 border-t border-slate-200 text-center">
                  <p className="text-slate-400 text-[9px] font-mono">
                    Generated: {new Date().toISOString()} • Page 1 of 6 • Smart India Hackathon
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Action Footer */}
          <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-lg border border-outline-variant">
            <div>
              {downloadSuccess && (
                <span className="text-emerald-400 font-label-caps text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Export generated successfully &amp; downloaded!</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="btn-secondary px-5 py-2 rounded text-body-sm font-body-sm"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={handleGenerateExport}
                disabled={isExporting}
                className="btn-primary px-6 py-2 rounded font-body-sm text-body-sm font-semibold flex items-center gap-2 shadow-lg"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isExporting ? 'sync' : 'download'}
                </span>
                <span>{isExporting ? 'Packaging...' : 'Generate Export'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
