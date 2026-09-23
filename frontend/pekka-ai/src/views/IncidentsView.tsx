import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Radio, 
  Droplets, 
  Zap, 
  Filter
} from 'lucide-react';
import { usePekka } from '../context/PekkaContext';
import { Incident } from '../types';

export const IncidentsView: React.FC = () => {
  const { incidents, setSelectedAssetId, setActiveTab, isInterventionApproved } = usePekka();
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'RESOLVED'>('ALL');

  const filteredIncidents = incidents.filter(inc => {
    if (filter === 'ALL') return true;
    return inc.severity === filter;
  });

  const getSeverityBadge = (severity: Incident['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950/60 text-red-400 border-red-500/50 animate-pulse';
      case 'HIGH':
        return 'bg-amber-950/60 text-amber-400 border-amber-500/50';
      case 'MEDIUM':
        return 'bg-blue-950/60 text-blue-400 border-blue-500/50';
      case 'RESOLVED':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50';
    }
  };

  const handleInspectIncident = (assetId: string) => {
    setSelectedAssetId(assetId);
    setActiveTab('command-center');
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-tactical gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center">
              INCIDENT INTELLIGENCE
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-dim/20 text-cyan-neon border border-cyan-dim/40">
              PRIORITIZED RISK QUEUE
            </span>
          </div>
          <p className="text-xs text-ops-textMuted font-mono mt-0.5">
            Active and emerging infrastructure hazards triaged by failure criticality
          </p>
        </div>

        {/* Priority Filter Bar */}
        <div className="flex items-center space-x-1.5 font-mono text-xs">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'RESOLVED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded border transition-all ${
                filter === f
                  ? 'bg-cyan-dim/20 text-cyan-neon border-cyan-dim/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 border-tactical hover:bg-ops-card'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Cards Grid */}
      <div className="space-y-3 font-mono">
        {filteredIncidents.map(inc => {
          const isCritical = inc.severity === 'CRITICAL';

          return (
            <div
              key={inc.id}
              className={`bg-ops-surface border rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                isCritical && !inc.resolved
                  ? 'border-tactical-red shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                  : 'border-tactical hover:border-tactical-cyan'
              }`}
            >
              {/* Left Column: Severity + Title & Description */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border tracking-wider ${getSeverityBadge(inc.severity)}`}>
                    {inc.severity}
                  </span>
                  <span className="text-xs text-slate-400">{inc.id}</span>
                  <span className="text-xs text-slate-500">//</span>
                  <h3 className="text-sm font-bold text-slate-100">{inc.assetName}</h3>
                </div>

                <div className="text-xs text-cyan-neon font-semibold">
                  Failure Mode: {inc.failureType}
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {inc.description}
                </p>

                <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1">
                  <span>Detected: <strong className="text-slate-200">{inc.detectedAt}</strong></span>
                  <span>Confidence: <strong className="text-cyan-neon">{inc.confidence}%</strong></span>
                </div>
              </div>

              {/* Right Column: Risk Metrics & Action Button */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-tactical">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase">FAILURE RISK</div>
                  <div className={`text-2xl font-black tabular-nums ${inc.risk > 50 && !inc.resolved ? 'text-red-400' : 'text-emerald-400'}`}>
                    {inc.risk}%
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Remaining: <strong className="text-slate-200">{inc.timeRemaining}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleInspectIncident(inc.assetId)}
                  className="px-3 py-1.5 rounded bg-ops-card hover:bg-ops-cardHover border border-tactical hover:border-cyan-dim/50 text-cyan-neon text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <span>INSPECT ASSET</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
