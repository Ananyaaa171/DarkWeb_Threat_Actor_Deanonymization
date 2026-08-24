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
  ChevronRight,
  FileCheck,
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

    // 3. Ring 2: Identifiers, Infrastructure, and Evidence
    const leafNodes = graph.nodes.filter(
      (n) => n.type === 'IDENTIFIER' || n.type === 'INFRASTRUCTURE' || n.type === 'EVIDENCE'
    );
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
      case 'EVIDENCE':
        return { fill: '#065f46', stroke: '#34d399', text: '#a7f3d0', badge: 'badge-emerald' };
      default:
        return { fill: '#1e293b', stroke: '#64748b', text: '#cbd5e1', badge: 'badge-blue' };
    }
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[620px]">
      {/* Interactive Canvas */}
      <div
        ref={containerRef}
        className="lg:col-span-3 card-panel relative overflow-hidden flex flex-col justify-between select-none cursor-grab active:cursor-grabbing bg-surface-container-low border border-outline-variant/60 rounded-xl"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Canvas Toolbar */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-surface-container/95 backdrop-blur border border-outline-variant/60 p-1.5 rounded-lg shadow-lg">
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant hover:text-on-surface"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
            className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant hover:text-on-surface"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant hover:text-on-surface"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-outline-variant mx-1" />
          <span className="text-[11px] font-mono text-outline px-1">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2.5 bg-surface-container/95 backdrop-blur border border-outline-variant/60 p-2.5 rounded-xl text-xs font-mono text-on-surface shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-semibold">Threat Actor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="font-semibold">Online Persona</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-tertiary" />
            <span className="font-semibold">Identifier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
            <span className="font-semibold">Infrastructure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
            <span className="font-semibold">Evidence</span>
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
                  x={midX - 40}
                  y={midY - 8}
                  width="80"
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
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                >
                  {getRelationshipLabel(edge.relationship)}
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
            const simpleType = getSimpleTypeLabel(node.type);

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
                  {node.label.length > 22 ? node.label.substring(0, 20) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node Inspector Side Panel */}
      <div className="card-panel p-5 flex flex-col justify-between overflow-y-auto bg-surface-container border border-outline-variant/60 rounded-xl shadow-lg">
        {selectedNode ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-mono text-[10px] font-bold uppercase tracking-wider">
                {getSimpleTypeLabel(selectedNode.type)}
              </span>
              <span className="text-[10px] font-mono text-outline font-bold">NODE DETAILS</span>
            </div>

            {/* Name */}
            <div>
              <div className="text-[11px] text-outline uppercase font-mono font-bold">Entity Name</div>
              <div className="text-base font-bold text-on-surface mt-0.5 break-words font-mono">
                {selectedNode.label}
              </div>
            </div>

            {/* Status & Connection Confidence */}
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-0.5">
                <span className="text-[10px] text-outline uppercase font-bold">Status</span>
                <span className="font-bold text-emerald-400">
                  {selectedNode.data?.status || 'Active'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-0.5">
                <span className="text-[10px] text-outline uppercase font-bold">Confidence</span>
                <span className="font-bold text-primary">
                  {Number(selectedNode.data?.confidence || 90).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Related Entities */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/40">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                <span>Related Entities</span>
                <span className="text-outline text-[11px]">({relatedEntities.length})</span>
              </div>

              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {relatedEntities.map((rel, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 flex items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div className="truncate">
                      <div className="text-on-surface font-semibold truncate">
                        {rel.node?.label || 'Connected Node'}
                      </div>
                      <div className="text-[10px] text-outline">
                        {rel.relationship} • {getSimpleTypeLabel(rel.node?.type || '')}
                      </div>
                    </div>
                    {rel.confidence && (
                      <span className="text-emerald-400 text-[10px] font-bold shrink-0">
                        {Number(rel.confidence).toFixed(0)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 space-y-2">
              {selectedNode.type === 'ACTOR' && (
                <Link
                  href={`/actors/${selectedNode.id}`}
                  className="btn-primary w-full text-xs justify-center py-2 flex items-center gap-1.5"
                >
                  <span>Open Threat Actor Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}

              {selectedNode.type === 'PERSONA' && (
                <Link
                  href={`/linkage?source=${selectedNode.id}`}
                  className="btn-primary w-full text-xs justify-center py-2 flex items-center gap-1.5"
                >
                  <span>Analyze Persona Connections</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}

              <Link
                href={`/timeline`}
                className="btn-secondary w-full text-xs justify-center py-1.5 flex items-center gap-1.5 font-mono"
              >
                <span>View Timeline History</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center text-outline text-xs py-12 font-mono">
            Click on any graph node to inspect indicators and relationships.
          </div>
        )}

        <div className="text-[10px] font-mono text-outline text-center pt-3 border-t border-outline-variant/40">
          {graph.nodes.length} Nodes • {graph.edges.length} Relationships
        </div>
      </div>
    </div>
  );
}
