import React from 'react';
import { 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  BrainCircuit
} from 'lucide-react';
import { usePekka } from '../../context/PekkaContext';

export const PekkaIntelligence: React.FC = () => {
  const { 
    selectedAsset, 
    selectedAssetId,
    countdownFormatted, 
    recommendation, 
    approveRecommendation, 
    rejectRecommendation, 
    isInterventionApproved,
    setActiveTab,
    backendPrediction,
    backendAnomalyReport,
    backendRecommendation,
    detectedScenario
  } = usePekka();

  const isCritical = detectedScenario === 'CRITICAL';
  const isWarning = detectedScenario === 'WARNING';
  const riskValue = backendPrediction?.riskScore ?? (isInterventionApproved ? 29 : selectedAsset.risk);
  const failureProbPct = backendPrediction?.failure_probability !== undefined 
    ? Math.round(backendPrediction.failure_probability * 100) 
    : Math.round(riskValue);
  const confidencePct = backendPrediction 
    ? Math.round(backendPrediction.confidence * 100) 
    : 92;

  const isPending = recommendation.status === 'PENDING' && !isInterventionApproved;

  // SVG Circular countdown stroke calculation
  const circleRadius = 52;
  const circumference = 2 * Math.PI * circleRadius;
  const totalSecondsInitial = 5 * 3600;
  const currentTotalSeconds = 4 * 3600 + 32 * 60 + 18;
  const strokeDashoffset = circumference - (currentTotalSeconds / totalSecondsInitial) * circumference;

  return (
    <div className="marble-texture card-luxury rounded-xl p-5 flex flex-col space-y-4 select-none shadow-xl border border-gold-hairline">
      
      {/* Header */}
      <div className="pb-3.5 border-b border-tactical flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-[#EF4444] animate-ping' : 'bg-[#C9A227] animate-pulse'} shadow-[0_0_8px_#C9A227]`} />
            <h2 className="text-xs font-serif font-bold tracking-widest text-[#F2EDE0] uppercase">
              PEKKA Intelligence
            </h2>
          </div>
          <p className="text-[10px] font-telemetry text-[#8FBFA3] mt-0.5">
            FASTAPI ML REASONING PIPELINE (ISOLATION FOREST + RANDOM FOREST)
          </p>
        </div>

        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-telemetry font-bold uppercase tracking-wider border ${
          isInterventionApproved
            ? 'bg-[#10201A] text-[#3E7A4F] border-[#3E7A4F]/60'
            : isCritical
            ? 'bg-red-950/70 text-red-400 border-red-500/60 animate-pulse'
            : isWarning
            ? 'bg-[#C9A227]/20 text-[#C9A227] border-[#C9A227]/50'
            : 'bg-[#10201A] text-[#3E7A4F] border-[#3E7A4F]/60'
        }`}>
          {isInterventionApproved 
            ? 'THREAT MITIGATED' 
            : isCritical 
            ? 'CRITICAL INCIDENT DETECTED' 
            : isWarning 
            ? 'EARLY WARNING DETECTED' 
            : 'SYSTEM NOMINAL'}
        </div>
      </div>

      {/* Target Asset Summary */}
      <div className="bg-[#0B1310] p-3.5 rounded-xl border border-tactical">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-serif uppercase tracking-wider text-[#8FBFA3] text-[11px]">TARGET EQUIPMENT</span>
          <span className="text-[#C9A227] font-telemetry font-bold">{selectedAssetId} // {selectedAsset.name}</span>
        </div>
        <div className="text-[11px] font-sans text-[#B8C4BA]">
          Predicted Mode: <span className={`font-serif font-semibold ${isCritical ? 'text-red-400' : isWarning ? 'text-[#C9A227]' : 'text-[#8FBFA3]'}`}>
            {backendPrediction?.predictedFailureMode || (isCritical ? 'THERMAL_OVERLOAD_RISK' : 'NOMINAL_OPERATION')}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t border-tactical text-center">
          <div>
            <div className="text-[10px] uppercase text-[#708778] font-sans">Risk Score</div>
            <div className={`text-lg font-serif font-bold tabular-nums ${riskValue > 50 ? 'text-red-400' : riskValue > 25 ? 'text-[#C9A227]' : 'text-[#3E7A4F]'}`}>
              {riskValue.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-[#708778] font-sans">ML Confidence</div>
            <div className="text-lg font-serif font-bold text-[#C9A227] tabular-nums">{confidencePct}%</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-[#708778] font-sans">Failure Prob.</div>
            <div className={`text-lg font-serif font-bold tabular-nums ${failureProbPct > 50 ? 'text-red-400' : 'text-[#8FBFA3]'}`}>
              {failureProbPct}%
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: TIME TO FAILURE / TIME HORIZON */}
      <div className="bg-[#0B1310] p-4 rounded-xl border border-[#C9A227]/30 relative overflow-hidden group">
        <div className="flex items-center justify-between text-xs text-[#8FBFA3] mb-2.5">
          <span className="flex items-center space-x-1.5 uppercase font-serif tracking-wider text-[#F2EDE0]">
            <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Operational Horizon</span>
          </span>
          <span className={`text-[10px] font-telemetry font-bold ${isCritical ? 'text-red-400 animate-pulse' : 'text-[#C9A227]'}`}>
            {isCritical ? 'CRITICAL DISPATCH WINDOW' : 'REALTIME MONITORING'}
          </span>
        </div>

        {/* Circular Countdown Arc + Digits */}
        <div className="flex items-center justify-center py-2 space-x-6">
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="gold-amber-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C9A227"/>
                  <stop offset="60%" stopColor="#F59E0B"/>
                  <stop offset="100%" stopColor="#D97706"/>
                </linearGradient>
              </defs>
              <circle
                cx="60"
                cy="60"
                r={circleRadius}
                fill="none"
                stroke="rgba(201, 162, 39, 0.12)"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r={circleRadius}
                fill="none"
                stroke={isInterventionApproved ? '#3E7A4F' : 'url(#gold-amber-ring)'}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={isInterventionApproved ? 0 : strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-[9px] uppercase font-serif tracking-widest ${isInterventionApproved ? 'text-[#3E7A4F]' : 'text-[#C9A227]'}`}>
                {isInterventionApproved ? 'STABLE' : 'EST. HORIZON'}
              </span>
              <span className="text-xs font-serif font-bold text-[#F2EDE0] tabular-nums">
                {isInterventionApproved ? 'Nominal' : isCritical ? '< 2 hrs' : isWarning ? '04h 32m' : 'Nominal'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black font-serif tracking-wider text-[#F2EDE0] tabular-nums">
              {isInterventionApproved ? (
                <span className="text-[#3E7A4F] text-2xl font-bold">MITIGATED</span>
              ) : isCritical ? (
                <span className="text-red-400 font-bold text-2xl">ACTION REQ.</span>
              ) : (
                <span className="text-[#F2EDE0]">
                  {countdownFormatted.hours}:{countdownFormatted.minutes}:{countdownFormatted.seconds}
                </span>
              )}
            </div>
            <div className="text-[10px] text-[#8FBFA3] font-sans leading-tight">
              {isInterventionApproved 
                ? 'Mitigation protocol approved by human operator.' 
                : 'FastAPI failure forecasting based on sensor cross-correlations.'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: AI REASONING / SUPPORTING FEATURES */}
      <div className="bg-[#0B1310] p-4 rounded-xl border border-tactical space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="uppercase font-serif tracking-wider text-[#8FBFA3] text-[11px] font-semibold flex items-center space-x-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>AI Reasoning & Contributing Factors</span>
          </span>
          <span className="text-[10px] font-telemetry text-[#C9A227]">
            {backendPrediction?.ml_model || 'RandomForest'}
          </span>
        </div>

        {/* Feature Signals List */}
        <div className="space-y-2 text-xs">
          {backendPrediction?.supporting_features && backendPrediction.supporting_features.length > 0 ? (
            backendPrediction.supporting_features.map((feature, idx) => (
              <div key={idx} className="p-2 rounded bg-[#10201A] border border-[#2A3B32] text-[11px] font-mono text-[#F2EDE0] flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
                <span>{feature}</span>
              </div>
            ))
          ) : backendAnomalyReport?.details && backendAnomalyReport.details.length > 0 ? (
            backendAnomalyReport.details.map((detail, idx) => (
              <div key={idx} className="p-2 rounded bg-[#10201A] border border-[#2A3B32] text-[11px] font-mono text-[#F2EDE0]">
                <div className="font-bold text-[#C9A227]">{detail.sensorId} ({detail.sensorType}): {detail.value} {detail.unit}</div>
                <div className="text-[10px] text-slate-400">{detail.thresholdBreached} — {detail.detail}</div>
              </div>
            ))
          ) : (
            <div className="p-2 rounded bg-[#10201A] border border-[#2A3B32] text-[11px] font-mono text-[#8FBFA3]">
              All telemetry signals operating within expected thermal and electrical envelopes.
            </div>
          )}
        </div>

        {/* AI Explanation Quote */}
        {backendPrediction?.explanation && (
          <div className="p-3 rounded-lg bg-[#10201A] border-l-2 border-[#C9A227] font-serif text-xs text-[#F2EDE0] italic leading-relaxed">
            «{backendPrediction.explanation}»
          </div>
        )}

        {/* View Telemetry Button */}
        <button
          onClick={() => setActiveTab('telemetry')}
          className="w-full py-2 rounded-lg bg-[#10201A] hover:bg-[#152B23] border border-[#2A3B32] hover:border-[#C9A227]/50 text-[#C9A227] text-xs font-serif font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <span>INSPECT 9-SENSOR TELEMETRY BUS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SECTION 3: AI RECOMMENDATION & HUMAN APPROVAL */}
      <div className={`p-4 rounded-xl border space-y-3.5 transition-colors ${
        isInterventionApproved 
          ? 'bg-[#10201A] border-[#3E7A4F]/60' 
          : 'bg-[#10201A] border-[#C9A227]/40'
      }`}>
        <div className="flex items-center justify-between text-xs">
          <span className="uppercase font-serif font-bold text-[#C9A227] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
            <span>PEKKA Advisory Recommendation</span>
          </span>
          <span className={`text-[10px] font-telemetry px-2 py-0.5 rounded border ${
            backendRecommendation?.urgency === 'IMMEDIATE_ACTION'
              ? 'bg-red-950/60 text-red-400 border-red-500/50'
              : 'bg-[#C9A227]/15 text-[#C9A227] border-[#C9A227]/40'
          }`}>
            {backendRecommendation?.urgency || 'ADVISORY ONLY'}
          </span>
        </div>

        {/* Action Title */}
        <div className="font-serif text-sm font-bold text-[#F2EDE0]">
          {backendRecommendation?.recommendations?.[0] || recommendation.action}
        </div>

        {/* Operator Notes */}
        {backendRecommendation?.operatorNotes && (
          <div className="text-[11px] font-sans text-slate-300 bg-[#0B1310] p-2.5 rounded border border-tactical">
            <strong>Operator Advisory:</strong> {backendRecommendation.operatorNotes}
          </div>
        )}

        {/* Impact Numbers Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs bg-[#0B1310] p-3 rounded-lg border border-tactical">
          <div>
            <span className="text-[10px] text-[#708778] uppercase block">Current Risk</span>
            <span className="font-serif font-bold text-red-400 mr-1.5">{riskValue.toFixed(1)}%</span>
            <ArrowRight className="w-3 h-3 inline text-slate-500 mr-1.5" />
            <span className="font-serif font-bold text-[#3E7A4F]">{(riskValue * 0.35).toFixed(1)}%</span>
          </div>

          <div>
            <span className="text-[10px] text-[#708778] uppercase block">Urgency Level</span>
            <span className="font-serif font-bold text-[#C9A227]">
              {backendRecommendation?.urgency || 'MONITOR'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#708778] uppercase block">Authority</span>
            <span className="font-serif font-bold text-[#F2EDE0]">Human Operator</span>
          </div>

          <div>
            <span className="text-[10px] text-[#708778] uppercase block">AI Confidence</span>
            <span className="font-serif font-bold text-[#C9A227]">{confidencePct}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        {isPending ? (
          <div className="space-y-2 pt-1">
            <button
              onClick={approveRecommendation}
              className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-[#C9A227] to-[#A3801A] hover:from-[#dcb538] hover:to-[#b38f22] text-[#0B1310] text-xs font-serif font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_18px_rgba(201,162,39,0.35)] transition-all hover:scale-[1.01] active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-[#0B1310]" />
              <span>APPROVE MITIGATION (HUMAN DECISION)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('recommendations')}
                className="py-2 px-2 rounded-lg bg-[#0B1310] hover:bg-[#152B23] border border-[#C9A227]/40 text-[#C9A227] text-xs font-serif flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>ALL ADVISORIES</span>
              </button>

              <button
                onClick={rejectRecommendation}
                className="py-2 px-2 rounded-lg bg-[#0B1310] hover:bg-red-950/40 border border-tactical hover:border-red-500/40 text-slate-400 hover:text-red-300 text-xs font-serif flex items-center justify-center space-x-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>OVERRIDE / REJECT</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-[#10201A] border border-[#3E7A4F]/60 text-xs font-serif text-[#8FBFA3] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#3E7A4F]" />
              <span className="font-bold">ADVISORY APPROVED BY OPERATOR</span>
            </div>
            <span className="text-[10px] font-telemetry text-[#8FBFA3]/70">{recommendation.approvedAt || '06:42 UTC'}</span>
          </div>
        )}
      </div>

    </div>
  );
};
