'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { GraphNode, GraphEdge, RelationshipGraph } from '@/types';

const FALLBACK_GRAPH: RelationshipGraph = {
  actorId: '2bee3f4c-1923-40da-a2e9-78b9a1e9eb79',
  actorName: 'LockBit 3.0 Syndicate',
  nodes: [
    {
      id: 'node-actor',
      label: 'LockBit 3.0 Syndicate',
      type: 'ACTOR',
      subType: 'RANSOMWARE',
      data: {
        confidence: 92.5,
        motive: 'Financial Extortion',
        firstSeen: '2022-06-15',
        status: 'ACTIVE',
      },
    },
    {
      id: 'node-p1',
      label: '@bassterlord_xss',
      type: 'PERSONA',
      subType: 'FORUM_USER',
      data: {
        confidence: 98.0,
        platform: 'XSS.is Underground',
        reputation: '98.5%',
        role: 'Affiliate Recruitment',
      },
    },
    {
      id: 'node-p2',
      label: '@basster_rampv2',
      type: 'PERSONA',
      subType: 'FORUM_USER',
      data: {
        confidence: 94.0,
        platform: 'Ramp Forum',
        reputation: '94.0%',
        role: 'Migrated Operator',
      },
    },
    {
      id: 'node-id-pgp',
      label: 'PGP: 0x4A72B5C1',
      type: 'IDENTIFIER',
      subType: 'PGP_KEY',
      data: {
        confidence: 99.0,
        fingerprint: '94F8 2B31 8AC4 701E D5E2 1198 4A72 B5C1 09E8 33DF',
        algorithm: 'RSA-4096',
      },
    },
    {
      id: 'node-id-btc',
      label: 'BTC: bc1qxy2kg...',
      type: 'IDENTIFIER',
      subType: 'CRYPTO_WALLET',
      data: {
        confidence: 95.0,
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        balance: '28.45 BTC',
      },
    },
    {
      id: 'node-infra-onion',
      label: 'lockbit7z...onion',
      type: 'INFRASTRUCTURE',
      subType: 'ONION_V3',
      data: {
        confidence: 90.0,
        url: 'http://lockbit7z275w3k3jshv5729fksu627ahskd8276f5skdl27f6sjd8.onion',
        ip: '185.220.101.44',
      },
    },
  ],
  edges: [
    {
      id: 'e1',
      source: 'node-actor',
      target: 'node-p1',
      relationship: 'CONTROLS',
      confidence: 98.0,
      data: { verified: true },
    },
    {
      id: 'e2',
      source: 'node-actor',
      target: 'node-p2',
      relationship: 'CONTROLS',
      confidence: 94.0,
      data: { verified: true },
    },
    {
      id: 'e3',
      source: 'node-p1',
      target: 'node-id-pgp',
      relationship: 'USES_IDENTIFIER',
      confidence: 99.0,
      data: { factor: 'Cryptographic Subkey' },
    },
    {
      id: 'e4',
      source: 'node-p2',
      target: 'node-id-pgp',
      relationship: 'USES_IDENTIFIER',
      confidence: 99.0,
      data: { factor: 'Cryptographic Subkey' },
    },
    {
      id: 'e5',
      source: 'node-p1',
      target: 'node-id-btc',
      relationship: 'USES_IDENTIFIER',
      confidence: 95.0,
      data: { factor: 'Financial Deposit' },
    },
    {
      id: 'e6',
      source: 'node-actor',
      target: 'node-infra-onion',
      relationship: 'OPERATES_INFRASTRUCTURE',
      confidence: 90.0,
      data: { factor: 'Tor Mirror' },
    },
  ],
};

export default function RelationshipGraphPage() {
  const params = useParams();
  const actorId = (params?.id as string) || '2bee3f4c-1923-40da-a2e9-78b9a1e9eb79';

  const [graph, setGraph] = useState<RelationshipGraph>(FALLBACK_GRAPH);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(FALLBACK_GRAPH.nodes[0]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    async function loadGraph() {
      try {
        const res = await api.getActorRelationships(actorId);
        if (res && res.nodes && res.nodes.length > 0) {
          setGraph(res);
          setSelectedNode(res.nodes[0]);
          setIsLiveApi(true);
        } else {
          setGraph(FALLBACK_GRAPH);
          setSelectedNode(FALLBACK_GRAPH.nodes[0]);
          setIsLiveApi(false);
        }
      } catch (err: any) {
        console.warn('Backend graph API offline, using fallback graph topology:', err);
        setGraph(FALLBACK_GRAPH);
        setSelectedNode(FALLBACK_GRAPH.nodes[0]);
        setIsLiveApi(false);
      }
    }
    loadGraph();
  }, [actorId]);

  // Positions on canvas
  const nodePositions: Record<string, { x: number; y: number }> = {
    'node-actor': { x: 380, y: 260 },
    'node-p1': { x: 200, y: 140 },
    'node-p2': { x: 200, y: 380 },
    'node-id-pgp': { x: 600, y: 150 },
    'node-id-btc': { x: 600, y: 360 },
    'node-infra-onion': { x: 420, y: 460 },
  };

  const getNodePos = (id: string, idx: number) => {
    if (nodePositions[id]) return nodePositions[id];
    // Dynamic circular layout fallback
    const angle = (idx / (graph.nodes.length || 1)) * 2 * Math.PI;
    return {
      x: 400 + 220 * Math.cos(angle),
      y: 280 + 180 * Math.sin(angle),
    };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -m-margin-desktop overflow-hidden relative">
      {/* Top Controls Bar */}
      <div className="bg-surface-dim px-6 py-2.5 border-b border-outline-variant flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
          <span className="font-title-sm text-title-sm font-bold text-on-surface">
            Topological Intelligence Graph
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant font-label-caps text-[10px] text-primary">
            {isLiveApi ? 'LIVE GRAPH DATA' : 'DEMO TOPOLOGY'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/actors/2bee3f4c-1923-40da-a2e9-78b9a1e9eb79"
            className="btn-secondary px-3 py-1 text-xs font-label-caps"
          >
            <span>LockBit Syndicate</span>
          </Link>
          <Link
            href="/linkage"
            className="btn-primary px-3 py-1 text-xs font-label-caps flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span>Attribution Linkage</span>
          </Link>
        </div>
      </div>

      {/* Main Canvas & Inspector Area (Exact Stitch Graph Canvas) */}
      <div className="flex-1 relative bg-surface-container-lowest flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden" id="graph-canvas">
          {/* Zoomable Container */}
          <div
            className="w-full h-full relative transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            {/* SVG Connections */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ minWidth: '900px', minHeight: '600px' }}
            >
              <defs>
                <marker
                  id="arrow"
                  markerHeight="6"
                  markerWidth="6"
                  orient="auto-start-reverse"
                  refX="25"
                  refY="5"
                  viewBox="0 0 10 10"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#424754"></path>
                </marker>
              </defs>

              {/* Edge lines */}
              <g fill="none" stroke="#424754" strokeWidth="1.5">
                {graph.edges.map((edge, i) => {
                  const sIdx = graph.nodes.findIndex((n) => n.id === edge.source);
                  const tIdx = graph.nodes.findIndex((n) => n.id === edge.target);
                  const src = getNodePos(edge.source, sIdx);
                  const tgt = getNodePos(edge.target, tIdx);
                  return (
                    <path
                      key={edge.id || i}
                      d={`M ${src.x} ${src.y} Q ${(src.x + tgt.x) / 2 + 10} ${
                        (src.y + tgt.y) / 2 - 10
                      } ${tgt.x} ${tgt.y}`}
                      markerEnd="url(#arrow)"
                    />
                  );
                })}
              </g>

              {/* Edge labels */}
              <g
                fill="#c2c6d6"
                fontFamily="JetBrains Mono"
                fontSize="9"
                fontWeight="700"
                letterSpacing="0.05em"
              >
                {graph.edges.map((edge, i) => {
                  const sIdx = graph.nodes.findIndex((n) => n.id === edge.source);
                  const tIdx = graph.nodes.findIndex((n) => n.id === edge.target);
                  const src = getNodePos(edge.source, sIdx);
                  const tgt = getNodePos(edge.target, tIdx);
                  return (
                    <text
                      key={`lbl-${edge.id || i}`}
                      className="uppercase"
                      textAnchor="middle"
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 5}
                    >
                      {edge.relationship.replace(/_/g, ' ')}
                    </text>
                  );
                })}
              </g>
            </svg>

            {/* Nodes Rendered on Canvas */}
            {graph.nodes.map((node, idx) => {
              const pos = getNodePos(node.id, idx);
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`node-container absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10 transition-transform ${
                    isSelected ? 'scale-110' : 'hover:scale-105'
                  }`}
                  style={{ top: `${pos.y}px`, left: `${pos.x}px` }}
                >
                  {/* Node Icon Avatar */}
                  {node.type === 'ACTOR' && (
                    <div className="w-16 h-16 rounded-full bg-error-container border-2 border-error flex items-center justify-center shadow-[0_0_15px_rgba(255,180,171,0.25)]">
                      <span
                        className="material-symbols-outlined text-error text-[32px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        person_alert
                      </span>
                    </div>
                  )}

                  {node.type === 'PERSONA' && (
                    <div className="w-12 h-12 rounded-full bg-secondary-container border-2 border-secondary flex items-center justify-center shadow-[0_0_10px_rgba(183,200,225,0.2)]">
                      <span className="material-symbols-outlined text-on-secondary-container text-[24px]">
                        face
                      </span>
                    </div>
                  )}

                  {node.type === 'IDENTIFIER' && (
                    <div className="w-12 h-12 rotate-45 bg-tertiary-container border-2 border-tertiary flex items-center justify-center shadow-[0_0_10px_rgba(223,116,18,0.25)]">
                      <span className="material-symbols-outlined -rotate-45 text-on-tertiary-container text-[24px]">
                        tag
                      </span>
                    </div>
                  )}

                  {node.type === 'INFRASTRUCTURE' && (
                    <div className="w-12 h-12 rounded-DEFAULT bg-primary-container border-2 border-primary flex items-center justify-center shadow-[0_0_10px_rgba(173,198,255,0.2)]">
                      <span className="material-symbols-outlined text-on-primary-container text-[24px]">
                        dns
                      </span>
                    </div>
                  )}

                  {/* Node Label Badge */}
                  <div
                    className={`mt-2 px-2.5 py-1 rounded-DEFAULT border text-center whitespace-nowrap ${
                      isSelected
                        ? 'bg-surface-container-highest border-primary text-primary ring-1 ring-primary'
                        : 'bg-surface-container-high border-outline-variant text-on-surface'
                    }`}
                  >
                    <div className="font-label-caps text-xs font-bold">{node.label}</div>
                    <div className="font-data-mono text-[10px] text-outline">
                      {node.type} • {Number(node.data?.confidence || 90).toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Controls (Zoom / Pan) */}
          <div className="absolute bottom-6 left-6 flex space-x-2 z-20">
            <div className="bg-surface-container-high border border-outline-variant rounded flex shadow-lg">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
                className="p-2 hover:bg-surface-variant transition-colors border-r border-outline-variant text-on-surface-variant hover:text-on-surface"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[20px]">zoom_in</span>
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-2 hover:bg-surface-variant transition-colors border-r border-outline-variant text-on-surface-variant hover:text-on-surface"
                title="Reset Zoom"
              >
                <span className="material-symbols-outlined text-[20px]">fit_screen</span>
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
                className="p-2 hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[20px]">zoom_out</span>
              </button>
            </div>
          </div>

          {/* Graph Legend (Top Left) */}
          <div className="absolute top-6 left-6 bg-surface-container-high border border-outline-variant rounded p-3 shadow-lg flex flex-col space-y-2 opacity-90 hover:opacity-100 transition-opacity z-20">
            <div className="font-label-caps text-on-surface-variant text-[11px] font-bold uppercase">
              Entity Types
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rounded-full border border-error bg-error-container"></div>
              <span className="font-data-mono text-[11px] text-on-surface">Threat Actor</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rounded-full border border-secondary bg-secondary-container"></div>
              <span className="font-data-mono text-[11px] text-on-surface">Darknet Persona</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rotate-45 border border-tertiary bg-tertiary-container ml-0.5"></div>
              <span className="font-data-mono text-[11px] text-on-surface ml-1">
                Crypto / PGP Key
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rounded-DEFAULT border border-primary bg-primary-container"></div>
              <span className="font-data-mono text-[11px] text-on-surface">Onion Node</span>
            </div>
          </div>
        </div>

        {/* Right Side Panel: Node Details (Exact Stitch Side Panel) */}
        <aside className="w-[320px] bg-surface-container border-l border-outline-variant flex flex-col flex-shrink-0 shadow-[-5px_0_25px_-5px_rgba(0,0,0,0.5)] z-20 overflow-y-auto">
          {/* Panel Header */}
          <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-dim">
            <h2 className="font-title-sm text-title-sm font-bold text-on-surface">Node Details</h2>
            <span className="font-label-caps text-[10px] text-primary">SELECTED</span>
          </div>

          {/* Panel Content */}
          <div className="flex-1 p-4 space-y-5 font-body-sm">
            {selectedNode ? (
              <>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded bg-surface-container-high border border-outline-variant flex flex-shrink-0 items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">
                      {selectedNode.type === 'ACTOR'
                        ? 'person_alert'
                        : selectedNode.type === 'PERSONA'
                        ? 'face'
                        : selectedNode.type === 'IDENTIFIER'
                        ? 'tag'
                        : 'dns'}
                    </span>
                  </div>
                  <div>
                    <div className="font-data-mono text-[10px] text-primary uppercase tracking-widest mb-0.5">
                      {selectedNode.type}
                    </div>
                    <div className="font-bold text-on-surface text-body-md break-all leading-tight">
                      {selectedNode.label}
                    </div>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-label-caps text-[10px]">
                        Confidence: {Number(selectedNode.data?.confidence || 90).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Properties Table */}
                <div className="space-y-2 pt-2 border-t border-outline-variant">
                  <div className="font-label-caps text-[11px] text-outline font-bold uppercase">
                    Properties & Metadata
                  </div>
                  <div className="bg-surface-dim rounded p-3 space-y-2 font-data-mono text-[11px] border border-outline-variant/40">
                    {selectedNode.data &&
                      Object.entries(selectedNode.data).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-2">
                          <span className="text-outline uppercase">{k}:</span>
                          <span className="text-on-surface font-semibold truncate">{String(v)}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <Link
                    href={`/linkage`}
                    className="btn-primary w-full justify-center py-2 text-xs font-label-caps"
                  >
                    <span>Run AI Persona Linkage</span>
                  </Link>
                  <Link
                    href={`/actors/${actorId}`}
                    className="btn-secondary w-full justify-center py-2 text-xs font-label-caps"
                  >
                    <span>Open Full Dossier</span>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-outline font-mono text-xs">
                Click any node on the graph canvas to inspect indicators and relationships.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
