import { 
  InfrastructureAsset, 
  SensorMetric, 
  AnomalyFactor, 
  Incident, 
  Recommendation, 
  RootCauseNode, 
  RootCauseEdge, 
  AuditLogEntry, 
  LiveDemoPhase 
} from '../types';

export const INITIAL_ASSETS: InfrastructureAsset[] = [
  {
    id: 'TRANSFORMER-01',
    name: 'TRANSFORMER-01 (Unit #1)',
    sector: 'power',
    type: 'Substation Step-Down 400kV/110kV Power Transformer',
    status: 'NORMAL',
    health: 95,
    risk: 12,
    timeToFailure: 'Nominal',
    confidence: 94,
    lastMaintenance: '2026-08-15',
    location: 'Central Substation Bay 1',
    coordinates: { x: 42, y: 38 },
    connections: ['TRANSFORMER-02', 'S-04', 'S-17'],
    specs: {
      'Rated Power': '250 MVA',
      'Primary Voltage': '400 kV',
      'Secondary Voltage': '110 kV',
      'Cooling Class': 'ONAN/ONAF',
      'Sensors Connected': '9 Telemetry Probes'
    }
  },
  {
    id: 'TRANSFORMER-02',
    name: 'TRANSFORMER-02 (Unit #2)',
    sector: 'power',
    type: 'Substation Step-Down 400kV/110kV Power Transformer',
    status: 'NORMAL',
    health: 98,
    risk: 8,
    timeToFailure: 'Nominal',
    confidence: 96,
    lastMaintenance: '2026-09-02',
    location: 'Central Substation Bay 2',
    coordinates: { x: 55, y: 44 },
    connections: ['TRANSFORMER-01', 'S-04', 'S-12'],
    specs: {
      'Rated Power': '250 MVA',
      'Primary Voltage': '400 kV',
      'Secondary Voltage': '110 kV',
      'Cooling Class': 'ONAN/ONAF',
      'Sensors Connected': '9 Telemetry Probes'
    }
  },
  {
    id: 'S-17',
    name: 'SUBSTATION S-17',
    sector: 'power',
    type: 'Step-Down 400kV/110kV Autotransformer Unit #2',
    status: 'PREDICTED_FAILURE',
    health: 44,
    risk: 87,
    timeToFailure: '04h 32m',
    confidence: 92,
    lastMaintenance: '2026-06-14',
    location: 'Metro Central Sector Grid Node 4',
    coordinates: { x: 48, y: 40 },
    connections: ['S-04', 'S-12', 'P-04', 'T-09'],
    specs: {
      'Rated Power': '250 MVA',
      'Cooling Class': 'ONAN/ONAF/OFAF',
      'Operating Hours': '46,120 hrs',
      'Core Temperature Limit': '85°C',
      'Oil Dielectric Breakdown': '42 kV/mm'
    }
  },
  {
    id: 'S-04',
    name: 'SUBSTATION S-04',
    sector: 'power',
    type: 'North Regional Transmission Substation',
    status: 'NORMAL',
    health: 96,
    risk: 4,
    confidence: 98,
    lastMaintenance: '2026-08-02',
    location: 'North Ridge Energy Hub',
    coordinates: { x: 26, y: 24 },
    connections: ['S-17', 'C-22', 'W-01'],
    specs: {
      'Rated Power': '500 MVA',
      'Voltage Level': '400 kV',
      'Busbar Config': 'Double Bus Single Breaker'
    }
  },
  {
    id: 'S-12',
    name: 'SUBSTATION S-12',
    sector: 'power',
    type: 'East Industrial Park Feeder Substation',
    status: 'WARNING',
    health: 81,
    risk: 24,
    timeToFailure: '36h 15m',
    confidence: 84,
    lastMaintenance: '2026-05-19',
    location: 'East Industrial Corridor',
    coordinates: { x: 74, y: 32 },
    connections: ['S-17', 'C-08', 'T-09'],
    specs: {
      'Rated Power': '180 MVA',
      'Voltage Level': '110 kV',
      'Feeder Circuits': '12 Lines'
    }
  },
  {
    id: 'W-01',
    name: 'WATER PLANT W-01',
    sector: 'water',
    type: 'Metropolitan Primary Filtration & Chlorination',
    status: 'NORMAL',
    health: 94,
    risk: 6,
    confidence: 96,
    lastMaintenance: '2026-07-28',
    location: 'River Basin Facility Delta',
    coordinates: { x: 20, y: 64 },
    connections: ['S-04', 'W-02', 'P-04'],
    specs: {
      'Capacity': '450,000 m³/day',
      'Turbidity Level': '0.12 NTU',
      'Disinfection Status': 'Nominal'
    }
  },
  {
    id: 'W-02',
    name: 'RESERVOIR W-02',
    sector: 'water',
    type: 'Highland Storage Reservoir & Gravity Feeder',
    status: 'NORMAL',
    health: 98,
    risk: 2,
    confidence: 99,
    lastMaintenance: '2026-09-01',
    location: 'Highland Ridge Catchment',
    coordinates: { x: 34, y: 84 },
    connections: ['W-01', 'P-04'],
    specs: {
      'Active Storage': '12.4M m³',
      'Head Pressure': '6.4 bar',
      'Spillway Gate': 'Auto-Supervised'
    }
  },
  {
    id: 'P-04',
    name: 'PUMP STATION P-04',
    sector: 'water',
    type: 'Main Intake Centrifugal Pump Station Unit 3',
    status: 'ANOMALY',
    health: 72,
    risk: 68,
    timeToFailure: '18h 40m',
    confidence: 89,
    lastMaintenance: '2026-04-10',
    location: 'Central Waterway Intake Pier',
    coordinates: { x: 54, y: 74 },
    connections: ['S-17', 'W-01', 'W-02', 'T-09'],
    specs: {
      'Flow Rate': '22,000 m³/h',
      'Motor Rating': '3.2 MW',
      'Bearing Vibration': '3.9 mm/s (High)'
    }
  },
  {
    id: 'T-09',
    name: 'TRANSPORT HUB T-09',
    sector: 'transport',
    type: 'Regional Central Rail Interlocking & Signalling',
    status: 'NORMAL',
    health: 91,
    risk: 11,
    confidence: 94,
    lastMaintenance: '2026-07-15',
    location: 'Central Intermodal Terminal',
    coordinates: { x: 74, y: 66 },
    connections: ['S-17', 'S-12', 'P-04', 'T-02'],
    specs: {
      'Track Circuits': '148 Active Blocks',
      'Switch Motors': '32 Monitored',
      'Signalling Protocol': 'ETCS Level 2'
    }
  },
  {
    id: 'T-02',
    name: 'LOGISTICS PORT T-02',
    sector: 'transport',
    type: 'Deepwater Container Terminal Crane Grid',
    status: 'MONITORING',
    health: 88,
    risk: 14,
    confidence: 91,
    lastMaintenance: '2026-06-30',
    location: 'South Harbor Pier 6',
    coordinates: { x: 86, y: 82 },
    connections: ['T-09'],
    specs: {
      'STS Cranes': '8 Heavy Gantry Units',
      'Peak Power Draw': '18.5 MW',
      'Automated AGVs': '42 Units'
    }
  },
  {
    id: 'C-22',
    name: 'TELECOM RELAY C-22',
    sector: 'communication',
    type: 'Microwave Backhaul & SCADA Gateway Tower',
    status: 'WARNING',
    health: 79,
    risk: 41,
    timeToFailure: '14h 10m',
    confidence: 86,
    lastMaintenance: '2026-03-22',
    location: 'Lookout Point Apex Tower',
    coordinates: { x: 38, y: 16 },
    connections: ['S-04', 'C-08'],
    specs: {
      'Bands': '18 GHz & 23 GHz MIMO',
      'SCADA Packet Loss': '1.8% (Target <0.05%)',
      'Backup Generator': 'Ready'
    }
  },
  {
    id: 'C-08',
    name: 'OPTICAL HUB C-08',
    sector: 'communication',
    type: 'Dense WDM Core Optical Routing Hub',
    status: 'NORMAL',
    health: 97,
    risk: 3,
    confidence: 99,
    lastMaintenance: '2026-08-18',
    location: 'East District Carrier Facility',
    coordinates: { x: 62, y: 15 },
    connections: ['C-22', 'S-12', 'S-17'],
    specs: {
      'Throughput': '3.2 Tbps',
      'Optical SNR': '28.4 dB',
      'Redundant Path': 'Active-Active'
    }
  }
];

export const INITIAL_ANOMALY_FACTORS: AnomalyFactor[] = [
  { factor: 'Temperature', percentage: 18, direction: 'up', description: 'Transformer core thermal rise above baseline' },
  { factor: 'Vibration', percentage: 31, direction: 'up', description: 'Harmonic acoustic signatures in core laminations' },
  { factor: 'Load imbalance', percentage: 12, direction: 'up', description: 'Phase B/C cross-load asymmetry' },
  { factor: 'Historical pattern similarity', percentage: 89, direction: 'neutral', description: 'Matches 2024 Northeast Grid Transformer Degradation Incident' }
];

export const INITIAL_SENSORS_S17: SensorMetric[] = [
  {
    id: 'temp',
    name: 'CORE TEMPERATURE',
    unit: '°C',
    currentValue: 72.4,
    normalMin: 40.0,
    normalMax: 65.0,
    deviationPct: 18.2,
    anomalyScore: 0.91,
    status: 'critical',
    history: [
      { timestamp: '-30m', value: 64.2 },
      { timestamp: '-25m', value: 65.8 },
      { timestamp: '-20m', value: 67.4 },
      { timestamp: '-15m', value: 69.1 },
      { timestamp: '-10m', value: 70.8 },
      { timestamp: '-5m', value: 71.9 },
      { timestamp: 'NOW', value: 72.4 }
    ]
  },
  {
    id: 'vibration',
    name: 'VIBRATION AMPLITUDE',
    unit: 'mm/s',
    currentValue: 4.82,
    normalMin: 0.8,
    normalMax: 2.2,
    deviationPct: 31.0,
    anomalyScore: 0.88,
    status: 'critical',
    history: [
      { timestamp: '-30m', value: 2.1 },
      { timestamp: '-25m', value: 2.6 },
      { timestamp: '-20m', value: 3.2 },
      { timestamp: '-15m', value: 3.8 },
      { timestamp: '-10m', value: 4.3 },
      { timestamp: '-5m', value: 4.7 },
      { timestamp: 'NOW', value: 4.82 }
    ]
  },
  {
    id: 'load',
    name: 'APPARENT LOAD',
    unit: '%',
    currentValue: 94.2,
    normalMin: 50.0,
    normalMax: 80.0,
    deviationPct: 12.0,
    anomalyScore: 0.82,
    status: 'warning',
    history: [
      { timestamp: '-30m', value: 81.0 },
      { timestamp: '-25m', value: 84.5 },
      { timestamp: '-20m', value: 88.0 },
      { timestamp: '-15m', value: 91.2 },
      { timestamp: '-10m', value: 93.0 },
      { timestamp: '-5m', value: 94.0 },
      { timestamp: 'NOW', value: 94.2 }
    ]
  },
  {
    id: 'voltage',
    name: 'BUSBAR VOLTAGE',
    unit: 'kV',
    currentValue: 398.2,
    normalMin: 395.0,
    normalMax: 405.0,
    deviationPct: -0.5,
    anomalyScore: 0.28,
    status: 'normal',
    history: [
      { timestamp: '-30m', value: 401.2 },
      { timestamp: '-25m', value: 400.4 },
      { timestamp: '-20m', value: 399.8 },
      { timestamp: '-15m', value: 399.0 },
      { timestamp: '-10m', value: 398.5 },
      { timestamp: '-5m', value: 398.2 },
      { timestamp: 'NOW', value: 398.2 }
    ]
  },
  {
    id: 'current',
    name: 'PHASE CURRENT',
    unit: 'A',
    currentValue: 1840,
    normalMin: 1200,
    normalMax: 1650,
    deviationPct: 11.5,
    anomalyScore: 0.74,
    status: 'warning',
    history: [
      { timestamp: '-30m', value: 1540 },
      { timestamp: '-25m', value: 1610 },
      { timestamp: '-20m', value: 1680 },
      { timestamp: '-15m', value: 1740 },
      { timestamp: '-10m', value: 1795 },
      { timestamp: '-5m', value: 1825 },
      { timestamp: 'NOW', value: 1840 }
    ]
  },
  {
    id: 'frequency',
    name: 'GRID FREQUENCY',
    unit: 'Hz',
    currentValue: 49.92,
    normalMin: 49.80,
    normalMax: 50.20,
    deviationPct: -0.16,
    anomalyScore: 0.15,
    status: 'normal',
    history: [
      { timestamp: '-30m', value: 50.01 },
      { timestamp: '-25m', value: 49.98 },
      { timestamp: '-20m', value: 49.96 },
      { timestamp: '-15m', value: 49.94 },
      { timestamp: '-10m', value: 49.93 },
      { timestamp: '-5m', value: 49.92 },
      { timestamp: 'NOW', value: 49.92 }
    ]
  },
  {
    id: 'pressure',
    name: 'COOLING OIL PRESSURE',
    unit: 'bar',
    currentValue: 4.22,
    normalMin: 3.80,
    normalMax: 4.50,
    deviationPct: 0.0,
    anomalyScore: 0.21,
    status: 'normal',
    history: [
      { timestamp: '-30m', value: 4.15 },
      { timestamp: '-25m', value: 4.18 },
      { timestamp: '-20m', value: 4.20 },
      { timestamp: '-15m', value: 4.21 },
      { timestamp: '-10m', value: 4.22 },
      { timestamp: '-5m', value: 4.22 },
      { timestamp: 'NOW', value: 4.22 }
    ]
  },
  {
    id: 'flow',
    name: 'RADIATOR FLOW RATE',
    unit: 'm³/h',
    currentValue: 1420,
    normalMin: 1200,
    normalMax: 1600,
    deviationPct: -5.3,
    anomalyScore: 0.19,
    status: 'normal',
    history: [
      { timestamp: '-30m', value: 1480 },
      { timestamp: '-25m', value: 1460 },
      { timestamp: '-20m', value: 1450 },
      { timestamp: '-15m', value: 1440 },
      { timestamp: '-10m', value: 1430 },
      { timestamp: '-5m', value: 1425 },
      { timestamp: 'NOW', value: 1420 }
    ]
  },
  {
    id: 'humidity',
    name: 'OIL DISSOLVED MOISTURE',
    unit: 'ppm',
    currentValue: 18.4,
    normalMin: 10.0,
    normalMax: 25.0,
    deviationPct: 2.0,
    anomalyScore: 0.14,
    status: 'normal',
    history: [
      { timestamp: '-30m', value: 17.8 },
      { timestamp: '-25m', value: 18.0 },
      { timestamp: '-20m', value: 18.1 },
      { timestamp: '-15m', value: 18.2 },
      { timestamp: '-10m', value: 18.3 },
      { timestamp: '-5m', value: 18.4 },
      { timestamp: 'NOW', value: 18.4 }
    ]
  }
];

export const INITIAL_RECOMMENDATION: Recommendation = {
  id: 'REC-2026-S17-01',
  assetId: 'S-17',
  title: 'Preventive Transformer Load Shedding & Cross-Routing',
  action: 'Reduce transformer load by 12%',
  actionDetails: 'Automate transfer of 30 MVA load to Northern Tie-Line S-04 while throttling secondary winding current at S-17 to prevent thermal runaway in oil insulation.',
  riskBefore: 87,
  riskAfter: 29,
  downtimeAvoidedHours: 3.8,
  usersProtected: 12400,
  confidence: 91,
  status: 'PENDING'
};

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-8801',
    assetId: 'S-17',
    assetName: 'SUBSTATION S-17',
    sector: 'power',
    severity: 'CRITICAL',
    failureType: 'Transformer degradation & thermal runaway',
    risk: 87,
    confidence: 92,
    timeRemaining: '04h 32m',
    detectedAt: '06:41:12 UTC',
    description: 'Abnormal thermal expansion coupled with 31% harmonic vibration rise indicates acute winding breakdown risk.',
    resolved: false
  },
  {
    id: 'INC-8802',
    assetId: 'P-04',
    assetName: 'PUMP STATION P-04',
    sector: 'water',
    severity: 'HIGH',
    failureType: 'Centrifugal pump impeller bearing cavitation',
    risk: 68,
    confidence: 89,
    timeRemaining: '18h 40m',
    detectedAt: '05:18:40 UTC',
    description: 'Secondary bearing vibration acoustic peaks correlated with fluctuating suction head pressure.',
    resolved: false
  },
  {
    id: 'INC-8803',
    assetId: 'C-22',
    assetName: 'TELECOM RELAY C-22',
    sector: 'communication',
    severity: 'MEDIUM',
    failureType: 'Packet-loss anomaly in telemetry backhaul',
    risk: 41,
    confidence: 86,
    timeRemaining: '14h 10m',
    detectedAt: '04:55:03 UTC',
    description: 'Burst packet drop rate exceeding 1.8% over 18GHz microwave link under atmospheric inversion.',
    resolved: false
  },
  {
    id: 'INC-8799',
    assetId: 'S-04',
    assetName: 'SUBSTATION S-04',
    sector: 'power',
    severity: 'RESOLVED',
    failureType: 'Capacitor bank balance drift',
    risk: 4,
    confidence: 98,
    timeRemaining: 'Mitigated',
    detectedAt: 'Yesterday 21:04 UTC',
    description: 'Automated reactive shunt adjustment restored phase balance within nominal limits.',
    resolved: true
  }
];

export const ROOT_CAUSE_NODES: RootCauseNode[] = [
  { id: 'n1', label: 'Temperature Anomaly (+18%)', category: 'symptom', confidence: 98 },
  { id: 'n2', label: 'Thermal Stress on Insulation', category: 'mechanism', confidence: 95 },
  { id: 'n3', label: 'Transformer Degradation', category: 'defect', confidence: 92, isProbableRootCause: true },
  { id: 'n4', label: 'Substation Instability', category: 'subsystem', confidence: 88 },
  { id: 'n5', label: 'Grid Imbalance (Phase B/C)', category: 'system', confidence: 84 },
  { id: 'n6', label: 'Potential Regional Disruption', category: 'consequence', confidence: 81 }
];

export const ROOT_CAUSE_EDGES: RootCauseEdge[] = [
  { from: 'n1', to: 'n2', confidence: 96 },
  { from: 'n2', to: 'n3', confidence: 93 },
  { from: 'n3', to: 'n4', confidence: 90 },
  { from: 'n4', to: 'n5', confidence: 86 },
  { from: 'n5', to: 'n6', confidence: 82 }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    timestamp: '06:41:12',
    type: 'DETECTION',
    actor: 'PEKKA AI',
    assetId: 'S-17',
    message: 'Temperature anomaly detected (+18% above nominal operating curve)',
    details: 'Sensor TS-402 reported 72.4°C core winding temp vs expected 61.2°C at current load profile.',
    hash: '0x8f4d92a1'
  },
  {
    id: 'AUD-002',
    timestamp: '06:41:16',
    type: 'DETECTION',
    actor: 'PEKKA AI',
    assetId: 'S-17',
    message: 'Vibration anomaly correlated (+31% harmonic rise at 100Hz/300Hz)',
    details: 'Acoustic vibrometer VS-108 confirmed non-linear harmonic resonance in tank frame.',
    hash: '0x7e3b190f'
  },
  {
    id: 'AUD-003',
    timestamp: '06:41:21',
    type: 'PREDICTION',
    actor: 'PEKKA AI',
    assetId: 'S-17',
    message: 'Historical pattern matched (89% similarity to 2024 Northeast Grid Event #409)',
    details: 'PEKKA-NeuralTwin v4.2 classified time-series signature as accelerated solid paper degradation.',
    hash: '0x5c8a32bb'
  },
  {
    id: 'AUD-004',
    timestamp: '06:41:25',
    type: 'PREDICTION',
    actor: 'PEKKA AI',
    assetId: 'S-17',
    message: 'Failure probability calculated: 87% within 04h 32m',
    details: 'Monte Carlo simulation across 10,000 thermal-electric runs converged on 87.4% dielectric punch risk.',
    hash: '0x3a91ff6d'
  },
  {
    id: 'AUD-005',
    timestamp: '06:41:29',
    type: 'RECOMMENDATION',
    actor: 'PEKKA AI',
    assetId: 'S-17',
    message: 'Preventive recommendation generated: Reduce load by 12%',
    details: 'Targeted rerouting of 30 MVA via Northern Tie-Line S-04 drops projected failure risk to 29%.',
    hash: '0x12b047ee'
  },
  {
    id: 'AUD-006',
    timestamp: '06:42:01',
    type: 'APPROVAL_REQUEST',
    actor: 'PEKKA AI',
    assetId: 'S-17',
    message: 'Human approval requested — advisory autonomy gatekeeper engaged',
    details: 'Action payload staged. Awaiting certified operator digital signature.',
    hash: '0x99fe0412'
  }
];

export const LIVE_DEMO_PHASES: LiveDemoPhase[] = [
  {
    step: 1,
    title: 'Phase 1: Baseline Normal',
    phaseName: 'PHASE 1',
    badge: 'HEALTHY',
    description: 'Infrastructure operating normally across power, water, transport, and telecom networks. All baseline telemetry within standard tolerances.',
    targetView: 'command-center',
    highlightAssetId: 'S-17',
    timeEstimateSeconds: 5
  },
  {
    step: 2,
    title: 'Phase 2: Telemetry Anomaly',
    phaseName: 'PHASE 2',
    badge: 'ANOMALY DETECTED',
    description: 'Substation S-17 begins showing abnormal telemetry: Core temperature climbs +18% to 72.4°C and harmonic vibration increases.',
    targetView: 'command-center',
    highlightAssetId: 'S-17',
    timeEstimateSeconds: 5
  },
  {
    step: 3,
    title: 'Phase 3: Correlated Detection',
    phaseName: 'PHASE 3',
    badge: 'CORRELATING SIGNALS',
    description: 'PEKKA AI correlates multi-sensor signals across temperature, vibration, and phase imbalance. Isolated sensor noise is ruled out.',
    targetView: 'evidence',
    highlightAssetId: 'S-17',
    timeEstimateSeconds: 5
  },
  {
    step: 4,
    title: 'Phase 4: Risk Prediction',
    phaseName: 'PHASE 4',
    badge: '87% FAILURE RISK',
    description: 'PEKKA predicts critical degradation within 04h 32m with 92% model confidence. Countdown timer activates.',
    targetView: 'command-center',
    highlightAssetId: 'S-17',
    timeEstimateSeconds: 6
  },
  {
    step: 5,
    title: 'Phase 5: Root Cause Analysis',
    phaseName: 'PHASE 5',
    badge: 'ROOT CAUSE FOUND',
    description: 'PEKKA constructs causal DAG: Thermal stress → Transformer degradation → Substation instability → Grid imbalance.',
    targetView: 'command-center',
    highlightAssetId: 'S-17',
    timeEstimateSeconds: 6
  },
  {
    step: 6,
    title: 'Phase 6: Potential Impact',
    phaseName: 'PHASE 6',
    badge: 'IMPACT EVALUATION',
    description: 'Potential impact evaluated: 8 cascading assets threatened, 4.6 hours expected downtime, 12,400 residents/facilities exposed.',
    targetView: 'simulation',
    highlightAssetId: 'S-17',
    timeEstimateSeconds: 6
  },
  {
    step: 7,
    title: 'Phase 7: AI Recommendation',
    phaseName: 'PHASE 7',
    badge: 'RECOMMENDATION',
    description: 'PEKKA recommends optimal non-destructive intervention: Reduce transformer load by 12% to drop risk from 87% to 29%.',
    targetView: 'command-center',
    highlightAssetId: 'S-17',
    timeEstimateSeconds: 6
  },
  {
    step: 8,
    title: 'Phase 8: Digital Twin Stress Test',
    phaseName: 'PHASE 8',
    badge: 'DIGITAL TWIN',
    description: 'Operator tests the recommendation in the Digital Twin environment before modifying real physical infrastructure.',
    targetView: 'digital-twin',
    highlightAssetId: 'S-17',
    timeEstimateSeconds: 6
  },
  {
    step: 9,
    title: 'Phase 9: Side-by-Side Simulation',
    phaseName: 'PHASE 9',
    badge: 'WHAT-IF COMPARISON',
    description: 'Compare Without PEKKA (87% failure, 12,400 affected) vs With PEKKA (29% risk, zero blackout, 12,400 protected).',
    targetView: 'simulation',
    highlightAssetId: 'S-17',
    timeEstimateSeconds: 6
  },
  {
    step: 10,
    title: 'Phase 10: Human Approval',
    phaseName: 'PHASE 10',
    badge: 'HUMAN-IN-THE-LOOP',
    description: 'Human operator reviews evidence, verifies simulation, and executes approval. Autonomy remains strictly advisory.',
    targetView: 'command-center',
    highlightAssetId: 'S-17',
    timeEstimateSeconds: 5
  },
  {
    step: 11,
    title: 'Phase 11: Threat Mitigated & Stabilized',
    phaseName: 'PHASE 11',
    badge: 'THREAT MITIGATED',
    description: 'Load shedding executed. Risk plunges from 87% to 29%. Temperature normalizes. Critical infrastructure protected before failure occurred!',
    targetView: 'command-center',
    highlightAssetId: 'S-17',
    timeEstimateSeconds: 6
  }
];
