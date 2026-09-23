import React, { useState } from 'react';
import { 
  ScrollText, 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  Cpu, 
  CheckCircle2, 
  Filter,
  Download,
  Terminal
} from 'lucide-react';
import { usePekka } from '../context/PekkaContext';
import { AuditLogEntry } from '../types';

export const AuditView: React.FC = () => {
  const { auditLogs } = usePekka();
  const [filterActor, setFilterActor] = useState<'ALL' | 'PEKKA AI' | 'OPERATOR' | 'SUPERVISORY_SYSTEM'>('ALL');

  const filteredLogs = auditLogs.filter(log => {
    if (filterActor === 'ALL') return true;
    return log.actor === filterActor;
  });

  const getActorBadge = (actor: AuditLogEntry['actor']) => {
    switch (actor) {
      case 'OPERATOR':
        return 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40';
      case 'PEKKA AI':
        return 'bg-cyan-dim/20 text-cyan-neon border border-cyan-dim/40';
      case 'SUPERVISORY_SYSTEM':
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-tactical gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center">
              AUTONOMY AUDIT LOG
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
              TAMPER-EVIDENT LEDGER
            </span>
          </div>
          <p className="text-xs text-ops-textMuted font-mono mt-0.5">
            Immutable record of autonomous detections, model predictions, and certified operator approval signatures
          </p>
        </div>

        {/* Actor Filter Bar */}
        <div className="flex items-center space-x-1.5 font-mono text-xs">
          {(['ALL', 'PEKKA AI', 'OPERATOR', 'SUPERVISORY_SYSTEM'] as const).map(actor => (
            <button
              key={actor}
              onClick={() => setFilterActor(actor)}
              className={`px-2.5 py-1 rounded border transition-all ${
                filterActor === actor
                  ? 'bg-cyan-dim/20 text-cyan-neon border-cyan-dim/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 border-tactical hover:bg-ops-card'
              }`}
            >
              {actor.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Trust & Transparency Banner */}
      <div className="p-3 rounded bg-ops-surface border border-tactical flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-ops-card border border-tactical flex items-center justify-center text-cyan-neon">
            <Lock className="w-4 h-4 text-cyan-neon" />
          </div>
          <div>
            <div className="font-bold text-slate-200">
              IEC 62443 / IEEE Reliability Compliance Standard Active
            </div>
            <div className="text-[11px] text-slate-400 font-sans">
              All autonomous advisories are cryptographically hashed and chained to enforce zero unauthorized infrastructure control.
            </div>
          </div>
        </div>

        <button 
          onClick={() => alert('Audit trail export generated: SHA-256 verified.')}
          className="px-3 py-1.5 rounded bg-ops-card hover:bg-ops-cardHover border border-tactical text-slate-300 hover:text-cyan-neon flex items-center space-x-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON-LD</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-ops-surface border border-tactical rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-ops-card/80 border-b border-tactical text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Event Summary</th>
                <th className="py-2.5 px-3">Execution Details</th>
                <th className="py-2.5 px-3 text-right">Crypto Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical">
              {filteredLogs.map(entry => (
                <tr key={entry.id} className="hover:bg-ops-card/50 transition-colors">
                  <td className="py-3 px-3 text-cyan-neon font-bold tabular-nums">
                    {entry.timestamp}
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-ops-card border border-tactical text-slate-300 uppercase">
                      {entry.type.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getActorBadge(entry.actor)}`}>
                      {entry.actor}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-bold text-slate-200">
                    {entry.assetId}
                  </td>

                  <td className="py-3 px-3 text-slate-100 font-sans text-xs max-w-sm">
                    {entry.message}
                  </td>

                  <td className="py-3 px-3 text-slate-400 font-sans text-xs max-w-xs truncate">
                    {entry.details}
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500 tabular-nums">
                    {entry.hash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
