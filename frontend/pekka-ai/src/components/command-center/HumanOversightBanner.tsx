import React from 'react';
import { ShieldCheck, Lock, UserCheck, AlertOctagon } from 'lucide-react';
import { usePekka } from '../../context/PekkaContext';

export const HumanOversightBanner: React.FC = () => {
  const { isInterventionApproved, recommendation } = usePekka();

  return (
    <div className={`marble-texture border-gold-hairline rounded-xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs select-none shadow-md transition-colors ${
      isInterventionApproved 
        ? 'border-[#3E7A4F]/60' 
        : 'border-[#C9A227]/30'
    }`}>
      {/* Left: Status & Autonomy Tier */}
      <div className="flex items-center space-x-3.5">
        <div className="w-9 h-9 rounded-lg bg-[#0B1310] border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] shadow-[inset_0_0_10px_rgba(201,162,39,0.15)] shrink-0">
          <ShieldCheck className="w-4.5 h-4.5 text-[#C9A227]" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold tracking-wider text-[#F2EDE0] text-sm">OPERATIONAL PROTOCOL:</span>
            <span className="text-[#3E7A4F] font-semibold bg-[#3E7A4F]/15 px-2 py-0.5 rounded border border-[#3E7A4F]/30 uppercase text-[11px]">
              Human Oversight Active
            </span>
            <span className="text-[#2A3B32]">|</span>
            <span className="text-[#8FBFA3] font-telemetry text-[11px]">AUTONOMY TIER 3</span>
          </div>
          <p className="text-xs text-[#B8C4BA] font-sans mt-0.5">
            High-impact circuit control actions strictly require dual certified human operator authorization.
          </p>
        </div>
      </div>

      {/* Right: Last Operator Action */}
      <div className="flex items-center space-x-3 self-end sm:self-center shrink-0">
        <div className="px-3.5 py-1.5 rounded-lg bg-[#0B1310]/90 border border-tactical text-xs flex items-center space-x-2">
          <UserCheck className="w-3.5 h-3.5 text-[#8FBFA3]" />
          <span className="text-[#8FBFA3] text-[11px] uppercase tracking-wider">Last Action:</span>
          <span className={`font-serif font-bold ${isInterventionApproved ? 'text-[#3E7A4F]' : 'text-[#C9A227]'}`}>
            {isInterventionApproved 
              ? 'Load reduction approved — 06:42 UTC' 
              : 'Awaiting Operator Approval — 06:41 UTC'}
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-1.5 text-[10px] font-telemetry text-[#8FBFA3]/70">
          <Lock className="w-3 h-3 text-[#3E7A4F]" />
          <span>ZERO-TOUCH BLOCKED</span>
        </div>
      </div>
    </div>
  );
};
