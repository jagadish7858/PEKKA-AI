import React, { useState } from 'react';
import { 
  GitFork, 
  ArrowDown, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { ROOT_CAUSE_NODES, ROOT_CAUSE_EDGES } from '../data/mockData';
import { RootCauseNode } from '../types';

export const RootCauseView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<RootCauseNode>(
    ROOT_CAUSE_NODES.find(n => n.isProbableRootCause) || ROOT_CAUSE_NODES[2]
  );

  const nodeDetails: Record<string, { summary: string; sensorProof: string; physicsModel: string }> = {
    n1: {
      summary: 'Temperature sensor TS-402 on Phase B registered +18% thermal excursion beyond dynamic rating curve.',
      sensorProof: 'TS-402: 72.4°C vs 61.2°C nominal. Thermal time constant τ = 42 min.',
      physicsModel: 'IEEE C57.91 thermal model indicates accelerated insulation loss-of-life rate multiplier = 3.8x.'
    },
    n2: {
      summary: 'Thermal differential across oil channels created internal hot-spot gradients inducing localized mechanical expansion.',
      sensorProof: 'Top-oil to bottom-oil gradient expanded from standard 12°C to 24.8°C.',
      physicsModel: 'Thermo-hydraulic finite element flow analysis predicts laminar stagnation in inner winding duct.'
    },
    n3: {
      summary: 'PROBABLE ROOT CAUSE: Micro-void discharges in cellulosic paper insulation under repetitive harmonic vibration stress.',
      sensorProof: 'Dissolved gas analysis (DGA) confirms elevated Ethylene (C2H4) and Acetylene (C2H2) traces.',
      physicsModel: 'Arrhenius reaction rate formulation shows non-reversible DP (Degree of Polymerization) drop below 350.'
    },
    n4: {
      summary: 'Impedance asymmetry induced busbar voltage harmonic distortion and tap changer hunt oscillations.',
      sensorProof: 'Secondary voltage bus 398.2 kV drifting with 0.8% THD (Total Harmonic Distortion).',
      physicsModel: 'Electromechanical transient simulation reveals negative sequence current amplification.'
    },
    n5: {
      summary: 'Phase B/C cross-load imbalance forced automated tie-line reclosing cycles, stressing breaker contacts.',
      sensorProof: 'Phase current delta: Phase B (1,840A) vs Phase A (1,610A) = 230A asymmetry.',
      physicsModel: 'Symmetrical component decomposition yields 4.2% unbalance factor exceeding 2% NEMA MG1 limit.'
    },
    n6: {
      summary: 'Critical cascade threat: Trip of S-17 sheds 250 MVA into adjoining transmission paths, risking wide-area blackout.',
      sensorProof: 'Downstream telemetry triggers 8 contingency alarms across transit rail and water intake.',
      physicsModel: 'N-1 contingency criterion failure: loss of S-17 violates thermal ratings of lines L-104 and L-212.'
    }
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-tactical gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center">
              ROOT-CAUSE ANALYSIS
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-dim/20 text-cyan-neon border border-cyan-dim/40">
              CAUSAL DIRECTED GRAPH
            </span>
          </div>
          <p className="text-xs text-ops-textMuted font-mono mt-0.5">
            Trace failure mechanisms backward from surface anomalies to core physical defects
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-400">Model:</span>
          <span className="text-cyan-neon font-bold">PEKKA-BayesianCausal v4.2</span>
        </div>
      </div>

      {/* Main Grid: Causal DAG flow (7 cols) + Node Deep Dive (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Interactive Vertical DAG Flow */}
        <div className="lg:col-span-7 bg-ops-surface border border-tactical rounded p-5 select-none">
          <div className="flex items-center justify-between pb-3 border-b border-tactical mb-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              CAUSAL PROPAGATION CHAIN
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              CLICK ANY NODE TO INSPECT EVIDENCE
            </span>
          </div>

          {/* Vertical Node Sequence with Confidence Connectors */}
          <div className="flex flex-col items-center space-y-2 max-w-md mx-auto">
            {ROOT_CAUSE_NODES.map((node, index) => {
              const isSelected = selectedNode.id === node.id;
              const isRoot = !!node.isProbableRootCause;
              const edge = ROOT_CAUSE_EDGES[index];

              return (
                <React.Fragment key={node.id}>
                  {/* Causal Node Card */}
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`w-full p-3 rounded border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-cyan-dim/15 border-cyan-neon shadow-[0_0_15px_rgba(0,240,255,0.25)] scale-[1.02]'
                        : isRoot
                        ? 'bg-red-950/20 border-red-500/60 hover:border-red-400'
                        : 'bg-ops-card border-tactical hover:border-tactical-cyan'
                    }`}
                  >
                    {isRoot && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[9px] font-bold uppercase tracking-wider shadow-md animate-pulse">
                        ★ PROBABLE ROOT CAUSE
                      </span>
                    )}

                    <div className="flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                          isRoot
                            ? 'bg-red-500 text-slate-950'
                            : isSelected
                            ? 'bg-cyan-neon text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {index + 1}
                        </span>
                        <span className={`font-semibold tracking-wide ${
                          isRoot ? 'text-red-300' : isSelected ? 'text-cyan-neon' : 'text-slate-200'
                        }`}>
                          {node.label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-500 uppercase">{node.category}</span>
                        <span className="font-bold text-cyan-neon tabular-nums">{node.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Connecting Edge with Confidence Value */}
                  {edge && (
                    <div className="flex flex-col items-center my-0.5">
                      <div className="flex items-center space-x-1.5 py-0.5 px-2 rounded-full bg-ops-card border border-tactical/80 text-[10px] font-mono text-slate-400">
                        <ArrowDown className="w-3 h-3 text-cyan-neon animate-bounce" />
                        <span>Link Confidence: <strong className="text-cyan-neon">{edge.confidence}%</strong></span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Node Physics & Evidence Inspection */}
        <div className="lg:col-span-5 bg-ops-surface border border-tactical rounded p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-tactical mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-neon" />
                <span>NODE EVIDENCE PROFILE</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-neon px-2 py-0.5 rounded bg-cyan-dim/15 border border-cyan-dim/30">
                {selectedNode.category.toUpperCase()}
              </span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block mb-1">SELECTED PHENOMENON</span>
                <div className="text-base font-bold text-slate-100">{selectedNode.label}</div>
              </div>

              <div className="p-3 rounded bg-ops-card border border-tactical space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Causal Summary</span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {nodeDetails[selectedNode.id]?.summary}
                </p>
              </div>

              <div className="p-3 rounded bg-ops-card border border-tactical space-y-1">
                <span className="text-[10px] text-cyan-neon uppercase block font-bold">Telemetry Sensor Proof</span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {nodeDetails[selectedNode.id]?.sensorProof}
                </p>
              </div>

              <div className="p-3 rounded bg-ops-card border border-tactical space-y-1">
                <span className="text-[10px] text-amber-400 uppercase block font-bold">Physics Model Correlation</span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {nodeDetails[selectedNode.id]?.physicsModel}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded bg-cyan-dim/10 border border-cyan-dim/30 text-xs font-mono text-slate-300">
            <span className="font-bold text-cyan-neon block mb-1">PREVENTIVE INTERVENTION POINT:</span>
            Mitigating at <strong>Node #3 (Transformer Degradation)</strong> prevents downstream cascading instability across Nodes #4, #5, and #6.
          </div>
        </div>

      </div>
    </div>
  );
};
