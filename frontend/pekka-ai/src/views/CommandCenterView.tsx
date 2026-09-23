import React from 'react';
import { MetricCards } from '../components/command-center/MetricCards';
import { InfrastructureMap } from '../components/command-center/InfrastructureMap';
import { PekkaIntelligence } from '../components/command-center/PekkaIntelligence';
import { HumanOversightBanner } from '../components/command-center/HumanOversightBanner';
import { usePekka } from '../context/PekkaContext';
import { Activity, Cpu, ArrowRight, Gauge, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const CommandCenterView: React.FC = () => {
  const { 
    setActiveTab, 
    selectedAssetId, 
    setSelectedAssetId, 
    sensors, 
    detectedScenario,
    backendAnomalyReport,
    lastTelemetryUpdate
  } = usePekka();

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-tactical gap-3">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-serif font-bold text-[#F2EDE0] uppercase tracking-widest flex items-center">
              Command Center
            </h1>
            <span className="text-[10px] font-telemetry px-2.5 py-0.5 rounded-md bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/40 uppercase tracking-wider">
              Real-Time SCADA Operations
            </span>
          </div>
          <p className="text-xs text-[#8FBFA3] font-sans mt-1">
            Continuous virtual sensor telemetry correlation & predictive failure mitigation for power transformers
          </p>
        </div>

        {/* Quick Nav shortcut buttons */}
        <div className="flex items-center space-x-2.5 text-xs">
          <button 
            onClick={() => setActiveTab('telemetry')}
            className="px-3.5 py-2 rounded-lg bg-[#10201A] hover:bg-[#152B23] border border-tactical hover:border-[#C9A227]/50 text-[#B8C4BA] hover:text-[#F2EDE0] transition-colors flex items-center space-x-2 font-serif"
          >
            <Gauge className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>9-Sensor Bus</span>
            <ArrowRight className="w-3 h-3 text-[#708778]" />
          </button>
          <button 
            onClick={() => setActiveTab('digital-twin')}
            className="px-3.5 py-2 rounded-lg bg-[#10201A] hover:bg-[#152B23] border border-tactical hover:border-[#C9A227]/50 text-[#B8C4BA] hover:text-[#F2EDE0] transition-colors flex items-center space-x-2 font-serif"
          >
            <Cpu className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Digital Twin</span>
            <ArrowRight className="w-3 h-3 text-[#708778]" />
          </button>
        </div>
      </div>

      {/* Equipment Monitoring & Live Scenario Banner */}
      <div className="p-3.5 bg-ops-surface border border-tactical rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Equipment Selector */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-xs font-serif uppercase tracking-wider text-[#8FBFA3] font-semibold flex items-center space-x-1.5 shrink-0">
            <Cpu className="w-4 h-4 text-[#C9A227]" />
            <span>Equipment:</span>
          </span>
          <div className="flex items-center space-x-2">
            {(['TRANSFORMER-01', 'TRANSFORMER-02'] as const).map(eqId => {
              const isSelected = selectedAssetId === eqId;
              return (
                <button
                  key={eqId}
                  onClick={() => setSelectedAssetId(eqId)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all border flex items-center space-x-2 ${
                    isSelected
                      ? 'bg-[#C9A227]/25 text-[#F2EDE0] border-[#C9A227] shadow-[0_0_15px_rgba(201,162,39,0.35)]'
                      : 'bg-[#0B1310] text-slate-400 border-tactical hover:border-[#C9A227]/40 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#C9A227] animate-pulse' : 'bg-slate-600'}`} />
                  <span>{eqId}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Scenario Status */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end text-xs font-mono">
          <div className={`px-3 py-1.5 rounded-lg border flex items-center space-x-2 ${
            detectedScenario === 'CRITICAL'
              ? 'bg-red-950/70 text-red-300 border-red-500/60 animate-pulse'
              : detectedScenario === 'WARNING'
              ? 'bg-[#C9A227]/20 text-[#C9A227] border-[#C9A227]/50'
              : 'bg-[#10201A] text-[#3E7A4F] border-[#3E7A4F]/60'
          }`}>
            {detectedScenario === 'CRITICAL' ? (
              <ShieldAlert className="w-4 h-4 text-red-400" />
            ) : detectedScenario === 'WARNING' ? (
              <AlertCircle className="w-4 h-4 text-[#C9A227]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#3E7A4F]" />
            )}
            <span className="font-bold">SCENARIO: {detectedScenario}</span>
            {backendAnomalyReport?.anomalyScore !== undefined && (
              <span className="text-[10px] opacity-80">
                (IF Score: {backendAnomalyReport.anomalyScore.toFixed(2)})
              </span>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-1.5 text-[11px] text-[#8FBFA3]">
            <span>Last Sync:</span>
            <strong className="text-slate-200">{lastTelemetryUpdate || 'Syncing...'}</strong>
          </div>
        </div>
      </div>

      {/* 9-Sensor Quick Live Telemetry Strip */}
      <div className="bg-[#0B1310] border border-tactical rounded-xl p-3.5">
        <div className="flex items-center justify-between text-xs mb-2.5 pb-2 border-b border-tactical">
          <span className="font-serif uppercase tracking-wider text-[#8FBFA3] text-[11px] font-semibold flex items-center space-x-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>9-Sensor Live SCADA Telemetry Strip ({selectedAssetId})</span>
          </span>
          <button 
            onClick={() => setActiveTab('telemetry')}
            className="text-[10px] text-[#C9A227] hover:underline font-mono flex items-center space-x-1"
          >
            <span>View Full Trends & Sparklines</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {sensors.slice(0, 9).map(sensor => {
            const isCrit = sensor.status === 'critical';
            const isWarn = sensor.status === 'warning';

            return (
              <div 
                key={sensor.id}
                className={`p-2 rounded-lg border text-center font-mono flex flex-col justify-between ${
                  isCrit 
                    ? 'bg-red-950/40 border-red-500/50' 
                    : isWarn 
                    ? 'bg-amber-950/40 border-amber-500/50' 
                    : 'bg-[#10201A] border-tactical'
                }`}
              >
                <div className="text-[9px] text-[#8FBFA3] truncate font-sans uppercase font-medium">
                  {sensor.name.split(' ')[0]}
                </div>
                <div className="my-1">
                  <span className="text-sm font-bold text-[#F2EDE0] tabular-nums">
                    {sensor.currentValue}
                  </span>
                  <span className="text-[10px] text-[#C9A227] ml-0.5">{sensor.unit}</span>
                </div>
                <div className={`text-[9px] font-bold uppercase rounded px-1 py-0.2 ${
                  isCrit ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {sensor.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Overview Metric Panels */}
      <MetricCards />

      {/* Main Grid: Infrastructure Map (2/3) + Pekka Intelligence (1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Visual Centerpiece: Map & Quick Telemetry Feed */}
        <div className="xl:col-span-8 flex flex-col">
          <InfrastructureMap />
          <HumanOversightBanner />
        </div>

        {/* Right Column: PEKKA Intelligence & Time-to-Failure */}
        <div className="xl:col-span-4">
          <PekkaIntelligence />
        </div>
      </div>
    </div>
  );
};
