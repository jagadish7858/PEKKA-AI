export type AssetSector = 'power' | 'water' | 'transport' | 'communication';

export type AssetStatus = 
  | 'NORMAL' 
  | 'MONITORING' 
  | 'WARNING' 
  | 'ANOMALY' 
  | 'CRITICAL' 
  | 'PREDICTED_FAILURE';

export interface TelemetryReading {
  timestamp: string;
  value: number;
}

export interface SensorMetric {
  id: string;
  name: string;
  unit: string;
  currentValue: number;
  normalMin: number;
  normalMax: number;
  deviationPct: number;
  anomalyScore: number;
  status: 'normal' | 'warning' | 'critical';
  history: TelemetryReading[];
  equipmentId?: string;
  sensorType?: string;
  timestamp?: string;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  sector: AssetSector;
  type: string;
  status: AssetStatus;
  health: number; // 0-100
  risk: number; // 0-100%
  timeToFailure?: string;
  confidence?: number;
  lastMaintenance: string;
  location: string;
  coordinates: { x: number; y: number }; // percentage 0-100
  connections: string[]; // Connected asset IDs
  specs: Record<string, string>;
}

export interface AnomalyFactor {
  factor: string;
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
  description: string;
}

export interface Incident {
  id: string;
  assetId: string;
  assetName: string;
  sector: AssetSector;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'RESOLVED';
  failureType: string;
  risk: number;
  confidence: number;
  timeRemaining: string;
  detectedAt: string;
  description: string;
  resolved: boolean;
}

export interface Recommendation {
  id: string;
  assetId: string;
  title: string;
  action: string;
  actionDetails: string;
  riskBefore: number;
  riskAfter: number;
  downtimeAvoidedHours: number;
  usersProtected: number;
  confidence: number;
  status: 'PENDING' | 'SIMULATING' | 'APPROVED' | 'REJECTED' | 'EXECUTING' | 'COMPLETED';
  approvedBy?: string;
  approvedAt?: string;
}

export interface RootCauseNode {
  id: string;
  label: string;
  category: 'symptom' | 'mechanism' | 'defect' | 'subsystem' | 'system' | 'consequence';
  confidence: number;
  isProbableRootCause?: boolean;
}

export interface RootCauseEdge {
  from: string;
  to: string;
  confidence: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  type: 'DETECTION' | 'PREDICTION' | 'RECOMMENDATION' | 'APPROVAL_REQUEST' | 'HUMAN_APPROVAL' | 'SYSTEM_ACTION' | 'STABILIZATION';
  actor: 'PEKKA AI' | 'OPERATOR' | 'SUPERVISORY_SYSTEM';
  assetId: string;
  message: string;
  details: string;
  hash: string;
}

export interface WhatIfScenarioState {
  extraLoadPct: number;
  ambientHeatWave: boolean;
  pumpShutdown: boolean;
  telecomPacketLoss: boolean;
  degradationMultiplier: number;
}

export type ViewTab = 
  | 'command-center' 
  | 'telemetry'
  | 'digital-twin' 
  | 'infrastructure' 
  | 'predictions' 
  | 'incidents' 
  | 'recommendations' 
  | 'evidence' 
  | 'simulation' 
  | 'audit';

export interface LiveDemoPhase {
  step: number;
  title: string;
  phaseName: string;
  badge: string;
  description: string;
  targetView: ViewTab;
  highlightAssetId: string;
  timeEstimateSeconds: number;
}
