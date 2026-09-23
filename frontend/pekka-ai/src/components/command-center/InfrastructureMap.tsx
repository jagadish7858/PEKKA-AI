import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Droplets, 
  Train, 
  Radio, 
  Maximize2, 
  Minimize2, 
  Layers, 
  AlertTriangle, 
  CheckCircle2,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { usePekka } from '../../context/PekkaContext';
import { AssetSector, AssetStatus, InfrastructureAsset } from '../../types';

interface MapProps {
  onSelectAsset?: (assetId: string) => void;
}

export const InfrastructureMap: React.FC<MapProps> = ({ onSelectAsset }) => {
  const { assets, selectedAssetId, setSelectedAssetId, isInterventionApproved } = usePekka();
  const [activeSectorFilter, setActiveSectorFilter] = useState<'all' | AssetSector>('all');
  const [hoveredAsset, setHoveredAsset] = useState<InfrastructureAsset | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtered assets
  const filteredAssets = assets.filter(
    a => activeSectorFilter === 'all' || a.sector === activeSectorFilter
  );

  const handleNodeClick = (assetId: string) => {
    setSelectedAssetId(assetId);
    if (onSelectAsset) onSelectAsset(assetId);
  };

  // Helper for status colors
  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case 'PREDICTED_FAILURE':
        return '#EF4444'; // Red alarm
      case 'CRITICAL':
        return '#EF4444';
      case 'ANOMALY':
        return '#F97316'; // Orange
      case 'WARNING':
        return '#C9A227'; // Antique Gold
      case 'MONITORING':
        return '#C9A227'; // Antique Gold
      case 'NORMAL':
      default:
        return '#8FBFA3'; // Sage / Muted Jade
    }
  };

  const getSectorIcon = (sector: AssetSector) => {
    switch (sector) {
      case 'power':
        return Zap;
      case 'water':
        return Droplets;
      case 'transport':
        return Train;
      case 'communication':
        return Radio;
    }
  };

  // Connections lines between assets
  const connectionsList = React.useMemo(() => {
    const list: Array<{ from: InfrastructureAsset; to: InfrastructureAsset; key: string }> = [];
    const visited = new Set<string>();

    assets.forEach(asset => {
      asset.connections.forEach(targetId => {
        const target = assets.find(a => a.id === targetId);
        if (!target) return;
        const key = [asset.id, target.id].sort().join('-');
        if (!visited.has(key)) {
          visited.add(key);
          list.push({ from: asset, to: target, key });
        }
      });
    });
    return list;
  }, [assets]);

  return (
    <div 
      ref={containerRef}
      className={`marble-texture border border-gold-hairline rounded-xl relative overflow-hidden flex flex-col transition-all shadow-xl ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[520px] mb-6'
      }`}
    >
      {/* Map Header & Controls */}
      <div className="p-3.5 bg-[#10201A]/95 border-b border-tactical flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse shadow-[0_0_8px_#C9A227]" />
            <h2 className="text-xs font-serif font-bold tracking-widest text-[#F2EDE0] uppercase">
              Digital Infrastructure Topology
            </h2>
          </div>
          <span className="text-[10px] font-telemetry text-[#8FBFA3] hidden sm:inline">
            // LIVE SCADA TELEMETRY BUS
          </span>
        </div>

        {/* Sector Filters & Fullscreen */}
        <div className="flex items-center space-x-1.5 text-xs">
          {(['all', 'power', 'water', 'transport', 'communication'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveSectorFilter(filter)}
              className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                activeSectorFilter === filter
                  ? 'bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/50 font-serif font-semibold'
                  : 'text-[#B8C4BA] hover:text-[#F2EDE0] hover:bg-[#0B1310]'
              }`}
            >
              {filter}
            </button>
          ))}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 ml-2 rounded-md text-slate-400 hover:text-[#C9A227] hover:bg-[#0B1310] border border-tactical"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Topology Map'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="flex-1 relative bg-[#0B1310] bg-grid-pattern overflow-hidden select-none">
        
        {/* Tactical Radar Sweep Overlay - Antique Gold Tinted */}
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <div className="w-full h-full border border-[#C9A227]/20 rounded-full scale-125 animate-radar origin-center bg-gradient-to-tr from-[#C9A227]/15 via-transparent to-transparent" />
        </div>

        {/* Grid coordinates labels in background */}
        <div className="absolute top-3 left-4 font-telemetry text-[10px] text-[#8FBFA3]/60 space-y-0.5 pointer-events-none">
          <div>GEO: 40.7128° N, 74.0060° W</div>
          <div>GRID DOMAIN: METRO_EAST_SYNCHRONOUS</div>
          <div>TELEMETRY REFRESH: 250ms</div>
        </div>

        {/* Topology SVG Layer */}
        <svg className="w-full h-full absolute inset-0">
          <defs>
            {/* Animated Flow Gradient - Antique Gold */}
            <linearGradient id="flow-pulse-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9A227" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#C9A227" stopOpacity="1" />
              <stop offset="100%" stopColor="#C9A227" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="flow-pulse-danger" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#EF4444" stopOpacity="1" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.2" />
            </linearGradient>

            {/* Glowing Drop Shadows */}
            <filter id="glow-danger" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <filter id="glow-cyan-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connection Lines (Transmission lines, water pipelines, fiber links) */}
          {connectionsList.map(conn => {
            const isHazardConnected = 
              (conn.from.id === 'S-17' || conn.to.id === 'S-17') && !isInterventionApproved;

            return (
              <g key={conn.key}>
                {/* Background static line */}
                <line
                  x1={`${conn.from.coordinates.x}%`}
                  y1={`${conn.from.coordinates.y}%`}
                  x2={`${conn.to.coordinates.x}%`}
                  y2={`${conn.to.coordinates.y}%`}
                  stroke={isHazardConnected ? 'rgba(239, 68, 68, 0.4)' : '#2A3B32'}
                  strokeWidth={isHazardConnected ? '2.5' : '1.5'}
                  strokeDasharray={isHazardConnected ? '4 3' : 'none'}
                />

                {/* Animated telemetry pulse packet - Sage for healthy, Crimson for hazard */}
                <line
                  x1={`${conn.from.coordinates.x}%`}
                  y1={`${conn.from.coordinates.y}%`}
                  x2={`${conn.to.coordinates.x}%`}
                  y2={`${conn.to.coordinates.y}%`}
                  stroke={isHazardConnected ? '#EF4444' : '#8FBFA3'}
                  strokeWidth={isHazardConnected ? '3' : '2'}
                  strokeDasharray="8 60"
                  className={isHazardConnected ? 'animate-pulse-fast' : ''}
                  style={{
                    animation: `dash 3s linear infinite`,
                  }}
                  strokeOpacity={isHazardConnected ? 0.95 : 0.75}
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer (DOM elements positioned over SVG coordinates for maximum interactivity) */}
        {filteredAssets.map(asset => {
          const isSelected = asset.id === selectedAssetId;
          const isS17 = asset.id === 'S-17';
          const isCritical = asset.status === 'PREDICTED_FAILURE' && !isInterventionApproved;
          const SectorIcon = getSectorIcon(asset.sector);
          const color = getStatusColor(isInterventionApproved && isS17 ? 'NORMAL' : asset.status);

          return (
            <div
              key={asset.id}
              onClick={() => handleNodeClick(asset.id)}
              onMouseEnter={() => setHoveredAsset(asset)}
              onMouseLeave={() => setHoveredAsset(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              style={{
                left: `${asset.coordinates.x}%`,
                top: `${asset.coordinates.y}%`,
              }}
            >
              {/* Outer pulsing ring for S-17 critical incident */}
              {isCritical && (
                <div className="absolute inset-0 -m-4 rounded-full border-2 border-red-500 animate-ping opacity-60 pointer-events-none" />
              )}
              {isCritical && (
                <div className="absolute inset-0 -m-2 rounded-full bg-red-500/20 blur-md pointer-events-none" />
              )}

              {/* Main Node Shell */}
              <div 
                className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-[#C9A227] scale-110 shadow-[0_0_15px_rgba(201,162,39,0.7)]'
                    : 'hover:scale-110 shadow-lg'
                }`}
                style={{
                  backgroundColor: '#10201A',
                  borderColor: isCritical ? '#EF4444' : isSelected ? '#C9A227' : 'rgba(201,162,39,0.3)',
                  boxShadow: isCritical ? '0 0 18px rgba(239, 68, 68, 0.7)' : undefined
                }}
              >
                <SectorIcon 
                  className="w-4 h-4 transition-transform group-hover:scale-110" 
                  style={{ color }}
                />
              </div>

              {/* Node ID Tag & Status Badge */}
              <div className="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none">
                <div className="flex items-center space-x-1.5 bg-[#0B1310]/95 px-2 py-0.5 rounded-md border border-tactical shadow-md">
                  <span className="text-[10px] font-telemetry font-bold text-[#F2EDE0]">
                    {asset.id}
                  </span>
                  {isCritical ? (
                    <span className="text-[9px] font-telemetry font-bold text-red-400 bg-red-950/70 px-1 rounded animate-pulse">
                      87% RISK
                    </span>
                  ) : isInterventionApproved && isS17 ? (
                    <span className="text-[9px] font-telemetry font-bold text-[#3E7A4F] bg-[#10201A] px-1 rounded">
                      29% STABLE
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}

        {/* Hover / Tooltip Card */}
        {hoveredAsset && (
          <div 
            className="absolute z-30 pointer-events-none bg-[#10201A]/95 border border-[#C9A227]/40 rounded-lg p-3 shadow-2xl backdrop-blur-md text-xs w-60 animate-in fade-in duration-150"
            style={{
              left: `min(calc(${hoveredAsset.coordinates.x}% + 24px), 75%)`,
              top: `min(calc(${hoveredAsset.coordinates.y}% - 20px), 75%)`,
            }}
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-tactical">
              <span className="font-serif font-bold text-[#F2EDE0]">{hoveredAsset.name}</span>
              <span 
                className="text-[9px] font-telemetry px-1.5 py-0.5 rounded font-bold uppercase"
                style={{
                  color: getStatusColor(hoveredAsset.status),
                  backgroundColor: `${getStatusColor(hoveredAsset.status)}22`
                }}
              >
                {hoveredAsset.status.replace('_', ' ')}
              </span>
            </div>

            <div className="text-[10px] font-sans text-[#8FBFA3] mb-2">{hoveredAsset.type}</div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-sans">
              <div>
                <span className="text-[#708778]">HEALTH: </span>
                <span className="text-[#F2EDE0] font-serif font-bold">{hoveredAsset.health}/100</span>
              </div>
              <div>
                <span className="text-[#708778]">RISK: </span>
                <span className={`font-serif font-bold ${hoveredAsset.risk > 50 ? 'text-red-400' : 'text-[#3E7A4F]'}`}>
                  {hoveredAsset.risk}%
                </span>
              </div>
              {hoveredAsset.timeToFailure && (
                <div className="col-span-2 text-red-400 font-bold font-telemetry">
                  FAILURE IN: {hoveredAsset.timeToFailure}
                </div>
              )}
            </div>
            
            <div className="mt-2 pt-1.5 border-t border-tactical text-[9px] font-serif text-[#C9A227]">
              Click node to open PEKKA Intelligence →
            </div>
          </div>
        )}

        {/* Highlighted Incident Callout Banner on Map */}
        <div className="absolute bottom-3 left-3 z-10 max-w-sm bg-[#10201A]/95 backdrop-blur-md border border-red-500/40 rounded-xl p-3 text-xs shadow-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center space-x-1.5 text-red-400 font-serif font-bold text-xs">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              <span>INCIDENT TARGET: SUBSTATION S-17</span>
            </span>
            <span className="text-[10px] font-telemetry px-2 py-0.5 rounded-md bg-red-950 border border-red-500/50 text-red-400 font-bold">
              {isInterventionApproved ? 'STABILIZED (29%)' : 'PREDICTED FAILURE'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#B8C4BA] font-sans">
            <span>Risk Index: <strong className="font-serif text-red-400">{isInterventionApproved ? '29%' : '87%'}</strong></span>
            <span>Horizon: <strong className="font-serif text-[#F2EDE0]">{isInterventionApproved ? 'Nominal' : '04h 32m'}</strong></span>
            <span>Confidence: <strong className="font-serif text-[#C9A227]">92.4%</strong></span>
          </div>

          <button
            onClick={() => handleNodeClick('S-17')}
            className="w-full mt-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-[10px] font-serif font-bold tracking-wider uppercase transition-colors"
          >
            {selectedAssetId === 'S-17' ? '● VIEWING INTELLIGENCE PANEL' : 'OPEN S-17 INTELLIGENCE PANEL →'}
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 z-10 hidden md:flex items-center space-x-3.5 bg-[#10201A]/95 px-3.5 py-2 rounded-lg border border-tactical text-[10px] text-[#B8C4BA]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8FBFA3]" />
            <span className="font-sans">Normal</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
            <span className="font-sans">Monitoring</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="font-sans">Warning</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-sans">Critical</span>
          </div>
        </div>

      </div>
    </div>
  );
};
