import React from 'react';
import { PekkaProvider, usePekka } from './context/PekkaContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LiveDemoController } from './components/LiveDemoController';

// Views
import { CommandCenterView } from './views/CommandCenterView';
import { DigitalTwinView } from './views/DigitalTwinView';
import { InventoryView } from './views/InventoryView';
import { PredictionsView } from './views/PredictionsView';
import { IncidentsView } from './views/IncidentsView';
import { RecommendationsView } from './views/RecommendationsView';
import { EvidenceView } from './views/EvidenceView';
import { SimulationView } from './views/SimulationView';
import { AuditView } from './views/AuditView';
import { TelemetryView } from './views/TelemetryView';
import { LandingPage } from './views/LandingPage';

const AppContent: React.FC = () => {
  const { viewMode, activeTab, isBackendOnline } = usePekka();

  // If in landing page mode, render landing page
  if (viewMode === 'landing') {
    return (
      <div className="min-h-screen bg-ops-bg text-slate-200">
        <Header />
        <LandingPage />
        <LiveDemoController />
      </div>
    );
  }

  // Operations Command Center Mode
  return (
    <div className="min-h-screen bg-ops-bg text-slate-200 flex flex-col font-sans">
      {/* Top Professional Status Bar */}
      <Header />

      {/* Main Operations Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Left Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Center Stage Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-ops-bg relative">
          {!isBackendOnline && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-500/70 flex items-center justify-between text-xs text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold uppercase tracking-wider font-mono text-red-100">PEKKA AI Backend Offline</span>
                <span className="text-red-300 hidden md:inline">
                  — Cannot connect to FastAPI server at http://127.0.0.1:8001. Live telemetry streaming paused.
                </span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-900/60 border border-red-500/50 text-red-300">
                AUTO-RETRYING
              </span>
            </div>
          )}

          {activeTab === 'command-center' && <CommandCenterView />}
          {activeTab === 'telemetry' && <TelemetryView />}
          {activeTab === 'digital-twin' && <DigitalTwinView />}
          {activeTab === 'infrastructure' && <InventoryView />}
          {activeTab === 'predictions' && <PredictionsView />}
          {activeTab === 'incidents' && <IncidentsView />}
          {activeTab === 'recommendations' && <RecommendationsView />}
          {activeTab === 'evidence' && <EvidenceView />}
          {activeTab === 'simulation' && <SimulationView />}
          {activeTab === 'audit' && <AuditView />}
        </main>
      </div>

      {/* 60-Second Live Demo Controller HUD */}
      <LiveDemoController />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PekkaProvider>
      <AppContent />
    </PekkaProvider>
  );
};

export default App;
