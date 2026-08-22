'use client';

import React from 'react';
import { TimelineEvent } from '@/types';
import { formatIsoDate, formatIsoTime } from '@/utils/formatters';
import {
  MessageSquare,
  ShieldAlert,
  Coins,
  Globe,
  Radio,
  Clock,
  ExternalLink,
  Tag,
} from 'lucide-react';

interface Props {
  events: TimelineEvent[];
  emptyMessage?: string;
}

export function TimelineFeed({ events, emptyMessage = 'No timeline events recorded.' }: Props) {
  if (!events || events.length === 0) {
    return (
      <div className="soc-card p-8 text-center text-slate-400 text-xs">
        {emptyMessage}
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'FORUM_POST':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-400" />;
      case 'BREACH_ANNOUNCED':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'WALLET_PAYMENT':
        return <Coins className="w-3.5 h-3.5 text-amber-400" />;
      case 'INFRA_ONLINE':
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
      case 'PERSONA_MIGRATION':
        return <Radio className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="badge badge-rose text-[9px]">CRITICAL</span>;
      case 'HIGH':
        return <span className="badge badge-rose text-[9px]">HIGH</span>;
      case 'MEDIUM':
        return <span className="badge badge-amber text-[9px]">MEDIUM</span>;
      default:
        return <span className="badge badge-blue text-[9px]">INFO</span>;
    }
  };

  return (
    <div className="timeline-track space-y-6">
      {events.map((event) => (
        <div key={event.id} className="relative group">
          {/* Node marker on vertical thread line */}
          <div className="timeline-node group-hover:scale-125 transition-transform" />

          {/* Event Content Card */}
          <div className="soc-card p-4 hover:border-blue-500/50 transition-colors">
            {/* Header with Timestamp, Category, and Severity */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 mb-2.5" style={{ borderColor: 'var(--soc-border)' }}>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-slate-900 border border-slate-800">
                  {getEventIcon(event.eventType)}
                </div>
                <span className="font-mono text-xs font-semibold text-white">
                  {event.title}
                </span>
                <span className="badge badge-purple text-[9px]">
                  {event.eventType.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                {getSeverityBadge(event.severity)}
                <span className="text-slate-400">
                  {formatIsoDate(event.eventTimestamp)} {formatIsoTime(event.eventTimestamp)}
                </span>
              </div>
            </div>

            {/* Description Body */}
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {event.description}
            </p>

            {/* Footer Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 text-[11px] font-mono text-slate-400 border-t" style={{ borderColor: 'rgba(30, 45, 82, 0.4)' }}>
              <div className="flex items-center gap-3">
                {event.personaHandle && (
                  <span className="text-purple-400">
                    Handle: <span className="text-slate-200">@{event.personaHandle}</span>
                  </span>
                )}
                {event.actorCanonicalName && (
                  <span className="text-blue-400">
                    Actor: <span className="text-slate-200">{event.actorCanonicalName}</span>
                  </span>
                )}
              </div>

              {event.sourceReference && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span>Source: {event.sourceReference}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
