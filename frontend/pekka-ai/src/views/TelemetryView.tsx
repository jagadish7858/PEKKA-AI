import React, { useState } from 'react';
import { 
  Gauge, 
  Activity, 
  Cpu, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { usePekka } from '../context/PekkaContext';

export const TelemetryView: React.FC = () => {
  const { 
    sensors, 
    selectedAsset, 
    selectedAssetId, 
    setSelectedAssetId, 
    isInterventionApproved,
    lastTelemetryUpdate,
    isBackendOnline,
    detectedScenario
  } = usePekka();
  
  const [activeMetricFilter, setActiveMetricFilter] = useState<'all' | 'critical' | 'warning'>('all');

  const filteredSensors = sensors.filter(s => {
    if (activeMetricFilter === 'critical') return s.status === 'critical';
    if (activeMetricFilter === 'warning') return s.status === 'warning' || s.status === 'critical';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-tactical gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center">
              LIVE TELEMETRY STREAM
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-dim/20 text-cyan-neon border border-cyan-dim/40">
              FASTAPI :8001 INGESTION BUS
            </span>
          </div>
          <p className="text-xs text-ops-textMuted font-mono mt-0.5">
            Streaming live virtual sensor telemetry for {selectedAssetId} // Real-time anomaly scoring & deviation metrics
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          {(['all', 'warning', 'critical'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveMetricFilter(filter)}
              className={`px-2.5 py-1 rounded capitalize border transition-all ${
                activeMetricFilter === filter
                  ? 'bg-cyan-dim/20 text-cyan-neon border-cyan-dim/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 border-tactical hover:bg-ops-card'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Selector Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-ops-surface border border-tactical rounded-lg gap-3">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Monitored Equipment:</span>
          </span>
          {(['TRANSFORMER-01', 'TRANSFORMER-02'] as const).map(eqId => (
            <button
              key={eqId}
              onClick={() => setSelectedAssetId(eqId)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all border flex items-center space-x-1.5 ${
                selectedAssetId === eqId
                  ? 'bg-[#C9A227]/20 text-[#C9A227] border-[#C9A227] shadow-[0_0_12px_rgba(201,162,39,0.35)]'
                  : 'bg-[#0B1310] text-slate-300 border-tactical hover:border-[#C9A227]/40 hover:text-[#F2EDE0]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${selectedAssetId === eqId ? 'bg-[#C9A227]' : 'bg-slate-500'}`} />
              <span>{eqId}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <div className={`px-2 py-0.5 rounded border ${
            detectedScenario === 'CRITICAL'
              ? 'bg-red-950/60 text-red-400 border-red-500/50 animate-pulse'
              : detectedScenario === 'WARNING'
              ? 'bg-[#C9A227]/20 text-[#C9A227] border-[#C9A227]/50'
              : 'bg-[#10201A] text-[#3E7A4F] border-[#3E7A4F]/60'
          }`}>
            SCENARIO: {detectedScenario}
          </div>
          <div className="text-slate-400 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-[#8FBFA3]" />
            <span>Last Telemetry Update: <strong className="text-slate-200">{lastTelemetryUpdate || 'Syncing...'}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid of 9 Telemetry Sensors with Live Engineering Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSensors.map(sensor => {
          const isCrit = sensor.status === 'critical' && !isInterventionApproved;
          const isWarn = sensor.status === 'warning' && !isInterventionApproved;

          return (
            <div
              key={sensor.id}
              className={`bg-ops-surface border rounded p-3.5 flex flex-col justify-between transition-all group ${
                isCrit
                  ? 'border-tactical-red shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                  : isWarn
                  ? 'border-tactical-amber'
                  : 'border-tactical hover:border-tactical-cyan'
              }`}
            >
              {/* Sensor Header */}
              <div>
                <div className="flex items-start justify-between text-xs font-mono mb-1">
                  <div>
                    <span className="font-bold text-slate-200 tracking-wider">
                      {sensor.name}
                    </span>
                    <div className="text-[10px] font-mono flex items-center space-x-2 mt-0.5">
                      <span className="text-cyan-neon font-bold">ID: {sensor.id}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">EQ: {sensor.equipmentId || selectedAssetId}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      isCrit
                        ? 'bg-red-950/60 text-red-400 border border-red-500/40 animate-pulse'
                        : isWarn
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {sensor.status.toUpperCase()}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                      {sensor.timestamp ? new Date(sensor.timestamp).toLocaleTimeString() : 'LIVE'}
                    </span>
                  </div>
                </div>

                {/* Big Current Value + Deviation */}
                <div className="flex items-baseline justify-between mt-2 font-mono">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-black text-slate-100 tabular-nums">
                      {sensor.currentValue}
                    </span>
                    <span className="text-sm text-cyan-neon font-bold">{sensor.unit}</span>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">DEVIATION</div>
                    <div className={`text-xs font-bold tabular-nums ${
                      isCrit ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {sensor.deviationPct > 0 ? `+${sensor.deviationPct}%` : `${sensor.deviationPct}%`}
                    </div>
                  </div>
                </div>

                {/* Normal Range & Anomaly Score Line */}
                <div className="mt-2 pt-2 border-t border-tactical/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Normal: {sensor.normalMin}–{sensor.normalMax} {sensor.unit}</span>
                  <span>
                    Anomaly Score: <strong className={sensor.anomalyScore > 0.8 ? 'text-red-400' : 'text-cyan-neon'}>
                      {sensor.anomalyScore}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Engineering Line Chart SVG with Threshold Band */}
              <div className="mt-3 pt-2">
                <div className="h-20 w-full relative bg-ops-bg rounded border border-tactical/60 p-1 flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
                    {/* Normal Threshold Band */}
                    <rect
                      x="0"
                      y="15"
                      width="200"
                      height="30"
                      fill="rgba(0, 240, 255, 0.05)"
                      stroke="rgba(0, 240, 255, 0.15)"
                      strokeDasharray="2 2"
                    />

                    {/* Sensor Data Line from real backend history */}
                    {sensor.history && sensor.history.length > 1 && (
                      <>
                        {/* Area Fill */}
                        <path
                          d={`M0 50 L${sensor.history
                            .map((pt, i) => `${(i / (sensor.history.length - 1)) * 200} ${
                              Math.max(5, Math.min(55, 60 - ((pt.value - sensor.normalMin) / (sensor.normalMax - sensor.normalMin || 1)) * 30))
                            }`)
                            .join(' L')} L200 60 L0 60 Z`}
                          fill={isCrit ? 'rgba(239, 68, 68, 0.12)' : 'rgba(0, 240, 255, 0.08)'}
                        />

                        {/* Stroke Line */}
                        <path
                          d={`M${sensor.history
                            .map((pt, i) => `${(i / (sensor.history.length - 1)) * 200} ${
                              Math.max(5, Math.min(55, 60 - ((pt.value - sensor.normalMin) / (sensor.normalMax - sensor.normalMin || 1)) * 30))
                            }`)
                            .join(' L')}`}
                          fill="none"
                          stroke={isCrit ? '#EF4444' : isWarn ? '#F59E0B' : '#00F0FF'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Current Value Dot */}
                        <circle
                          cx="200"
                          cy={Math.max(5, Math.min(55, 60 - ((sensor.currentValue - sensor.normalMin) / (sensor.normalMax - sensor.normalMin || 1)) * 30))}
                          r="3"
                          fill={isCrit ? '#EF4444' : '#00F0FF'}
                          className={isCrit ? 'animate-ping' : ''}
                        />
                      </>
                    )}
                  </svg>
                </div>

                <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                  <span>PAST READINGS</span>
                  <span>LIVE INGESTION</span>
                  <span>NOW</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
