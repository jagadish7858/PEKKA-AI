import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Cpu
} from 'lucide-react';
import { usePekka } from '../context/PekkaContext';

export const RecommendationsView: React.FC = () => {
  const { 
    recommendation, 
    approveRecommendation, 
    rejectRecommendation, 
    isInterventionApproved,
    setActiveTab,
    selectedAssetId,
    setSelectedAssetId,
    backendRecommendation,
    backendPrediction
  } = usePekka();

  const isPending = recommendation.status === 'PENDING' && !isInterventionApproved;

  const urgency = backendRecommendation?.urgency || 'MONITOR';

  const getUrgencyBadge = (u: string) => {
    switch (u) {
      case 'IMMEDIATE_ACTION':
        return (
          <span className="px-3 py-1 rounded font-bold uppercase tracking-wider text-xs bg-red-950/80 text-red-300 border border-red-500/70 animate-pulse flex items-center space-x-1.5 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>IMMEDIATE_ACTION</span>
          </span>
        );
      case 'URGENT_ACTION':
      case 'SCHEDULE_INSPECTION':
        return (
          <span className="px-3 py-1 rounded font-bold uppercase tracking-wider text-xs bg-orange-950/80 text-orange-300 border border-orange-500/70 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>URGENT_ACTION</span>
          </span>
        );
      case 'PREVENTIVE_ACTION':
        return (
          <span className="px-3 py-1 rounded font-bold uppercase tracking-wider text-xs bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/60 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
            <span>PREVENTIVE_ACTION</span>
          </span>
        );
      case 'MONITOR':
      default:
        return (
          <span className="px-3 py-1 rounded font-bold uppercase tracking-wider text-xs bg-[#10201A] text-[#3E7A4F] border border-[#3E7A4F]/60 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3E7A4F]" />
            <span>MONITOR</span>
          </span>
        );
    }
  };

  const riskValue = backendPrediction?.riskScore ?? (isInterventionApproved ? 29 : 87);
  const confidencePct = backendPrediction ? Math.round(backendPrediction.confidence * 100) : 91;

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-tactical gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center">
              AI RECOMMENDATION ENGINE
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-dim/20 text-cyan-neon border border-cyan-dim/40">
              FASTAPI REASONING PIPELINE
            </span>
          </div>
          <p className="text-xs text-ops-textMuted font-mono mt-0.5">
            Actionable mitigation advisories for monitored equipment // Final actuation decision strictly belongs to human operator
          </p>
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>AUTONOMY MODE: <strong className="text-cyan-neon">ADVISORY ONLY (HUMAN-IN-THE-LOOP)</strong></span>
        </div>
      </div>

      {/* Equipment Selector Toolbar */}
      <div className="flex items-center space-x-3 p-3 bg-ops-surface border border-tactical rounded-lg">
        <span className="text-xs font-serif uppercase tracking-wider text-[#8FBFA3] font-semibold flex items-center space-x-1.5">
          <Cpu className="w-4 h-4 text-[#C9A227]" />
          <span>Equipment Under Advisory:</span>
        </span>
        {(['TRANSFORMER-01', 'TRANSFORMER-02'] as const).map(eqId => (
          <button
            key={eqId}
            onClick={() => setSelectedAssetId(eqId)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all border flex items-center space-x-1.5 ${
              selectedAssetId === eqId
                ? 'bg-[#C9A227]/20 text-[#C9A227] border-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.3)]'
                : 'bg-[#0B1310] text-slate-300 border-tactical hover:border-[#C9A227]/40'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${selectedAssetId === eqId ? 'bg-[#C9A227]' : 'bg-slate-500'}`} />
            <span>{eqId}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center space-x-2">
          {getUrgencyBadge(urgency)}
        </div>
      </div>

      {/* Human in the loop pipeline banner */}
      <div className="p-3.5 rounded bg-ops-surface border border-tactical flex flex-col md:flex-row md:items-center justify-between gap-3 text-center md:text-left">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-ops-card border border-tactical flex items-center justify-center text-cyan-neon shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-neon" />
          </div>
          <div>
            <div className="font-bold text-slate-200">
              MANDATORY OPERATOR OVERSIGHT PIPELINE
            </div>
            <div className="text-[11px] text-slate-400 font-sans">
              PEKKA AI evaluates risks, computes recommendations, and tests contingencies. Operators hold sole actuation authority.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-[11px] font-bold">
          <span className="text-slate-300">TELEMETRY INGESTION</span>
          <span>→</span>
          <span className="text-cyan-neon">PEKKA AI RECOMMENDS</span>
          <span>→</span>
          <span className="text-amber-400">HUMAN DECIDES</span>
          <span>→</span>
          <span className="text-emerald-400">DISPATCH EXECUTED</span>
        </div>
      </div>

      {/* Primary Active Advisory Card */}
      <div className={`p-5 rounded border transition-all ${
        isInterventionApproved
          ? 'bg-emerald-950/20 border-emerald-500/50'
          : urgency === 'IMMEDIATE_ACTION'
          ? 'bg-ops-surface border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
          : 'bg-ops-surface border-tactical-cyan shadow-[0_0_20px_rgba(0,240,255,0.1)]'
      }`}>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-tactical">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              isInterventionApproved 
                ? 'bg-emerald-400' 
                : urgency === 'IMMEDIATE_ACTION' 
                ? 'bg-red-500 animate-ping' 
                : 'bg-[#C9A227]'
            }`} />
            <span className="text-xs font-bold text-slate-200 uppercase">
              PEKKA ADVISORY: {selectedAssetId}
            </span>
          </div>

          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
            isInterventionApproved
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
              : 'bg-amber-950/60 text-amber-300 border-amber-500/40 animate-pulse'
          }`}>
            {isInterventionApproved ? 'ACTION APPROVED & EXECUTED' : 'PENDING OPERATOR SIGNATURE'}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block mb-1">RECOMMENDED ACTIONS FROM PEKKA AI</span>
            <div className="space-y-2 mt-1">
              {backendRecommendation?.recommendations && backendRecommendation.recommendations.length > 0 ? (
                backendRecommendation.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded bg-ops-card border border-tactical flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227] flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-100 font-sans">{rec}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded bg-ops-card border border-tactical text-sm font-bold text-slate-100 font-sans">
                  {recommendation.action}
                </div>
              )}
            </div>

            {backendRecommendation?.operatorNotes && (
              <div className="mt-3 p-3 rounded bg-[#0B1310] border border-tactical text-xs text-slate-300 font-sans leading-relaxed">
                <strong className="text-[#C9A227] font-mono uppercase block mb-0.5">Operator Guidance:</strong>
                {backendRecommendation.operatorNotes}
              </div>
            )}
          </div>

          {/* 4 Impact Panels */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-ops-card p-3 rounded border border-tactical">
              <span className="text-[10px] text-slate-500 uppercase block">Current Risk</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-red-400 line-through text-lg font-bold">{riskValue.toFixed(1)}%</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-emerald-400 text-2xl font-black">{(riskValue * 0.35).toFixed(1)}%</span>
              </div>
              <span className="text-[10px] text-emerald-400">Post-mitigation projection</span>
            </div>

            <div className="bg-ops-card p-3 rounded border border-tactical">
              <span className="text-[10px] text-slate-500 uppercase block">Urgency Status</span>
              <div className="text-2xl font-black text-cyan-neon mt-1">{urgency}</div>
              <span className="text-[10px] text-slate-400">Backend Classification</span>
            </div>

            <div className="bg-ops-card p-3 rounded border border-tactical">
              <span className="text-[10px] text-slate-500 uppercase block">Operator Role</span>
              <div className="text-2xl font-black text-slate-100 mt-1">Sole Authority</div>
              <span className="text-[10px] text-slate-400">Human-In-The-Loop</span>
            </div>

            <div className="bg-ops-card p-3 rounded border border-tactical">
              <span className="text-[10px] text-slate-500 uppercase block">AI Confidence</span>
              <div className="text-2xl font-black text-cyan-neon mt-1">{confidencePct}%</div>
              <span className="text-[10px] text-slate-400">FastAPI Model Output</span>
            </div>
          </div>

          {/* Action Execution Footer */}
          {isPending ? (
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={approveRecommendation}
                className="w-full sm:w-auto px-6 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>APPROVE DISPATCH (HUMAN DECISION)</span>
              </button>

              <button
                onClick={() => setActiveTab('simulation')}
                className="w-full sm:w-auto px-4 py-2.5 rounded bg-ops-card hover:bg-ops-bg border border-tactical text-slate-300 hover:text-cyan-neon transition-colors flex items-center justify-center space-x-2"
              >
                <Sliders className="w-4 h-4" />
                <span>TEST IN SIMULATOR</span>
              </button>

              <button
                onClick={rejectRecommendation}
                className="w-full sm:w-auto px-4 py-2.5 rounded bg-ops-card hover:bg-red-950/40 border border-tactical hover:border-red-500/50 text-slate-400 hover:text-red-300 transition-colors flex items-center justify-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>OVERRIDE / REJECT</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 p-3 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Mitigation protocol approved by operator. Infrastructure dispatch commands transmitted to field controller.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
