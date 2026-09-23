import React, { useState } from 'react';
import { 
  FileSearch, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  ShieldAlert, 
  History,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { usePekka } from '../context/PekkaContext';

interface EvidenceItem {
  id: string;
  time: string;
  title: string;
  actor: string;
  confidence: number;
  dataSource: string;
  summary: string;
  sensorData: Record<string, string>;
  similarIncident?: string;
}

export const EvidenceView: React.FC = () => {
  const { isInterventionApproved } = usePekka();
  const [expandedId, setExpandedId] = useState<string>('ev-1');

  const evidenceList: EvidenceItem[] = [
    {
      id: 'ev-1',
      time: '06:41:12 UTC',
      title: 'Temperature Anomaly Detected on Phase B Core',
      actor: 'PEKKA-EdgeObserver (Node S-17)',
      confidence: 96,
      dataSource: 'Fiber-Optic Distributed Temperature Sensor TS-402 (Sampling: 100 Hz)',
      summary: 'Continuous temperature trend crossed the adaptive dynamic rating upper limit by +18.2%, deviating from standard cooling curves under 94.2% apparent load.',
      sensorData: {
        'Core Temperature': '72.4°C (Normal: 40–65°C)',
        'Ambient Temp': '28.1°C',
        'Top-Oil Thermal Rise': '+14.2 K/h',
        'Gradient Differential': '24.8°C'
      },
      similarIncident: '2024 Northeast Grid Transformer Event #409 (Match confidence: 89.4%)'
    },
    {
      id: 'ev-2',
      time: '06:41:16 UTC',
      title: 'Multi-Harmonic Acoustic Vibration Correlated',
      actor: 'PEKKA-AcousticTwin v4.2',
      confidence: 94,
      dataSource: 'Piezoelectric Accelerometer Array VS-108 / VS-109',
      summary: 'Harmonic peak amplitude at 100 Hz and 300 Hz grew +31%, confirming mechanical lamination stress rather than sensor calibration error.',
      sensorData: {
        'Vibration RMS': '4.82 mm/s (Normal: 0.8–2.2 mm/s)',
        'Spectral Centroid': '248.5 Hz',
        'Phase Coherence': '0.94',
        'Harmonic Distortion': '3.2%'
      }
    },
    {
      id: 'ev-3',
      time: '06:41:21 UTC',
      title: 'Historical Pattern Matched via Vector Embedding Search',
      actor: 'PEKKA Vector Neural Archive (3.4M Incidents Index)',
      confidence: 89,
      dataSource: 'Global Critical Infrastructure Reliability Consortium Database',
      summary: 'Degradation vector matched 2024 North Grid Event #409 (250 MVA Westinghouse Step-down). In that incident, inaction resulted in a catastrophic dielectric breakdown 4.8 hours post-detection.',
      sensorData: {
        'Cosine Similarity': '0.892',
        'Historical Downtime': '5.2 hours',
        'Historical Cost Impact': '$2.4M',
        'Asset Topography Match': '100% Identical Voltage Class'
      },
      similarIncident: '2024 North Grid Event #409'
    },
    {
      id: 'ev-4',
      time: '06:41:25 UTC',
      title: 'Dielectric Failure Probability Recalculated: 87%',
      actor: 'PEKKA Monte Carlo Thermal-Dielectric Engine',
      confidence: 92,
      dataSource: 'Integrated SCADA Bus & Physics-Informed Neural Network',
      summary: '10,000 thermal-hydraulic iterations projected an 87% chance of catastrophic inter-turn short circuit within 04h 32m if continuous load remains unthrottled.',
      sensorData: {
        'Failure Probability': '87.4%',
        'Critical Degradation Horizon': '04h 32m 18s',
        'Estimated Cascading Reach': '8 Adjoining Nodes',
        'Confidence Interval': '92.1% (p < 0.001)'
      }
    },
    {
      id: 'ev-5',
      time: '06:41:29 UTC',
      title: 'Preventive Intervention Generated: Reroute 12% Load',
      actor: 'PEKKA Dispatch Recommender v4.2',
      confidence: 91,
      dataSource: 'Regional Power Flow Solver & N-1 Contingency Matrix',
      summary: 'Optimal action identified: Shunt 30 MVA to Substation S-04 via Northern Tie-Line. Drops failure risk from 87% to 29% without violating secondary capacity limits.',
      sensorData: {
        'Recommended Action': 'Reduce transformer load by 12%',
        'Projected Risk Post-Action': '29%',
        'Avoided Downtime': '3.8 hours',
        'Protected End-Users': '12,400'
      }
    }
  ];

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-tactical gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center">
              EVIDENCE TRAIL
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-dim/20 text-cyan-neon border border-cyan-dim/40">
              AUDITABLE PROOF CHAIN
            </span>
          </div>
          <p className="text-xs text-ops-textMuted font-mono mt-0.5">
            Transparent chronological evidence // Model weights, sensor telemetry, and historical precedents
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-ops-surface border border-tactical text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-neon" />
            <span>Model: PEKKA-NeuralTwin v4.2</span>
          </div>
        </div>
      </div>

      {/* Top Model Provenance Summary Card */}
      <div className="bg-ops-surface border border-tactical rounded p-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-tactical">
          <span className="font-bold text-cyan-neon flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-neon" />
            <span>AI EXPLAINABILITY & PROVENANCE METADATA</span>
          </span>
          <span className="text-[10px] text-slate-400">HASH: 0x9b4f2c01e8</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2 rounded bg-ops-card border border-tactical">
            <span className="text-[10px] text-slate-500 uppercase block">Model Architecture</span>
            <span className="text-slate-200 font-bold">PINN + Causal Transformer</span>
          </div>
          <div className="p-2 rounded bg-ops-card border border-tactical">
            <span className="text-[10px] text-slate-500 uppercase block">Training Corroboration</span>
            <span className="text-slate-200 font-bold">IEEE Reliability Data</span>
          </div>
          <div className="p-2 rounded bg-ops-card border border-tactical">
            <span className="text-[10px] text-slate-500 uppercase block">Overall Confidence</span>
            <span className="text-cyan-neon font-bold">92.4%</span>
          </div>
          <div className="p-2 rounded bg-ops-card border border-tactical">
            <span className="text-[10px] text-slate-500 uppercase block">False Positive Rate</span>
            <span className="text-emerald-400 font-bold">&lt; 0.04%</span>
          </div>
        </div>
      </div>

      {/* Chronological Expandable Evidence Timeline */}
      <div className="space-y-3 font-mono">
        {evidenceList.map((item, index) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-ops-surface border rounded transition-all ${
                isExpanded ? 'border-tactical-cyan shadow-[0_0_15px_rgba(0,240,255,0.08)]' : 'border-tactical hover:border-slate-700'
              }`}
            >
              {/* Timeline Header Row */}
              <div
                onClick={() => setExpandedId(isExpanded ? '' : item.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded bg-ops-card border border-tactical flex items-center justify-center text-xs font-bold text-cyan-neon">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-cyan-neon font-bold">{item.time}</span>
                      <span className="text-xs text-slate-400">//</span>
                      <h3 className="text-xs font-bold text-slate-100">{item.title}</h3>
                    </div>
                    <span className="text-[11px] text-slate-500 font-sans">{item.actor}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400">
                    <span>Confidence:</span>
                    <strong className="text-cyan-neon">{item.confidence}%</strong>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-cyan-neon" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </div>

              {/* Expanded Evidence Details Drawer */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-tactical/60 space-y-3 text-xs animate-in fade-in duration-150">
                  <p className="text-slate-300 font-sans text-xs leading-relaxed bg-ops-card p-3 rounded border border-tactical">
                    {item.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 rounded bg-ops-card border border-tactical">
                      <span className="text-[10px] text-slate-500 uppercase block mb-1">DATA SOURCE / SENSOR HARDWARE</span>
                      <span className="text-slate-200">{item.dataSource}</span>
                    </div>

                    {item.similarIncident && (
                      <div className="p-2.5 rounded bg-ops-card border border-tactical">
                        <span className="text-[10px] text-cyan-neon uppercase block mb-1">HISTORICAL INCIDENT MATCH</span>
                        <span className="text-slate-200 font-bold">{item.similarIncident}</span>
                      </div>
                    )}
                  </div>

                  {/* Telemetry Key-Value Matrix */}
                  <div className="p-3 rounded bg-ops-card border border-tactical">
                    <span className="text-[10px] text-slate-400 uppercase block mb-2 font-bold">
                      VERIFIED TELEMETRY TELETYPES
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      {Object.entries(item.sensorData).map(([k, v]) => (
                        <div key={k} className="p-1.5 rounded bg-ops-surface border border-tactical">
                          <span className="text-[10px] text-slate-500 block truncate">{k}</span>
                          <span className="text-slate-200 font-bold truncate block">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
