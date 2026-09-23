import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  InfrastructureAsset, 
  SensorMetric, 
  Incident, 
  Recommendation, 
  AuditLogEntry, 
  ViewTab, 
  WhatIfScenarioState,
  TelemetryReading
} from '../types';
import { 
  INITIAL_ASSETS, 
  INITIAL_SENSORS_S17, 
  INITIAL_RECOMMENDATION, 
  INITIAL_INCIDENTS, 
  INITIAL_AUDIT_LOGS,
  LIVE_DEMO_PHASES 
} from '../data/mockData';
import { soundFX } from '../utils/audio';
import { 
  pekkaApi, 
  BackendSensorReading, 
  BackendAnomalyReport, 
  BackendFailurePrediction, 
  BackendRecommendationResponse 
} from '../services/api';

const SENSOR_META: Record<string, { name: string; unit: string; normalMin: number; normalMax: number }> = {
  TEMPERATURE: { name: 'WINDING TEMPERATURE', unit: '°C', normalMin: 50.0, normalMax: 80.0 },
  VOLTAGE: { name: 'BUSBAR VOLTAGE', unit: 'V', normalMin: 210.0, normalMax: 240.0 },
  CURRENT: { name: 'LOAD CURRENT', unit: 'A', normalMin: 10.0, normalMax: 50.0 },
  VIBRATION: { name: 'CORE VIBRATION', unit: 'mm/s', normalMin: 0.1, normalMax: 2.5 },
  LOAD: { name: 'TRANSFORMER LOAD', unit: '%', normalMin: 40.0, normalMax: 75.0 },
  POWER_FACTOR: { name: 'POWER FACTOR', unit: 'PF', normalMin: 0.85, normalMax: 0.98 },
  FREQUENCY: { name: 'GRID FREQUENCY', unit: 'Hz', normalMin: 49.5, normalMax: 50.5 },
  OIL_TEMPERATURE: { name: 'TOP OIL TEMPERATURE', unit: '°C', normalMin: 45.0, normalMax: 75.0 },
  OIL_PRESSURE: { name: 'TANK OIL PRESSURE', unit: 'bar', normalMin: 1.5, normalMax: 3.5 },
};

interface PekkaContextType {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  viewMode: 'app' | 'landing';
  setViewMode: (mode: 'app' | 'landing') => void;
  selectedAssetId: string;
  setSelectedAssetId: (id: string) => void;
  selectedAsset: InfrastructureAsset;
  assets: InfrastructureAsset[];
  sensors: SensorMetric[];
  incidents: Incident[];
  recommendation: Recommendation;
  auditLogs: AuditLogEntry[];
  
  // Real-time backend connection status
  isBackendOnline: boolean;
  backendError: string | null;
  lastTelemetryUpdate: string | null;
  activeSensorsCount: number;
  monitoredEquipmentCount: number;
  backendAnomalyReport: BackendAnomalyReport | null;
  backendPrediction: BackendFailurePrediction | null;
  backendRecommendation: BackendRecommendationResponse | null;
  backendReadings: BackendSensorReading[];
  detectedScenario: 'NORMAL' | 'WARNING' | 'CRITICAL';
  refreshTelemetry: () => Promise<void>;

  // Real-time countdown
  countdownSeconds: number;
  countdownFormatted: { hours: string; minutes: string; seconds: string };
  
  // Actions & Human-in-the-Loop
  isInterventionApproved: boolean;
  approveRecommendation: () => void;
  rejectRecommendation: () => void;
  resetInfrastructure: () => void;
  
  // Audio state
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  
  // What-If Simulation
  whatIfParams: WhatIfScenarioState;
  updateWhatIfParams: (params: Partial<WhatIfScenarioState>) => void;
  
  // 60-Second Live Demo Controller
  demoActive: boolean;
  demoCurrentStep: number;
  demoIsPaused: boolean;
  startLiveDemo: () => void;
  stopLiveDemo: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  setDemoStep: (step: number) => void;
  toggleDemoPause: () => void;
}

const PekkaContext = createContext<PekkaContextType | undefined>(undefined);

export const PekkaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<ViewTab>('command-center');
  const [viewMode, setViewModeState] = useState<'app' | 'landing'>('app');
  const [selectedAssetId, setSelectedAssetIdState] = useState<string>('TRANSFORMER-01');
  const [assets, setAssets] = useState<InfrastructureAsset[]>(INITIAL_ASSETS);
  const [sensors, setSensors] = useState<SensorMetric[]>(INITIAL_SENSORS_S17);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [recommendation, setRecommendation] = useState<Recommendation>(INITIAL_RECOMMENDATION);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  
  // Backend real-time integration states
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [lastTelemetryUpdate, setLastTelemetryUpdate] = useState<string | null>(null);
  const [activeSensorsCount, setActiveSensorsCount] = useState<number>(0);
  const [monitoredEquipmentCount] = useState<number>(2); // TRANSFORMER-01 and TRANSFORMER-02
  const [backendAnomalyReport, setBackendAnomalyReport] = useState<BackendAnomalyReport | null>(null);
  const [backendPrediction, setBackendPrediction] = useState<BackendFailurePrediction | null>(null);
  const [backendRecommendation, setBackendRecommendation] = useState<BackendRecommendationResponse | null>(null);
  const [backendReadings, setBackendReadings] = useState<BackendSensorReading[]>([]);
  const [detectedScenario, setDetectedScenario] = useState<'NORMAL' | 'WARNING' | 'CRITICAL'>('NORMAL');

  // History buffer for smooth chart rendering per sensor
  const sensorHistoryMap = useRef<Record<string, TelemetryReading[]>>({});

  // Countdown: 04:32:18 initially = 16338 seconds
  const [countdownSeconds, setCountdownSeconds] = useState<number>(4 * 3600 + 32 * 60 + 18);
  const [isInterventionApproved, setIsInterventionApproved] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  // What-If parameters for Digital Twin & Simulation
  const [whatIfParams, setWhatIfParams] = useState<WhatIfScenarioState>({
    extraLoadPct: 0,
    ambientHeatWave: false,
    pumpShutdown: false,
    telecomPacketLoss: false,
    degradationMultiplier: 1.0,
  });

  // 60-second interactive Live Demo state
  const [demoActive, setDemoActive] = useState<boolean>(false);
  const [demoCurrentStep, setDemoCurrentStep] = useState<number>(1);
  const [demoIsPaused, setDemoIsPaused] = useState<boolean>(false);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    soundFX.enabled = enabled;
  };

  const setActiveTab = (tab: ViewTab) => {
    soundFX.playClick();
    setActiveTabState(tab);
  };

  const setViewMode = (mode: 'app' | 'landing') => {
    soundFX.playClick();
    setViewModeState(mode);
  };

  const setSelectedAssetId = (id: string) => {
    soundFX.playClick();
    setSelectedAssetIdState(id);
    if (id === 'TRANSFORMER-01' || id === 'TRANSFORMER-02' || id === 'S-17') {
      soundFX.playScanBlip();
    }
  };

  const selectedAsset = useMemo(() => {
    return assets.find(a => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  // Real-time countdown
  useEffect(() => {
    if (isInterventionApproved) return;
    const interval = setInterval(() => {
      setCountdownSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isInterventionApproved]);

  const countdownFormatted = useMemo(() => {
    const hrs = Math.floor(countdownSeconds / 3600);
    const mins = Math.floor((countdownSeconds % 3600) / 60);
    const secs = countdownSeconds % 60;
    return {
      hours: hrs.toString().padStart(2, '0'),
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  }, [countdownSeconds]);

  /**
   * Core Polling & Data Sync with FastAPI Backend
   */
  const refreshTelemetry = useCallback(async () => {
    try {
      // 1. Health check
      await pekkaApi.checkHealth();
      setIsBackendOnline(true);
      setBackendError(null);

      // Determine which equipment ID to query from backend
      // Default to selected asset if it is a transformer, otherwise TRANSFORMER-01
      const targetEquipmentId = 
        selectedAssetId.startsWith('TRANSFORMER-') 
          ? selectedAssetId 
          : 'TRANSFORMER-01';

      // 2. Fetch live data in parallel
      const [
        latestReadingsRes,
        equipmentReadingsRes,
        anomalyRes,
        predictionRes,
        recommendationRes
      ] = await Promise.all([
        pekkaApi.getLatestReadings().catch(() => ({ success: false, count: 0, readings: [] as BackendSensorReading[] })),
        pekkaApi.getEquipmentReadings(targetEquipmentId, 50).catch(() => ({ success: false, count: 0, readings: [] as BackendSensorReading[] })),
        pekkaApi.getAnomalyReport(targetEquipmentId).catch(() => null),
        pekkaApi.getFailurePrediction(targetEquipmentId).catch(() => null),
        pekkaApi.getRecommendations(targetEquipmentId).catch(() => null),
      ]);

      setLastTelemetryUpdate(new Date().toLocaleTimeString());
      setActiveSensorsCount(latestReadingsRes.readings.length);
      setBackendReadings(latestReadingsRes.readings);

      if (anomalyRes) setBackendAnomalyReport(anomalyRes);
      if (predictionRes) setBackendPrediction(predictionRes);
      if (recommendationRes) setBackendRecommendation(recommendationRes);

      // Determine overall scenario based on backend results
      let scenario: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
      if (
        anomalyRes?.severity === 'CRITICAL' ||
        predictionRes?.riskLevel === 'CRITICAL' ||
        recommendationRes?.urgency === 'IMMEDIATE_ACTION'
      ) {
        scenario = 'CRITICAL';
      } else if (
        anomalyRes?.severity === 'WARNING' ||
        predictionRes?.riskLevel === 'HIGH' ||
        predictionRes?.riskLevel === 'MEDIUM' ||
        recommendationRes?.urgency === 'URGENT_ACTION' ||
        recommendationRes?.urgency === 'SCHEDULE_INSPECTION'
      ) {
        scenario = 'WARNING';
      }
      setDetectedScenario(scenario);

      // 3. Update sensors array from actual backend readings
      const targetReadings = latestReadingsRes.readings.filter(r => r.equipmentId === targetEquipmentId);
      
      if (targetReadings.length > 0) {
        const updatedSensors: SensorMetric[] = targetReadings.map(reading => {
          const meta = SENSOR_META[reading.sensorType] || {
            name: reading.sensorType.replace('_', ' '),
            unit: reading.unit,
            normalMin: 0,
            normalMax: 100
          };

          const mid = (meta.normalMin + meta.normalMax) / 2;
          const deviation = mid !== 0 ? ((reading.value - mid) / mid) * 100 : 0;
          
          // History tracking: collect past readings from equipment history
          const matchingHistory = equipmentReadingsRes.readings
            .filter(r => r.sensorId === reading.sensorId)
            .slice(-15)
            .map(r => ({
              timestamp: new Date(r.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
              value: r.value
            }));

          // Fallback to internal buffer if backend history has only 1 reading
          if (!sensorHistoryMap.current[reading.sensorId]) {
            sensorHistoryMap.current[reading.sensorId] = [];
          }
          const buf = sensorHistoryMap.current[reading.sensorId];
          buf.push({
            timestamp: new Date(reading.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
            value: reading.value
          });
          if (buf.length > 15) buf.shift();

          const finalHistory = matchingHistory.length > 1 ? matchingHistory : [...buf];

          // Compute sensor anomaly score from backend report if present
          let sensorAnomalyScore = 0.15;
          if (anomalyRes) {
            const hasDetail = anomalyRes.details.some(d => d.sensorId === reading.sensorId);
            if (hasDetail) {
              sensorAnomalyScore = anomalyRes.anomalyScore ?? (reading.status === 'CRITICAL' ? 0.95 : 0.82);
            } else if (reading.status === 'CRITICAL') {
              sensorAnomalyScore = 0.92;
            } else if (reading.status === 'WARNING') {
              sensorAnomalyScore = 0.76;
            } else {
              sensorAnomalyScore = Number((Math.min(0.35, Math.abs(deviation) / 100)).toFixed(2));
            }
          }

          return {
            id: reading.sensorId,
            name: meta.name,
            unit: meta.unit || reading.unit,
            currentValue: Number(reading.value.toFixed(meta.unit === 'A' || meta.unit === 'V' ? 1 : 2)),
            normalMin: meta.normalMin,
            normalMax: meta.normalMax,
            deviationPct: Number(deviation.toFixed(1)),
            anomalyScore: Number(sensorAnomalyScore.toFixed(2)),
            status: reading.status.toLowerCase() as 'normal' | 'warning' | 'critical',
            history: finalHistory,
            equipmentId: reading.equipmentId,
            sensorType: reading.sensorType,
            timestamp: reading.timestamp
          };
        });

        setSensors(updatedSensors);
      }

      // 4. Update asset risk, health, and status from backend prediction
      if (predictionRes) {
        setAssets(prevAssets =>
          prevAssets.map(asset => {
            if (asset.id === targetEquipmentId) {
              const risk = predictionRes.riskScore;
              const health = Math.max(5, Math.min(100, Math.round(100 - risk)));
              const status = 
                predictionRes.riskLevel === 'CRITICAL' 
                  ? 'CRITICAL' 
                  : predictionRes.riskLevel === 'HIGH' 
                  ? 'PREDICTED_FAILURE' 
                  : predictionRes.riskLevel === 'MEDIUM' 
                  ? 'WARNING' 
                  : 'NORMAL';

              const timeToFail = 
                predictionRes.riskLevel === 'CRITICAL'
                  ? '< 2h (Immediate Action)'
                  : predictionRes.riskLevel === 'HIGH'
                  ? '04h 32m'
                  : predictionRes.riskLevel === 'MEDIUM'
                  ? '18h 40m'
                  : 'Nominal';

              return {
                ...asset,
                status,
                risk: Number(risk.toFixed(1)),
                health,
                confidence: Math.round(predictionRes.confidence * 100),
                timeToFailure: timeToFail,
              };
            }
            return asset;
          })
        );
      }

      // 5. Update recommendation from backend
      if (recommendationRes && predictionRes) {
        setRecommendation(prev => ({
          ...prev,
          id: `REC-${targetEquipmentId}`,
          assetId: targetEquipmentId,
          title: `Advisory [${recommendationRes.urgency}]: ${recommendationRes.recommendations[0] || 'Nominal Condition'}`,
          action: recommendationRes.recommendations[0] || 'Continue telemetry monitoring',
          actionDetails: recommendationRes.operatorNotes || recommendationRes.recommendations.slice(1).join('; ') || 'All critical parameters operating within nominal bounds.',
          riskBefore: predictionRes.riskScore,
          riskAfter: Math.round(predictionRes.riskScore * 0.35),
          confidence: Math.round(predictionRes.confidence * 100),
          status: isInterventionApproved ? 'APPROVED' : 'PENDING'
        }));
      }

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'PEKKA AI Backend Offline';
      setIsBackendOnline(false);
      setBackendError(errMsg);
    }
  }, [selectedAssetId, isInterventionApproved]);

  // Polling loop: every 1.5 seconds
  useEffect(() => {
    refreshTelemetry();
    const interval = setInterval(refreshTelemetry, 1500);
    return () => clearInterval(interval);
  }, [refreshTelemetry]);

  // Approve recommendation: The Core Human-in-the-Loop Moment
  const approveRecommendation = useCallback(() => {
    soundFX.playApprovalSuccess();
    setIsInterventionApproved(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#10B981', '#ffffff']
      });
    } catch {
      // Ignore if canvas unavailable
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    setRecommendation(prev => ({
      ...prev,
      status: 'APPROVED',
      approvedBy: 'Chief Reliability Engineer (Operator #402)',
      approvedAt: `${timeStr} UTC`
    }));

    const newAuditEntries: AuditLogEntry[] = [
      {
        id: `AUD-APP-${Date.now()}`,
        timestamp: timeStr,
        type: 'HUMAN_APPROVAL',
        actor: 'OPERATOR',
        assetId: selectedAssetId,
        message: 'Operator verified simulation and digitally approved advisory intervention',
        details: 'Advisory recommendation confirmed. Operator dispatched load shedding protocol.',
        hash: `0x${Math.random().toString(16).slice(2, 10)}`
      },
      {
        id: `AUD-ACT-${Date.now() + 1}`,
        timestamp: timeStr,
        type: 'SYSTEM_ACTION',
        actor: 'SUPERVISORY_SYSTEM',
        assetId: selectedAssetId,
        message: 'Dispatch initiated: Load reduction executed across substation tie-lines',
        details: 'Busbar current safely regulated. Thermal gradient stabilizing.',
        hash: `0x${Math.random().toString(16).slice(2, 10)}`
      }
    ];

    setAuditLogs(prev => [...newAuditEntries, ...prev]);
  }, [selectedAssetId]);

  const rejectRecommendation = useCallback(() => {
    soundFX.playClick();
    setRecommendation(prev => ({
      ...prev,
      status: 'REJECTED'
    }));

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const rejectAudit: AuditLogEntry = {
      id: `AUD-REJ-${Date.now()}`,
      timestamp: timeStr,
      type: 'HUMAN_APPROVAL',
      actor: 'OPERATOR',
      assetId: selectedAssetId,
      message: 'Operator rejected advisory recommendation',
      details: 'Manual override recorded. Autonomy halted. Alert escalated to regional dispatch manual desk.',
      hash: `0x${Math.random().toString(16).slice(2, 10)}`
    };
    setAuditLogs(prev => [rejectAudit, ...prev]);
  }, [selectedAssetId]);

  const resetInfrastructure = useCallback(() => {
    soundFX.playClick();
    setIsInterventionApproved(false);
    setAssets(INITIAL_ASSETS);
    setSensors(INITIAL_SENSORS_S17);
    setIncidents(INITIAL_INCIDENTS);
    setRecommendation(INITIAL_RECOMMENDATION);
    setCountdownSeconds(4 * 3600 + 32 * 60 + 18);
    setWhatIfParams({
      extraLoadPct: 0,
      ambientHeatWave: false,
      pumpShutdown: false,
      telecomPacketLoss: false,
      degradationMultiplier: 1.0,
    });
    refreshTelemetry();
  }, [refreshTelemetry]);

  const updateWhatIfParams = useCallback((params: Partial<WhatIfScenarioState>) => {
    setWhatIfParams(prev => ({ ...prev, ...params }));
  }, []);

  // 60-Second Live Demo Engine
  const startLiveDemo = useCallback(() => {
    soundFX.playScanBlip();
    resetInfrastructure();
    setDemoActive(true);
    setDemoCurrentStep(1);
    setDemoIsPaused(false);
    setActiveTab('command-center');
    setViewMode('app');
  }, [resetInfrastructure]);

  const stopLiveDemo = useCallback(() => {
    soundFX.playClick();
    setDemoActive(false);
  }, []);

  const setDemoStep = useCallback((step: number) => {
    soundFX.playClick();
    const clamped = Math.max(1, Math.min(11, step));
    setDemoCurrentStep(clamped);
    const phase = LIVE_DEMO_PHASES[clamped - 1];
    if (phase) {
      setActiveTabState(phase.targetView);
      setSelectedAssetIdState(phase.highlightAssetId);
    }
  }, []);

  const nextDemoStep = useCallback(() => {
    if (demoCurrentStep < 11) {
      setDemoStep(demoCurrentStep + 1);
    } else {
      setDemoActive(false);
    }
  }, [demoCurrentStep, setDemoStep]);

  const prevDemoStep = useCallback(() => {
    if (demoCurrentStep > 1) {
      setDemoStep(demoCurrentStep - 1);
    }
  }, [demoCurrentStep, setDemoStep]);

  const toggleDemoPause = useCallback(() => {
    soundFX.playClick();
    setDemoIsPaused(prev => !prev);
  }, []);

  useEffect(() => {
    if (!demoActive || demoIsPaused) return;

    const currentPhase = LIVE_DEMO_PHASES[demoCurrentStep - 1];
    const duration = (currentPhase?.timeEstimateSeconds || 5) * 1000;

    const timer = setTimeout(() => {
      if (demoCurrentStep === 10) {
        approveRecommendation();
      }
      if (demoCurrentStep < 11) {
        setDemoStep(demoCurrentStep + 1);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [demoActive, demoIsPaused, demoCurrentStep, setDemoStep, approveRecommendation]);

  return (
    <PekkaContext.Provider
      value={{
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        selectedAssetId,
        setSelectedAssetId,
        selectedAsset,
        assets,
        sensors,
        incidents,
        recommendation,
        auditLogs,
        isBackendOnline,
        backendError,
        lastTelemetryUpdate,
        activeSensorsCount,
        monitoredEquipmentCount,
        backendAnomalyReport,
        backendPrediction,
        backendRecommendation,
        backendReadings,
        detectedScenario,
        refreshTelemetry,
        countdownSeconds,
        countdownFormatted,
        isInterventionApproved,
        approveRecommendation,
        rejectRecommendation,
        resetInfrastructure,
        soundEnabled,
        setSoundEnabled,
        whatIfParams,
        updateWhatIfParams,
        demoActive,
        demoCurrentStep,
        demoIsPaused,
        startLiveDemo,
        stopLiveDemo,
        nextDemoStep,
        prevDemoStep,
        setDemoStep,
        toggleDemoPause,
      }}
    >
      {children}
    </PekkaContext.Provider>
  );
};

export const usePekka = () => {
  const context = useContext(PekkaContext);
  if (!context) {
    throw new Error('usePekka must be used within a PekkaProvider');
  }
  return context;
};
