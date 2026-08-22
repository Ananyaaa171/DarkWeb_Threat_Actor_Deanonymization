'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RelationshipGraph, GraphNode, GraphEdge } from '@/types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Shield,
  User,
  Key,
  Globe,
  Info,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  graph: RelationshipGraph;
}

interface NodePosition {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

export function RelationshipGraphCanvas({ graph }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Compute node positions with radial force-directed layout
  const [positions, setPositions] = useState<Record<string, NodePosition>>({});

  useEffect(() => {
    if (!graph || !graph.nodes || graph.nodes.length === 0) return;

    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    const newPos: Record<string, NodePosition> = {};

    // 1. Center Actor Node
    const actorNodes = graph.nodes.filter((n) => n.type === 'ACTOR');
    actorNodes.forEach((node, i) => {
      newPos[node.id] = { x: centerX + (i - (actorNodes.length - 1) / 2) * 120, y: centerY };
    });

    // 2. Ring 1: Persona Nodes
    const personaNodes = graph.nodes.filter((n) => n.type === 'PERSONA');
    const personaRadius = 160;
    personaNodes.forEach((node, i) => {
      const angle = (i / Math.max(1, personaNodes.length)) * 2 * Math.PI - Math.PI / 2;
      newPos[node.id] = {
        x: centerX + personaRadius * Math.cos(angle),
        y: centerY + personaRadius * Math.sin(angle),
      };
    });

    // 3. Ring 2: Identifiers and Infrastructure
    const leafNodes = graph.nodes.filter((n) => n.type === 'IDENTIFIER' || n.type === 'INFRASTRUCTURE');
    const leafRadius = 260;
    leafNodes.forEach((node, i) => {
      const angle = (i / Math.max(1, leafNodes.length)) * 2 * Math.PI - Math.PI / 4;
      newPos[node.id] = {
        x: centerX + leafRadius * Math.cos(angle),
        y: centerY + leafRadius * Math.sin(angle),
      };
    });

    setPositions(newPos);
    if (graph.nodes.length > 0 && !selectedNode) {
      setSelectedNode(graph.nodes[0]);
    }
  }, [graph]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'ACTOR':
        return { fill: '#1e3a8a', stroke: '#3b82f6', text: '#93c5fd', badge: 'badge-blue' };
      case 'PERSONA':
        return { fill: '#581c87', stroke: '#a855f7', text: '#d8b4fe', badge: 'badge-purple' };
      case 'IDENTIFIER':
        return { fill: '#064e3b', stroke: '#10b981', text: '#6ee7b7', badge: 'badge-emerald' };
      case 'INFRASTRUCTURE':
        return { fill: '#881337', stroke: '#f43f5e', text: '#fda4af', badge: 'badge-rose' };
      default:
        return { fill: '#1e293b', stroke: '#64748b', text: '#cbd5e1', badge: 'badge-blue' };
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'ACTOR':
        return Shield;
      case 'PERSONA':
        return User;
      case 'IDENTIFIER':
        return Key;
      case 'INFRASTRUCTURE':
        return Globe;
      default:
        return Info;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[620px]">
      {/* Interactive Canvas */}
      <div
        ref={containerRef}
        className="lg:col-span-3 soc-card relative overflow-hidden flex flex-col justify-between select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Canvas Toolbar */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-800 p-1.5 rounded-md shadow-lg">
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <span className="text-[11px] font-mono text-slate-400 px-1">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 bg-slate-900/90 backdrop-blur border border-slate-800 p-2 rounded-md text-[10px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Threat Actor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Persona</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Identifier (PGP/Crypto)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Infrastructure (.onion)</span>
          </div>
        </div>

        {/* SVG Graph Viewport */}
        <svg
          className="w-full h-full"
          viewBox="0 0 800 550"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            <marker
              id="arrow-controls"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
            </marker>
            <marker
              id="arrow-migrated"
              viewBox="0 0 10 10"
              refX="24"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
            </marker>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="20"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
            </marker>
          </defs>

          {/* Render Edges */}
          {graph.edges.map((edge) => {
            const p1 = positions[edge.source];
            const p2 = positions[edge.target];
            if (!p1 || !p2) return null;

            const isMigrated = edge.relationship === 'MIGRATED_TO';
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            return (
              <g key={edge.id}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isMigrated ? '#a855f7' : '#334155'}
                  strokeWidth={isMigrated ? 2 : 1.5}
                  strokeDasharray={isMigrated ? '5,5' : undefined}
                  markerEnd={isMigrated ? 'url(#arrow-migrated)' : 'url(#arrow-controls)'}
                />
                {/* Edge Label Badge */}
                <rect
                  x={midX - 35}
                  y={midY - 8}
                  width="70"
                  height="16"
                  rx="4"
                  fill="#0a1024"
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <text
                  x={midX}
                  y={midY + 3}
                  textAnchor="middle"
                  fill={isMigrated ? '#c084fc' : '#94a3b8'}
                  fontSize="7.5"
                  fontFamily="JetBrains Mono"
                >
                  {edge.relationship.replace('_', ' ')}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {graph.nodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;

            const colors = getNodeColor(node.type);
            const isSelected = selectedNode?.id === node.id;
            const isActor = node.type === 'ACTOR';
            const radius = isActor ? 24 : 18;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                }}
                className="cursor-pointer transition-transform duration-150"
              >
                {/* Glow Ring if Selected */}
                {isSelected && (
                  <circle
                    r={radius + 6}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    className="animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={radius}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isSelected ? 3 : 2}
                  filter="drop-shadow(0 2px 6px rgba(0,0,0,0.5))"
                />

                {/* Node Label below */}
                <text
                  y={radius + 14}
                  textAnchor="middle"
                  fill={colors.text}
                  fontSize={isActor ? '10' : '8.5'}
                  fontWeight={isActor ? '600' : '500'}
                  fontFamily="Inter"
                >
                  {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node Inspector Side Panel */}
      <div className="soc-card p-4 flex flex-col justify-between overflow-y-auto">
        {selectedNode ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--soc-border)' }}>
              <div className="flex items-center gap-2">
                <span className={`badge ${getNodeColor(selectedNode.type).badge}`}>
                  {selectedNode.type}
                </span>
                {selectedNode.subType && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedNode.subType}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-400">NODE INSPECTOR</span>
            </div>

            <div>
              <div className="text-xs text-slate-400 uppercase font-mono">Entity Label</div>
              <div className="text-sm font-bold text-white mt-0.5 break-words font-mono">
                {selectedNode.label}
              </div>
            </div>

            {/* Node Properties */}
            <div className="space-y-2 text-xs">
              <div className="text-slate-400 font-mono text-[11px] uppercase">Forensic Properties</div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Node ID:</span>
                  <span className="text-slate-200">{selectedNode.id.substring(0, 12)}...</span>
                </div>
                {selectedNode.data?.category && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-blue-400">{selectedNode.data.category}</span>
                  </div>
                )}
                {selectedNode.data?.platform && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Platform:</span>
                    <span className="text-purple-400">{selectedNode.data.platform}</span>
                  </div>
                )}
                {selectedNode.data?.status && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400">{selectedNode.data.status}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 space-y-2">
              {selectedNode.type === 'ACTOR' && (
                <Link
                  href={`/actors/${selectedNode.id}`}
                  className="soc-btn-primary w-full text-xs justify-center py-2"
                >
                  <span>Open Threat Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}

              {selectedNode.type === 'PERSONA' && (
                <Link
                  href={`/linkage?source=${selectedNode.id}`}
                  className="soc-btn-primary w-full text-xs justify-center py-2 bg-purple-600 hover:bg-purple-700"
                >
                  <span>Run AI Linkage Analysis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}

              <Link
                href={`/timeline`}
                className="soc-btn-secondary w-full text-xs justify-center py-1.5"
              >
                <span>View Timeline History</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 text-xs py-12">
            Click on any graph node to inspect forensic metadata and connected digital footprints.
          </div>
        )}

        <div className="text-[10px] font-mono text-slate-400 text-center pt-3 border-t" style={{ borderColor: 'var(--soc-border)' }}>
          {graph.nodes.length} Nodes • {graph.edges.length} Forensic Edges
        </div>
      </div>
    </div>
  );
}
