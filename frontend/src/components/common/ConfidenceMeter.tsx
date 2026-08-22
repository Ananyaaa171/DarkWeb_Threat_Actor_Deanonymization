'use client';

import React from 'react';

interface ConfidenceMeterProps {
  score: number | null | undefined;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function ConfidenceMeter({
  score = 0,
  showBadge = true,
  size = 'md',
  label,
}: ConfidenceMeterProps) {
  const numericScore = Math.min(100, Math.max(0, score || 0));

  const getColorInfo = () => {
    if (numericScore >= 85) {
      return {
        fill: '#10b981', // Emerald
        badgeClass: 'badge-emerald',
        text: 'VERY HIGH',
      };
    }
    if (numericScore >= 70) {
      return {
        fill: '#3b82f6', // Blue
        badgeClass: 'badge-blue',
        text: 'HIGH',
      };
    }
    if (numericScore >= 40) {
      return {
        fill: '#f59e0b', // Amber
        badgeClass: 'badge-amber',
        text: 'MODERATE',
      };
    }
    return {
      fill: '#ef4444', // Rose
      badgeClass: 'badge-rose',
      text: 'LOW',
    };
  };

  const info = getColorInfo();

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full space-y-1.5">
      {(label || showBadge) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-slate-400 font-medium">{label}</span>}
          <div className="flex items-center gap-2 ml-auto">
            <span className="font-mono font-bold text-slate-200">
              {numericScore.toFixed(1)}%
            </span>
            {showBadge && (
              <span className={`badge ${info.badgeClass} text-[10px] py-0 px-1.5`}>
                {info.text}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bar Container */}
      <div className={`w-full ${heightClass} bg-slate-900 border border-slate-800 rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${numericScore}%`,
            backgroundColor: info.fill,
            boxShadow: `0 0 8px ${info.fill}60`,
          }}
        />
      </div>
    </div>
  );
}
