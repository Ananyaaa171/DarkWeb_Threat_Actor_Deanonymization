'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
        status: 'Active',
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
        status: 'Migrated',
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
        status: 'Active',
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
        status: 'Verified',
        fingerprint: '94F8 2B31 8AC4 701E D5E2 1198 4A72 B5C1 09E8 33DF',
        algorithm: 'RSA-4096',
      },
    },
    {
      id: 'node-id-btc',
      label: 'Bitcoin: bc1qxy2kg...',
      type: 'IDENTIFIER',
      subType: 'CRYPTO_WALLET',
      data: {
        confidence: 95.0,
        status: 'Active Deposit',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        balance: '28.45 BTC',
      },
    },
    {
      id: 'node-infra-onion',
      label: 'Tor Onion Mirror v3',
      type: 'INFRASTRUCTURE',
      subType: 'ONION_V3',
      data: {
        confidence: 90.0,
        status: 'Online',
        url: 'http://lockbit7z275w3k3jshv5729fksu627ahskd8276f5skdl27f6sjd8.onion',
        ip: '185.220.101.44 (AS200651)',
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

function getSimpleTypeLabel(type: string): string {
  switch (type) {
    case 'ACTOR':
      return 'Threat Actor';
    case 'PERSONA':
      return 'Online Persona';
    case 'IDENTIFIER':
      return 'Identifier';
    case 'INFRASTRUCTURE':
      return 'Infrastructure';
    case 'EVIDENCE':
      return 'Evidence';
    default:
      return type.replace(/_/g, ' ');
  }
}

function getRelationshipLabel(rel: string): string {
  switch (rel) {
    case 'CONTROLS':
      return 'Operates';
    case 'USES_IDENTIFIER':
      return 'Uses Identifier';
    case 'OPERATES_INFRASTRUCTURE':
      return 'Hosts On';
    case 'MIGRATED_TO':
      return 'Migrated To';
    default:
      return rel.replace(/_/g, ' ');
  }
}

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
    'node-actor': { x: 420, y: 260 },
    'node-p1': { x: 220, y: 150 },
    'node-p2': { x: 220, y: 390 },
    'node-id-pgp': { x: 620, y: 160 },
    'node-id-btc': { x: 620, y: 370 },
    'node-infra-onion': { x: 420, y: 470 },
  };

  const getNodePos = (id: string, idx: number) => {
    if (nodePositions[id]) return nodePositions[id];
    const angle = (idx / (graph.nodes.length || 1)) * 2 * Math.PI;
    return {
      x: 420 + 220 * Math.cos(angle),
      y: 280 + 180 * Math.sin(angle),
    };
  };

  // Find related entities for selected node
  const relatedEdges = selectedNode
    ? graph.edges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];

  const relatedEntities = relatedEdges.map((e) => {
    const isSource = e.source === selectedNode?.id;
    const otherNodeId = isSource ? e.target : e.source;
    const otherNode = graph.nodes.find((n) => n.id === otherNodeId);
    return {
      node: otherNode,
      relationship: getRelationshipLabel(e.relationship),
      confidence: e.confidence,
    };
  });

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -m-margin-desktop overflow-hidden relative">
      {/* Top Controls Bar */}
      <div className="bg-surface-dim px-6 py-2.5 border-b border-outline-variant/60 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
          <span className="font-mono text-sm font-bold text-on-surface">
            Relationship Graph
          </span>
          <span
            className={`px-2 py-0.5 rounded border font-mono text-[10px] font-bold ${
              isLiveApi
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {isLiveApi ? 'Live Network Topology' : 'Reference Case Study'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/actors/2bee3f4c-1923-40da-a2e9-78b9a1e9eb79"
            className="btn-secondary px-3 py-1 text-xs font-mono font-medium"
          >
            <span>LockBit Syndicate</span>
          </Link>
          <Link
            href="/linkage"
            className="btn-primary px-3 py-1 text-xs font-semibold flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span>Connection Analysis</span>
          </Link>
        </div>
      </div>

      {/* Main Canvas & Inspector Area */}
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
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#424754" />
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
                      className="font-mono"
                      textAnchor="middle"
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 5}
                    >
                      {getRelationshipLabel(edge.relationship)}
                    </text>
                  );
                })}
              </g>
            </svg>

            {/* Nodes Rendered on Canvas */}
            {graph.nodes.map((node, idx) => {
              const pos = getNodePos(node.id, idx);
              const isSelected = selectedNode?.id === node.id;
              const simpleType = getSimpleTypeLabel(node.type);

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
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center shadow-[0_0_18px_rgba(244,63,94,0.35)]">
                      <span
                        className="material-symbols-outlined text-rose-400 text-[32px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        shield
                      </span>
                    </div>
                  )}

                  {node.type === 'PERSONA' && (
                    <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shadow-[0_0_12px_rgba(183,200,225,0.25)]">
                      <span className="material-symbols-outlined text-primary text-[24px]">
                        person
                      </span>
                    </div>
                  )}

                  {node.type === 'IDENTIFIER' && (
                    <div className="w-12 h-12 rotate-45 bg-tertiary/20 border-2 border-tertiary flex items-center justify-center shadow-[0_0_12px_rgba(255,183,134,0.3)]">
                      <span className="material-symbols-outlined -rotate-45 text-tertiary text-[22px]">
                        key
                      </span>
                    </div>
                  )}

                  {node.type === 'INFRASTRUCTURE' && (
                    <div className="w-12 h-12 rounded-lg bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(173,198,255,0.3)]">
                      <span className="material-symbols-outlined text-cyan-400 text-[22px]">
                        dns
                      </span>
                    </div>
                  )}

                  {node.type === 'EVIDENCE' && (
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                      <span className="material-symbols-outlined text-emerald-400 text-[22px]">
                        fact_check
                      </span>
                    </div>
                  )}

                  {/* Node Label Badge */}
                  <div
                    className={`mt-2 px-2.5 py-1 rounded-lg border text-center whitespace-nowrap shadow-sm ${
                      isSelected
                        ? 'bg-surface-container-highest border-primary text-primary ring-1 ring-primary'
                        : 'bg-surface-container-high border-outline-variant/60 text-on-surface'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold">{node.label}</div>
                    <div className="font-mono text-[10px] text-outline">
                      {simpleType} • {Number(node.data?.confidence || 90).toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Controls (Zoom / Pan) */}
          <div className="absolute bottom-6 left-6 flex space-x-2 z-20">
            <div className="bg-surface-container-high border border-outline-variant/60 rounded-lg flex shadow-xl">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
                className="p-2 hover:bg-surface-variant transition-colors border-r border-outline-variant/60 text-on-surface-variant hover:text-on-surface cursor-pointer"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[20px]">zoom_in</span>
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-2 hover:bg-surface-variant transition-colors border-r border-outline-variant/60 text-on-surface-variant hover:text-on-surface cursor-pointer"
                title="Reset Zoom"
              >
                <span className="material-symbols-outlined text-[20px]">fit_screen</span>
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
                className="p-2 hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface cursor-pointer"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[20px]">zoom_out</span>
              </button>
            </div>
          </div>

          {/* Simple Visual Legend (Top Left) */}
          <div className="absolute top-6 left-6 bg-surface-container-high/95 backdrop-blur border border-outline-variant/60 rounded-xl p-4 shadow-xl flex flex-col space-y-2.5 z-20">
            <div className="font-mono text-[10px] font-bold text-outline uppercase tracking-wider">
              Node Type Legend
            </div>
            <div className="flex items-center space-x-2.5">
              <div className="w-3.5 h-3.5 rounded-full border border-rose-400 bg-rose-500/40" />
              <span className="font-mono text-xs text-on-surface font-semibold">Threat Actor</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <div className="w-3.5 h-3.5 rounded-full border border-primary bg-primary/40" />
              <span className="font-mono text-xs text-on-surface font-semibold">Online Persona</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <div className="w-3.5 h-3.5 rotate-45 border border-tertiary bg-tertiary/40 ml-0.5" />
              <span className="font-mono text-xs text-on-surface font-semibold ml-0.5">Identifier</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <div className="w-3.5 h-3.5 rounded-sm border border-cyan-400 bg-cyan-500/40" />
              <span className="font-mono text-xs text-on-surface font-semibold">Infrastructure</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <div className="w-3.5 h-3.5 rounded-sm border border-emerald-400 bg-emerald-500/40" />
              <span className="font-mono text-xs text-on-surface font-semibold">Evidence</span>
            </div>
          </div>
        </div>

        {/* Right Side Panel: Clean Node Inspector */}
        <aside className="w-[340px] bg-surface-container border-l border-outline-variant/60 flex flex-col flex-shrink-0 shadow-2xl z-20 overflow-y-auto">
          {/* Panel Header */}
          <div className="p-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-dim">
            <h2 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
              Node Details
            </h2>
            <span className="font-mono text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/30">
              SELECTED
            </span>
          </div>

          {/* Panel Content */}
          <div className="flex-1 p-5 space-y-5">
            {selectedNode ? (
              <>
                {/* 1. Identity / Node Header */}
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/60 flex flex-shrink-0 items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">
                      {selectedNode.type === 'ACTOR'
                        ? 'shield'
                        : selectedNode.type === 'PERSONA'
                        ? 'person'
                        : selectedNode.type === 'IDENTIFIER'
                        ? 'key'
                        : selectedNode.type === 'INFRASTRUCTURE'
                        ? 'dns'
                        : 'fact_check'}
                    </span>
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-mono text-[10px] font-bold uppercase tracking-wider">
                      {getSimpleTypeLabel(selectedNode.type)}
                    </span>
                    <h3 className="font-bold text-on-surface text-base break-all font-mono mt-1 leading-tight">
                      {selectedNode.label}
                    </h3>
                  </div>
                </div>

                {/* 2. Status & Connection Confidence */}
                <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-0.5">
                    <span className="text-[10px] text-outline uppercase font-bold">Status</span>
                    <span className="font-bold text-emerald-400">
                      {selectedNode.data?.status || 'Active'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-0.5">
                    <span className="text-[10px] text-outline uppercase font-bold">Confidence</span>
                    <span className="font-bold text-primary">
                      {Number(selectedNode.data?.confidence || 90).toFixed(0)}% Match
                    </span>
                  </div>
                </div>

                {/* 3. Related Entities Section */}
                <div className="space-y-2 pt-2 border-t border-outline-variant/40">
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                    <span>Related Entities</span>
                    <span className="text-outline text-[11px]">({relatedEntities.length})</span>
                  </div>

                  <div className="space-y-2">
                    {relatedEntities.map((rel, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="material-symbols-outlined text-outline text-[16px] shrink-0">
                            arrow_right_alt
                          </span>
                          <div className="truncate font-mono text-xs">
                            <div className="text-on-surface font-semibold truncate">
                              {rel.node?.label || 'Connected Node'}
                            </div>
                            <div className="text-[10px] text-outline">
                              {rel.relationship} • {getSimpleTypeLabel(rel.node?.type || '')}
                            </div>
                          </div>
                        </div>
                        {rel.confidence && (
                          <span className="text-emerald-400 font-mono text-[10px] font-bold shrink-0">
                            {Number(rel.confidence).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Additional Node Attributes */}
                <div className="space-y-2 pt-2 border-t border-outline-variant/40">
                  <div className="font-mono text-xs text-outline font-bold uppercase tracking-wider">
                    Additional Attributes
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl p-3 space-y-1.5 font-mono text-[11px] border border-outline-variant/40">
                    {selectedNode.data &&
                      Object.entries(selectedNode.data)
                        .filter(([k]) => k !== 'confidence' && k !== 'status')
                        .map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <span className="text-outline uppercase text-[10px]">{k}:</span>
                            <span className="text-on-surface font-semibold truncate select-all">
                              {String(v)}
                            </span>
                          </div>
                        ))}
                  </div>
                </div>

                {/* 5. Quick Actions */}
                <div className="space-y-2 pt-2">
                  <Link
                    href={`/linkage`}
                    className="btn-primary w-full justify-center py-2 text-xs font-mono font-semibold"
                  >
                    <span>Analyze Persona Connections</span>
                  </Link>
                  <Link
                    href={`/actors/${actorId}`}
                    className="btn-secondary w-full justify-center py-2 text-xs font-mono"
                  >
                    <span>Open Threat Actor Dossier</span>
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
