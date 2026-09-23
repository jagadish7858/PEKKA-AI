import React from 'react';
import { 
  Activity, 
  Cpu, 
  Network, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  FileSearch, 
  Sliders, 
  ScrollText, 
  Server, 
  Settings, 
  UserCheck,
  Gauge
} from 'lucide-react';
import { usePekka } from '../context/PekkaContext';
import { ViewTab } from '../types';

interface NavItem {
  id: ViewTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeType?: 'critical' | 'warning' | 'cyan';
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, incidents, recommendation, activeSensorsCount, isBackendOnline } = usePekka();

  const activeIncidentsCount = incidents.filter(i => !i.resolved).length;
  const isPendingRecommendation = recommendation.status === 'PENDING';

  const navItems: NavItem[] = [
    { id: 'command-center', label: 'Command Center', icon: Activity },
    { 
      id: 'telemetry', 
      label: 'Live Telemetry', 
      icon: Gauge, 
      badge: activeSensorsCount > 0 ? `${activeSensorsCount} Live` : undefined, 
      badgeType: 'cyan' 
    },
    { id: 'digital-twin', label: 'Digital Twin', icon: Cpu },
    { id: 'infrastructure', label: 'Infrastructure', icon: Network, badge: '10', badgeType: 'cyan' },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { 
      id: 'incidents', 
      label: 'Incidents', 
      icon: AlertTriangle, 
      badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined, 
      badgeType: 'critical' 
    },
    { 
      id: 'recommendations', 
      label: 'AI Recommendations', 
      icon: CheckCircle2, 
      badge: isPendingRecommendation ? 'Action' : undefined, 
      badgeType: 'warning' 
    },
    { id: 'evidence', label: 'Evidence', icon: FileSearch },
    { id: 'simulation', label: 'Simulation', icon: Sliders },
    { id: 'audit', label: 'Audit', icon: ScrollText },
  ];

  return (
    <aside className="w-64 marble-texture border-r border-tactical flex flex-col justify-between select-none z-20 shrink-0">
      {/* Top Section */}
      <div>
        {/* Navigation Category Label */}
        <div className="px-4 pt-5 pb-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-serif uppercase tracking-widest text-[#8FBFA3] font-semibold">
              Mission Control Views
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
          </div>
        </div>

        {/* Navigation List */}
        <nav className="px-2.5 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-sans transition-all group ${
                  isActive
                    ? 'nav-pill-active font-medium'
                    : 'text-[#B8C4BA] hover:text-[#F2EDE0] hover:bg-[#0B1310]/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#C9A227]' : 'text-[#8FBFA3]/70 group-hover:text-[#F2EDE0]'
                  }`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-serif font-bold ${
                    item.badgeType === 'critical'
                      ? 'bg-red-950/60 text-red-400 border border-red-500/40 animate-pulse'
                      : item.badgeType === 'warning'
                      ? 'bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/40'
                      : 'bg-[#8FBFA3]/15 text-[#8FBFA3] border border-[#8FBFA3]/40'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: System Status & Operator Profile */}
      <div className="p-3.5 border-t border-tactical space-y-2.5">
        {/* System Status Card */}
        <div className="p-2.5 rounded-lg bg-[#0B1310] border border-tactical text-[11px] font-sans">
          <div className="flex items-center justify-between text-[#B8C4BA]">
            <span className="flex items-center space-x-2">
              <Server className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="font-serif text-[11px] uppercase tracking-wider text-[#F2EDE0]">PEKKA Backend</span>
            </span>
            <span className={`font-serif font-bold text-[10px] uppercase px-1.5 py-0.5 rounded ${
              isBackendOnline ? 'text-[#3E7A4F] bg-[#10201A]' : 'text-red-400 bg-red-950/60'
            }`}>
              {isBackendOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-telemetry text-[#8FBFA3]">
            <span>Port: :8001</span>
            <span>{isBackendOnline ? `${activeSensorsCount} Probes` : 'Disconnected'}</span>
          </div>
        </div>

        {/* Operator Profile Card */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B1310] border border-tactical">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#10201A] border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227]">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-serif font-semibold text-[#F2EDE0]">Cmdr. G. Sharma</div>
              <div className="text-[10px] text-[#8FBFA3] font-sans">Chief Reliability Lead</div>
            </div>
          </div>
          <button 
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#C9A227] hover:bg-[#10201A] transition-colors"
            title="Command Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
