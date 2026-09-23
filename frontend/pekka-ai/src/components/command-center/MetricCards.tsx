import React from 'react';
import { Activity, ShieldAlert, Cpu, TrendingDown, ArrowUpRight, ArrowDownRight, Gauge } from 'lucide-react';
import { usePekka } from '../../context/PekkaContext';

export const MetricCards: React.FC = () => {
  const { 
    isInterventionApproved, 
    backendPrediction, 
    backendAnomalyReport, 
    activeSensorsCount, 
    detectedScenario,
    isBackendOnline 
  } = usePekka();

  const healthScore = backendPrediction 
    ? Math.max(5, Math.min(100, Math.round(100 - backendPrediction.riskScore))) 
    : (isInterventionApproved ? 96 : 92);

  const riskScoreVal = backendPrediction?.riskScore ?? (isInterventionApproved ? 29 : 12);
  const anomalyScoreVal = (backendAnomalyReport?.anomalyScore ?? (detectedScenario === 'CRITICAL' ? 0.92 : detectedScenario === 'WARNING' ? 0.74 : 0.18)) * 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Infrastructure Health */}
      <div className="marble-texture card-luxury p-4.5 rounded-xl transition-all group relative overflow-hidden">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-serif uppercase tracking-widest text-[#8FBFA3] text-[11px] font-semibold">
            Equipment Health Score
          </span>
          <Activity className="w-3.5 h-3.5 text-[#3E7A4F]" />
        </div>

        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-bold font-serif text-[#F2EDE0] tabular-nums tracking-tight">
            {healthScore}
          </div>
          <span className="text-xs font-serif text-[#8FBFA3]/70">/ 100</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-[#8FBFA3]">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#C9A227]" />
            <span className="font-sans font-medium text-[11px]">
              {healthScore > 80 ? 'Nominal operation' : healthScore > 50 ? 'Operating degraded' : 'Immediate action required'}
            </span>
          </div>

          <svg className="w-20 h-7 overflow-visible" viewBox="0 0 80 24" fill="none">
            <defs>
              <linearGradient id="gold-fill-health" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A227" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#C9A227" stopOpacity="0.0"/>
              </linearGradient>
            </defs>
            <path
              d="M0 18 L15 16 L30 19 L45 11 L60 13 L75 5 L80 6"
              stroke="#8FBFA3"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 18 L15 16 L30 19 L45 11 L60 13 L75 5 L80 6 V24 H0 Z"
              fill="url(#gold-fill-health)"
            />
            <circle cx="80" cy="6" r="2.5" fill="#C9A227" />
          </svg>
        </div>
      </div>

      {/* 2. Active Telemetry Probes */}
      <div className="marble-texture card-luxury p-4.5 rounded-xl transition-all group relative overflow-hidden">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-serif uppercase tracking-widest text-[#8FBFA3] text-[11px] font-semibold">
            Telemetry Ingestion
          </span>
          <Cpu className="w-3.5 h-3.5 text-[#C9A227]" />
        </div>

        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-bold font-serif text-[#F2EDE0] tabular-nums tracking-tight">
            {activeSensorsCount > 0 ? activeSensorsCount : (isBackendOnline ? '18' : '0')}
          </div>
          <span className="text-[11px] font-sans text-[#8FBFA3] uppercase tracking-wider">Active Probes</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-[#C9A227]">
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendOnline ? 'bg-[#3E7A4F] animate-pulse' : 'bg-red-500'}`} />
            <span className="font-sans font-medium text-[11px]">
              {isBackendOnline ? '2 Transformers Streamed' : 'Backend Disconnected'}
            </span>
          </div>

          <svg className="w-20 h-7 overflow-visible" viewBox="0 0 80 24" fill="none">
            <defs>
              <linearGradient id="gold-fill-assets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A227" stopOpacity="0.28"/>
                <stop offset="100%" stopColor="#C9A227" stopOpacity="0.0"/>
              </linearGradient>
            </defs>
            <path
              d="M0 12 L20 12 L35 11 L50 13 L65 12 L80 12"
              stroke="#C9A227"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 12 L20 12 L35 11 L50 13 L65 12 L80 12 V24 H0 Z"
              fill="url(#gold-fill-assets)"
            />
            <circle cx="80" cy="12" r="2.5" fill="#C9A227" />
          </svg>
        </div>
      </div>

      {/* 3. Random Forest Predicted Failure Risk */}
      <div className={`marble-texture card-luxury p-4.5 rounded-xl border transition-all group relative overflow-hidden ${
        riskScoreVal > 50 ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-tactical'
      }`}>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-serif uppercase tracking-widest text-[#EF4444] text-[11px] font-semibold">
            Failure Risk Score
          </span>
          <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
        </div>

        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-bold font-serif text-[#F2EDE0] tabular-nums tracking-tight">
            {riskScoreVal.toFixed(1)}%
          </div>
          <span className="text-[11px] font-sans text-[#EF4444] uppercase tracking-wider">
            {backendPrediction?.riskLevel || (detectedScenario === 'CRITICAL' ? 'CRITICAL' : 'NOMINAL')}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-red-400">
            <span className={`w-1.5 h-1.5 rounded-full ${riskScoreVal > 50 ? 'bg-[#EF4444] animate-ping' : 'bg-[#C9A227]'}`} />
            <span className="font-sans font-medium text-[11px]">
              {backendPrediction?.predictedFailureMode || (detectedScenario === 'CRITICAL' ? 'High Failure Probability' : 'Normal Boundaries')}
            </span>
          </div>

          <svg className="w-20 h-7 overflow-visible" viewBox="0 0 80 24" fill="none">
            <defs>
              <linearGradient id="red-fill-risks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0"/>
              </linearGradient>
            </defs>
            <path
              d="M0 20 L20 18 L40 16 L55 12 L70 6 L80 5"
              stroke="#EF4444"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 20 L20 18 L40 16 L55 12 L70 6 L80 5 V24 H0 Z"
              fill="url(#red-fill-risks)"
            />
            <circle cx="80" cy="5" r="2.5" fill="#EF4444" />
          </svg>
        </div>
      </div>

      {/* 4. Isolation Forest Anomaly Index */}
      <div className="marble-texture card-luxury p-4.5 rounded-xl transition-all group relative overflow-hidden">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-serif uppercase tracking-widest text-[#8FBFA3] text-[11px] font-semibold">
            Isolation Forest Index
          </span>
          <TrendingDown className="w-3.5 h-3.5 text-[#C9A227]" />
        </div>

        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-bold font-serif text-[#F2EDE0] tabular-nums tracking-tight">
            {anomalyScoreVal.toFixed(1)}%
          </div>
          <span className="text-[11px] font-sans text-[#8FBFA3] uppercase tracking-wider">Anomaly Score</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-[#C9A227]">
            <ArrowDownRight className="w-3.5 h-3.5 text-[#C9A227]" />
            <span className="font-sans font-medium text-[11px]">
              {backendAnomalyReport?.method || 'Hybrid ML Pipeline'}
            </span>
          </div>

          <svg className="w-20 h-7 overflow-visible" viewBox="0 0 80 24" fill="none">
            <defs>
              <linearGradient id="gold-fill-disruption" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A227" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#C9A227" stopOpacity="0.0"/>
              </linearGradient>
            </defs>
            <path
              d="M0 6 L20 8 L35 10 L50 14 L65 18 L80 20"
              stroke="#C9A227"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 6 L20 8 L35 10 L50 14 L65 18 L80 20 V24 H0 Z"
              fill="url(#gold-fill-disruption)"
            />
            <circle cx="80" cy="20" r="2.5" fill="#C9A227" />
          </svg>
        </div>
      </div>
    </div>
  );
};
