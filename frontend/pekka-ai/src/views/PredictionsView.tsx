import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpDown, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Droplets, 
  Radio, 
  Train 
} from 'lucide-react';
import { usePekka } from '../context/PekkaContext';

export const PredictionsView: React.FC = () => {
  const { 
    isInterventionApproved, 
    setSelectedAssetId, 
    setActiveTab,
    selectedAssetId,
    backendPrediction,
    backendRecommendation,
    detectedScenario
  } = usePekka();
  const [sortField, setSortField] = useState<'probability' | 'time'>('probability');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const t01Risk = selectedAssetId === 'TRANSFORMER-01' && backendPrediction
    ? Math.round(backendPrediction.riskScore)
    : (detectedScenario === 'CRITICAL' ? 88 : detectedScenario === 'WARNING' ? 65 : 12);
  const t02Risk = selectedAssetId === 'TRANSFORMER-02' && backendPrediction
    ? Math.round(backendPrediction.riskScore)
    : 8;

  const predictions = [
    {
      id: 'TRANSFORMER-01',
      name: 'TRANSFORMER-01 (Unit #1)',
      sector: 'power',
      failureType: selectedAssetId === 'TRANSFORMER-01' && backendPrediction
        ? backendPrediction.predictedFailureMode
        : (detectedScenario === 'CRITICAL' ? 'THERMAL_OVERLOAD_RISK' : 'NOMINAL_OPERATION'),
      probability: t01Risk,
      confidence: selectedAssetId === 'TRANSFORMER-01' && backendPrediction
        ? Math.round(backendPrediction.confidence * 100)
        : 94,
      timeToFailure: t01Risk > 80 ? '< 2h (Immediate Action)' : t01Risk > 50 ? '04h 32m' : 'Nominal',
      timeMinutes: t01Risk > 80 ? 90 : t01Risk > 50 ? 272 : 9999,
      impact: t01Risk > 80 ? 'CRITICAL (Transformer thermal runaway)' : 'LOW (Design operating limits)',
      impactSeverity: t01Risk > 80 ? 'high' : t01Risk > 50 ? 'medium' : 'low',
      recommendation: selectedAssetId === 'TRANSFORMER-01' && backendRecommendation?.recommendations?.[0]
        ? backendRecommendation.recommendations[0]
        : 'Continue routine SCADA monitoring'
    },
    {
      id: 'TRANSFORMER-02',
      name: 'TRANSFORMER-02 (Unit #2)',
      sector: 'power',
      failureType: selectedAssetId === 'TRANSFORMER-02' && backendPrediction
        ? backendPrediction.predictedFailureMode
        : 'NOMINAL_OPERATION',
      probability: t02Risk,
      confidence: selectedAssetId === 'TRANSFORMER-02' && backendPrediction
        ? Math.round(backendPrediction.confidence * 100)
        : 96,
      timeToFailure: t02Risk > 80 ? '< 2h' : 'Nominal',
      timeMinutes: t02Risk > 80 ? 90 : 9999,
      impact: 'LOW (Backup step-down transformer ready)',
      impactSeverity: 'low',
      recommendation: 'Standby load share if required'
    },
    {
      id: 'P-04',
      name: 'PUMP STATION P-04',
      sector: 'water',
      failureType: 'Centrifugal pump impeller bearing cavitation',
      probability: 68,
      confidence: 89,
      timeToFailure: '18h 40m',
      timeMinutes: 1120,
      impact: 'MEDIUM (Metropolitan water intake pressure drop)',
      impactSeverity: 'medium',
      recommendation: 'Throttle suction valve by 8% and cycle secondary pump'
    },
    {
      id: 'C-22',
      name: 'TELECOM RELAY C-22',
      sector: 'communication',
      failureType: 'Packet-loss anomaly in telemetry backhaul',
      probability: 41,
      confidence: 86,
      timeToFailure: '14h 10m',
      timeMinutes: 850,
      impact: 'LOW (SCADA telemetry latency degradation)',
      impactSeverity: 'low',
      recommendation: 'Switch carrier to 23GHz secondary MIMO frequency'
    },
    {
      id: 'T-09',
      name: 'TRANSPORT HUB T-09',
      sector: 'transport',
      failureType: 'Rail point switch actuator current drift',
      probability: 11,
      confidence: 94,
      timeToFailure: '> 48h',
      timeMinutes: 2880,
      impact: 'LOW (Intermodal signaling switchover)',
      impactSeverity: 'low',
      recommendation: 'Schedule routine lubrication at night window'
    }
  ];

  const sortedPredictions = [...predictions].sort((a, b) => {
    if (sortField === 'probability') {
      return sortAsc ? a.probability - b.probability : b.probability - a.probability;
    } else {
      return sortAsc ? a.timeMinutes - b.timeMinutes : b.timeMinutes - a.timeMinutes;
    }
  });

  const timelineHours = ['NOW', '+2H', '+4H', '+8H', '+12H', '+24H'];

  // Forecast curves over 24 hours
  const forecastCurves = {
    'S-17': isInterventionApproved 
      ? [29, 26, 24, 22, 20, 19]
      : [87, 92, 98, 100, 100, 100],
    'P-04': [68, 71, 74, 78, 81, 85],
    'C-22': [41, 42, 40, 38, 35, 30],
    'T-09': [11, 12, 13, 15, 14, 12],
  };

  const handleInspect = (assetId: string) => {
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
              FAILURE FORECAST MATRIX
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-dim/20 text-cyan-neon border border-cyan-dim/40">
              PREDICTIVE HORIZON
            </span>
          </div>
          <p className="text-xs text-ops-textMuted font-mono mt-0.5">
            Probabilistic degradation forecasting across all monitored infrastructure domains
          </p>
        </div>
      </div>

      {/* 24-HOUR RISK FORECAST SECTION */}
      <div className="bg-ops-surface border border-tactical rounded p-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-tactical">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-cyan-neon" />
            <span className="font-bold text-slate-100 uppercase tracking-wider">
              24-HOUR MULTI-ASSET RISK FORECAST
            </span>
          </div>
          <span className="text-[10px] text-slate-500">
            TIMELINE: NOW → +2H → +4H → +8H → +12H → +24H
          </span>
        </div>

        {/* Forecast Chart Canvas/SVG */}
        <div className="h-44 w-full bg-ops-bg rounded border border-tactical/60 p-3 relative flex flex-col justify-between">
          
          {/* Danger Threshold Line (80%) */}
          <div className="absolute top-[20%] left-0 right-0 border-b border-red-500/30 border-dashed flex justify-end pr-2 text-[9px] text-red-400">
            <span>CRITICAL RISK THRESHOLD (80%)</span>
          </div>

          {/* SVG Multi-Line Curves */}
          <svg className="w-full h-32 overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
            {/* S-17 Curve */}
            <path
              d={`M0 ${100 - forecastCurves['S-17'][0]} L100 ${100 - forecastCurves['S-17'][1]} L200 ${100 - forecastCurves['S-17'][2]} L300 ${100 - forecastCurves['S-17'][3]} L400 ${100 - forecastCurves['S-17'][4]} L500 ${100 - forecastCurves['S-17'][5]}`}
              fill="none"
              stroke={isInterventionApproved ? '#10B981' : '#EF4444'}
              strokeWidth="2.5"
            />
            {/* P-04 Curve */}
            <path
              d={`M0 ${100 - forecastCurves['P-04'][0]} L100 ${100 - forecastCurves['P-04'][1]} L200 ${100 - forecastCurves['P-04'][2]} L300 ${100 - forecastCurves['P-04'][3]} L400 ${100 - forecastCurves['P-04'][4]} L500 ${100 - forecastCurves['P-04'][5]}`}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.8"
              strokeDasharray="4 2"
            />
            {/* C-22 Curve */}
            <path
              d={`M0 ${100 - forecastCurves['C-22'][0]} L100 ${100 - forecastCurves['C-22'][1]} L200 ${100 - forecastCurves['C-22'][2]} L300 ${100 - forecastCurves['C-22'][3]} L400 ${100 - forecastCurves['C-22'][4]} L500 ${100 - forecastCurves['C-22'][5]}`}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="1.5"
            />
            {/* T-09 Curve */}
            <path
              d={`M0 ${100 - forecastCurves['T-09'][0]} L100 ${100 - forecastCurves['T-09'][1]} L200 ${100 - forecastCurves['T-09'][2]} L300 ${100 - forecastCurves['T-09'][3]} L400 ${100 - forecastCurves['T-09'][4]} L500 ${100 - forecastCurves['T-09'][5]}`}
              fill="none"
              stroke="#A855F7"
              strokeWidth="1.5"
            />
          </svg>

          {/* Timeline X Axis */}
          <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-tactical">
            {timelineHours.map(hour => (
              <span key={hour}>{hour}</span>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
          <div className="flex items-center space-x-1.5">
            <span className={`w-3 h-1 rounded ${isInterventionApproved ? 'bg-emerald-400' : 'bg-red-500'}`} />
            <span>S-17 Transformer {isInterventionApproved ? '(29% Mitigated)' : '(87% Failure Trajectory)'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 rounded bg-amber-400" />
            <span>P-04 Pump (Bearing 68% → 85%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 rounded bg-cyan-400" />
            <span>C-22 Telecom (41% → 30%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 rounded bg-purple-400" />
            <span>T-09 Rail (11% Nominal)</span>
          </div>
        </div>
      </div>

      {/* PREDICTIONS TABLE */}
      <div className="bg-ops-surface border border-tactical rounded overflow-hidden font-mono text-xs">
        <div className="p-3 bg-ops-surface border-b border-tactical flex items-center justify-between">
          <span className="font-bold text-slate-200 uppercase tracking-wider">
            FAILURE FORECAST TABLE
          </span>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span>Sort by:</span>
            <button
              onClick={() => {
                setSortField('probability');
                setSortAsc(!sortAsc);
              }}
              className="px-2 py-0.5 rounded bg-ops-card border border-tactical text-cyan-neon flex items-center space-x-1"
            >
              <span>Probability</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setSortField('time');
                setSortAsc(!sortAsc);
              }}
              className="px-2 py-0.5 rounded bg-ops-card border border-tactical text-cyan-neon flex items-center space-x-1"
            >
              <span>Time to Failure</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-ops-card/80 border-b border-tactical text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Failure Type</th>
                <th className="py-2.5 px-3">Probability</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Time to Failure</th>
                <th className="py-2.5 px-3">Potential Impact</th>
                <th className="py-2.5 px-3">Recommended Action</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical">
              {sortedPredictions.map(item => (
                <tr key={item.id} className="hover:bg-ops-card/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-100">{item.id}</div>
                    <span className="text-[10px] text-slate-500 uppercase">{item.sector}</span>
                  </td>

                  <td className="py-3 px-3 text-slate-300 max-w-xs font-sans text-xs">
                    {item.failureType}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`text-base font-bold tabular-nums ${
                      item.probability > 60 ? 'text-red-400' : item.probability > 30 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {item.probability}%
                    </span>
                  </td>

                  <td className="py-3 px-3 text-cyan-neon font-bold tabular-nums">
                    {item.confidence}%
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-200 tabular-nums">
                      {item.timeToFailure}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      item.impactSeverity === 'high' 
                        ? 'bg-red-950/60 text-red-400 border border-red-500/40' 
                        : item.impactSeverity === 'medium'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.impact}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-300 font-sans text-xs">
                    {item.recommendation}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleInspect(item.id)}
                      className="px-2.5 py-1 rounded bg-ops-card hover:bg-ops-surface border border-tactical hover:border-cyan-dim/50 text-cyan-neon text-xs font-mono transition-colors"
                    >
                      Inspect →
                    </button>
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
