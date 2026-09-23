import React, { useState } from 'react';
import { 
  Network, 
  Zap, 
  Droplets, 
  Train, 
  Radio, 
  Search, 
  Filter, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { usePekka } from '../context/PekkaContext';
import { AssetSector, InfrastructureAsset } from '../types';

export const InventoryView: React.FC = () => {
  const { assets, setSelectedAssetId, setActiveTab, isInterventionApproved } = usePekka();
  const [selectedSector, setSelectedSector] = useState<'all' | AssetSector>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAssets = assets.filter(asset => {
    const matchesSector = selectedSector === 'all' || asset.sector === selectedSector;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

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

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setActiveTab('command-center');
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-tactical gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center">
              INFRASTRUCTURE INVENTORY
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-dim/20 text-cyan-neon border border-cyan-dim/40">
              CROSS-SECTOR CATALOG
            </span>
          </div>
          <p className="text-xs text-ops-textMuted font-mono mt-0.5">
            Real-time health, risk scores, maintenance schedules, and predictive state across all 4 operational domains
          </p>
        </div>

        {/* Search & Sector Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 rounded bg-ops-card border border-tactical focus:border-cyan-dim text-slate-200 text-xs placeholder:text-slate-500 outline-none w-48"
            />
          </div>

          {/* Sector Buttons */}
          {(['all', 'power', 'water', 'transport', 'communication'] as const).map(sector => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-2.5 py-1 rounded capitalize border transition-all ${
                selectedSector === sector
                  ? 'bg-cyan-dim/20 text-cyan-neon border-cyan-dim/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 border-tactical hover:bg-ops-card'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Inventory Table */}
      <div className="bg-ops-surface border border-tactical rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-ops-card/80 border-b border-tactical text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3">Type & Rating</th>
                <th className="py-2.5 px-3">Health Score</th>
                <th className="py-2.5 px-3">Predicted Risk</th>
                <th className="py-2.5 px-3">Last Maintenance</th>
                <th className="py-2.5 px-3">Predicted Failure</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical">
              {filteredAssets.map(asset => {
                const SectorIcon = getSectorIcon(asset.sector);
                const isCritical = asset.id === 'S-17' && !isInterventionApproved;

                return (
                  <tr key={asset.id} className="hover:bg-ops-card/50 transition-colors">
                    {/* Asset ID & Name */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                        <span className="text-cyan-neon">{asset.id}</span>
                        <span className="text-slate-400">//</span>
                        <span>{asset.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-sans">{asset.location}</span>
                    </td>

                    {/* Sector */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5 capitalize text-slate-300">
                        <SectorIcon className="w-3.5 h-3.5 text-cyan-neon" />
                        <span>{asset.sector}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3 text-slate-300 max-w-xs font-sans text-xs">
                      {asset.type}
                    </td>

                    {/* Health */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-100 tabular-nums">
                          {isInterventionApproved && asset.id === 'S-17' ? 88 : asset.health}
                        </span>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              asset.health > 80 ? 'bg-emerald-400' : asset.health > 60 ? 'bg-amber-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${isInterventionApproved && asset.id === 'S-17' ? 88 : asset.health}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Risk */}
                    <td className="py-3 px-3">
                      <span className={`text-base font-bold tabular-nums ${
                        (isInterventionApproved && asset.id === 'S-17' ? 29 : asset.risk) > 60
                          ? 'text-red-400'
                          : (isInterventionApproved && asset.id === 'S-17' ? 29 : asset.risk) > 20
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {isInterventionApproved && asset.id === 'S-17' ? '29%' : `${asset.risk}%`}
                      </span>
                    </td>

                    {/* Last Maintenance */}
                    <td className="py-3 px-3 text-slate-400 tabular-nums">
                      {asset.lastMaintenance}
                    </td>

                    {/* Predicted Failure */}
                    <td className="py-3 px-3">
                      {asset.timeToFailure ? (
                        <span className={`font-bold ${isCritical ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                          {isInterventionApproved && asset.id === 'S-17' ? 'Threat Mitigated' : asset.timeToFailure}
                        </span>
                      ) : (
                        <span className="text-slate-500">None Predicted</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-red-950/60 text-red-400 border border-red-500/40 animate-pulse'
                          : isInterventionApproved && asset.id === 'S-17'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                          : asset.status === 'WARNING'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {isInterventionApproved && asset.id === 'S-17' ? 'STABILIZED' : asset.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleSelectAsset(asset.id)}
                        className="px-2.5 py-1 rounded bg-ops-card hover:bg-ops-surface border border-tactical hover:border-cyan-dim/50 text-cyan-neon text-xs transition-colors"
                      >
                        Profile →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
