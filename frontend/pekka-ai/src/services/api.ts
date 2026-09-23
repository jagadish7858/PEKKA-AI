/**
 * PEKKA AI Frontend API Service Layer
 * Connects directly to the PEKKA FastAPI backend (default http://127.0.0.1:8001).
 * 
 * Strict requirement: All telemetry, anomaly detection, failure prediction,
 * risk scoring, and recommendations are sourced from the backend.
 */

export interface BackendSensorReading {
  sensorId: string;
  equipmentId: string;
  sensorType: 
    | 'TEMPERATURE' 
    | 'VOLTAGE' 
    | 'CURRENT' 
    | 'VIBRATION' 
    | 'LOAD' 
    | 'POWER_FACTOR' 
    | 'FREQUENCY' 
    | 'OIL_TEMPERATURE' 
    | 'OIL_PRESSURE';
  value: number;
  unit: string;
  timestamp: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface BackendAnomalyDetail {
  sensorId: string;
  sensorType: string;
  value: number;
  unit: string;
  thresholdBreached: string;
  detail: string;
}

export interface BackendAnomalyReport {
  equipmentId: string;
  anomalyDetected: boolean;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  affectedSensors: string[];
  details: BackendAnomalyDetail[];
  method: string;
  anomalyScore?: number;
  ml_anomaly_detected?: boolean;
  model?: string;
  explanation?: string;
}

export interface BackendFailurePrediction {
  equipmentId: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  predictedFailureMode: string;
  confidence: number;
  contributingFactors: string[];
  evaluationMethod: string;
  prediction?: string;
  failure_probability?: number;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ml_model?: string;
  confidence_or_probability?: number;
  supporting_features: string[];
  explanation?: string;
}

export interface BackendRecommendationResponse {
  equipmentId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
  urgency: 'MONITOR' | 'SCHEDULE_INSPECTION' | 'PREVENTIVE_ACTION' | 'URGENT_ACTION' | 'IMMEDIATE_ACTION' | string;
  operatorNotes?: string;
}

export interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
}

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8001').replace(/\/+$/, '');

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private async fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`API error ${response.status} from ${path}: ${errorText || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Health check
   */
  async checkHealth(): Promise<BackendHealthResponse> {
    return this.fetchJson<BackendHealthResponse>('/api/v1/health');
  }

  /**
   * Fetch latest readings across all sensors
   */
  async getLatestReadings(): Promise<{ success: boolean; count: number; readings: BackendSensorReading[] }> {
    return this.fetchJson<{ success: boolean; count: number; readings: BackendSensorReading[] }>('/api/v1/readings/latest');
  }

  /**
   * Fetch readings history for specific equipment
   */
  async getEquipmentReadings(equipmentId: string, limit = 100): Promise<{ success: boolean; count: number; readings: BackendSensorReading[] }> {
    return this.fetchJson<{ success: boolean; count: number; readings: BackendSensorReading[] }>(
      `/api/v1/equipment/${encodeURIComponent(equipmentId)}/readings?limit=${limit}`
    );
  }

  /**
   * Fetch readings history for a specific sensor ID
   */
  async getSensorHistory(sensorId: string, limit = 100): Promise<{ success: boolean; count: number; readings: BackendSensorReading[] }> {
    return this.fetchJson<{ success: boolean; count: number; readings: BackendSensorReading[] }>(
      `/api/v1/sensors/${encodeURIComponent(sensorId)}/history?limit=${limit}`
    );
  }

  /**
   * Fetch current anomaly detection report for equipment
   */
  async getAnomalyReport(equipmentId: string): Promise<BackendAnomalyReport> {
    return this.fetchJson<BackendAnomalyReport>(`/api/v1/anomalies/${encodeURIComponent(equipmentId)}`);
  }

  /**
   * Fetch predictive failure assessment for equipment
   */
  async getFailurePrediction(equipmentId: string): Promise<BackendFailurePrediction> {
    return this.fetchJson<BackendFailurePrediction>(`/api/v1/predictions/${encodeURIComponent(equipmentId)}`);
  }

  /**
   * Fetch AI recommendations for equipment
   */
  async getRecommendations(equipmentId: string): Promise<BackendRecommendationResponse> {
    return this.fetchJson<BackendRecommendationResponse>(`/api/v1/recommendations/${encodeURIComponent(equipmentId)}`);
  }
}

export const pekkaApi = new ApiClient(API_BASE_URL);
