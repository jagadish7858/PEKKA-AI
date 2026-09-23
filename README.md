# PEKKA AI

## Autonomous AI for Critical Infrastructure — Power Grid & Transformer Monitoring

PEKKA AI is an autonomous AI-powered monitoring and decision-support system designed for critical electrical infrastructure, with a focus on **power-grid transformers**.

The system continuously receives transformer telemetry, detects abnormal operating behavior, predicts potential failure conditions, calculates disruption risk, and provides preventive recommendations to human operators.

PEKKA AI is designed as a **human-in-the-loop decision-support system**. It does not automatically operate breakers, disconnect transformers, change taps, or control physical infrastructure.

---

## 1. Problem Statement

### Hackathon Track

**Autonomous AI for Critical Infrastructure**

### Focus Area

**Power Grid / Substation Transformer Monitoring**

### Objective

Critical infrastructure can generate large volumes of operational telemetry, while equipment failures may only become obvious after abnormal behavior has already become severe.

PEKKA AI addresses this by:

* Continuously monitoring transformer telemetry
* Detecting abnormal operating behavior
* Identifying early signs of equipment degradation
* Predicting potential failure modes
* Estimating overall disruption risk
* Providing preventive recommendations
* Keeping final operational decisions with human operators

---

# 2. System Architecture

```text
                    JAVA SENSOR SIMULATOR
                         Spring Boot
                              |
                              | HTTP POST
                              | Sensor Telemetry
                              v
                  +------------------------+
                  |     PEKKA AI BACKEND   |
                  |      FastAPI :8001     |
                  +------------------------+
                              |
                    Data Ingestion
                              |
                    Feature Engineering
                              |
               +--------------+--------------+
               |                             |
               v                             v
       Rule-Based Safety              Isolation Forest
       Physical Limits                ML Anomaly Detection
               |                             |
               +--------------+--------------+
                              |
                              v
                    Random Forest
                 Failure Prediction
                              |
                              v
                      Risk Engine
                       0 - 100
                              |
                              v
                 Recommendation Engine
                              |
                              v
                  React Frontend :5173
                              |
                              v
                     HUMAN OPERATOR
                  Final Decision Authority
```

### Data Flow

```text
Java Simulator
      ↓
18 Transformer Sensors
      ↓
FastAPI Backend
      ↓
Feature Engineering
      ↓
Rule Safety + Isolation Forest
      ↓
Random Forest Failure Prediction
      ↓
Hybrid Risk Engine
      ↓
Advisory Recommendation
      ↓
React Monitoring Dashboard
      ↓
Human Operator
```

The frontend communicates with the **FastAPI backend only**. It does not communicate directly with the Java simulator.

---

# 3. Technology Stack

## Backend

* Python
* FastAPI
* Pydantic
* scikit-learn
* NumPy
* pandas
* joblib
* Uvicorn

## Machine Learning

* Isolation Forest
* Random Forest Classifier
* Feature engineering
* Statistical and dynamic telemetry analysis

## Simulator

* Java
* Spring Boot
* Maven
* JDK 21
* Java HTTP Client

## Frontend

* React 19
* TypeScript
* Vite 8
* Tailwind CSS 3.4
* npm

---

# 4. AI/ML Architecture

PEKKA AI intentionally separates **machine-learning intelligence** from **deterministic safety rules**.

```text
                         Sensor Data
                             |
                +------------+------------+
                |                         |
                v                         v
        Rule-Based Safety          Isolation Forest
        Physical Limits            ML Anomaly Detection
                |                         |
                +------------+------------+
                             |
                             v
                    Random Forest
                  Failure Prediction
                             |
                             v
                     Hybrid Risk Engine
                         0 - 100
                             |
                             v
                  Recommendation Engine
                             |
                             v
                      Human Operator
```

## Rule-Based Safety Layer

The rule layer performs deterministic checks against documented transformer operating limits.

Examples include:

* Winding temperature
* Oil temperature
* Vibration
* Current
* Load
* Frequency
* Other monitored operating parameters

The rule layer provides immediate detection of clearly unsafe operating conditions.

**Threshold rules are not AI.**

---

## Machine Learning Layer

### Isolation Forest

Isolation Forest is used for **unsupervised anomaly detection**.

It learns the normal multivariate operating distribution and detects unusual combinations of telemetry values that may not be captured by an individual threshold.

The model produces an anomaly score used by the hybrid risk engine.

### Random Forest Classifier

The Random Forest model performs supervised failure-risk prediction.

It uses engineered telemetry features to estimate:

* Predicted failure mode
* Failure probability
* Prediction confidence
* Supporting features

The model uses `predict_proba()` for failure probability estimation.

---

# 5. Feature Engineering

PEKKA AI uses engineered telemetry signals representing both current operating conditions and dynamic behavior.

The feature set includes:

1. `temperature`
2. `oil_temperature`
3. `oil_pressure`
4. `voltage`
5. `current`
6. `vibration`
7. `load`
8. `power_factor`
9. `frequency`
10. `temp_oil_delta`
11. `apparent_power_ratio`
12. `temp_rate_of_change`
13. `vib_rate_of_change`
14. `rolling_temp_std`
15. `rolling_current_std`

These features allow PEKKA AI to consider not only absolute sensor values but also relationships, variability, and changes over time.

---

# 6. Training Dataset

The training dataset is:

```text
data/synthetic_transformer_telemetry.csv
```

### Dataset Type

**Synthetic / Demo Telemetry**

The dataset was generated for hackathon prototype validation using physics-informed transformer operating regimes.

The modeled regimes include:

* `NORMAL`
* `THERMAL_OVERLOAD`
* `MECHANICAL_FAULT`
* `DIELECTRIC_FAULT`
* `CRITICAL_FAILURE`

### Important Limitation

The dataset is synthetic and is not a substitute for proprietary utility or field failure data.

Therefore, the model evaluation results should **not be presented as real-world field validation or production accuracy**.

---

# 7. Machine Learning Models

Trained model artifacts are stored in:

```text
models/
```

Artifacts:

```text
models/isolation_forest.joblib
models/failure_rf.joblib
models/scaler.joblib
models/metadata.joblib
```

### Isolation Forest

Used for multivariate anomaly detection.

### Random Forest

Used for supervised failure prediction and probability estimation.

### Scaler

Stores the feature standardization configuration used during model inference.

### Metadata

Stores information such as:

* Feature names
* Class labels
* Feature importance information

---

# 8. Model Evaluation

Evaluation was performed using a holdout portion of the synthetic dataset.

### Random Forest

```text
Accuracy:          1.0000
Weighted Precision: 1.0000
Weighted Recall:    1.0000
Weighted F1:        1.0000
ROC-AUC:            1.0000
```

### Isolation Forest

```text
Precision: 1.0000
ROC-AUC:   0.9993
```

These high values reflect the controlled synthetic dataset and should not be interpreted as real-world field performance.

---

# 9. Shared Sensor JSON Contract

The Java simulator sends telemetry to the FastAPI backend using the following structure:

```json
{
  "sensorId": "TEMP-T01",
  "equipmentId": "TRANSFORMER-01",
  "sensorType": "TEMPERATURE",
  "value": 72.4,
  "unit": "°C",
  "timestamp": "2026-09-23T10:30:00Z",
  "status": "NORMAL"
}
```

## Supported Sensor Types

```text
TEMPERATURE
VOLTAGE
CURRENT
VIBRATION
LOAD
POWER_FACTOR
FREQUENCY
OIL_TEMPERATURE
OIL_PRESSURE
```

## Supported Statuses

```text
NORMAL
WARNING
CRITICAL
```

---

# 10. Transformer Monitoring

The simulator currently provides telemetry for:

```text
TRANSFORMER-01
TRANSFORMER-02
```

Each transformer has 9 monitored sensor types:

```text
Temperature
Voltage
Current
Vibration
Load
Power Factor
Frequency
Oil Temperature
Oil Pressure
```

Total:

```text
2 Transformers × 9 Sensors = 18 Live Sensors
```

---

# 11. Backend API

The FastAPI backend runs on:

```text
http://127.0.0.1:8001
```

## Health

```http
GET /api/v1/health
```

Checks whether the AI backend is running.

## Sensor Ingestion

```http
POST /api/v1/readings
```

Receives and validates sensor telemetry.

## Latest Readings

```http
GET /api/v1/readings/latest
```

Returns the latest reading for each sensor.

## Equipment History

```http
GET /api/v1/equipment/{equipmentId}/readings?limit=100
```

Returns chronological telemetry for an equipment unit.

Example:

```text
TRANSFORMER-01
```

## Sensor History

```http
GET /api/v1/sensors/{sensorId}/history?limit=100
```

Returns historical telemetry for a specific sensor.

## Ad-Hoc Anomaly Detection

```http
POST /api/v1/anomalies/detect
```

Supports:

* Wrapped batch requests
* Raw arrays
* Single sensor readings

## Equipment Anomaly Analysis

```http
GET /api/v1/anomalies/{equipmentId}
```

Runs rule-based safety checks and Isolation Forest anomaly detection.

## Failure Prediction

```http
GET /api/v1/predictions/{equipmentId}
```

Returns:

* Predicted failure mode
* Failure probability
* Confidence
* Supporting features
* Explanation
* Risk information

## Risk Analysis

```http
GET /api/v1/risk/{equipmentId}
```

Returns the composite risk score and risk-level breakdown.

## Recommendations

```http
GET /api/v1/recommendations/{equipmentId}
```

Returns prioritized operator recommendations.

---

# 12. Hybrid Risk Engine

PEKKA AI produces a transparent composite risk score from:

```text
0 - 100
```

The risk calculation combines:

### Rule Safety Severity

```text
Maximum: 35 points
```

### ML Anomaly Score

```text
Maximum: 30 points
```

### ML Failure Probability

```text
Maximum: 35 points
```

### Dynamic Telemetry Trends

Dynamic changes in telemetry can contribute additional urgency.

## Risk Bands

|  Score | Risk Level |
| -----: | ---------- |
|   0–29 | LOW        |
|  30–59 | MEDIUM     |
|  60–84 | HIGH       |
| 85–100 | CRITICAL   |

The risk engine combines deterministic safety evidence, ML anomaly evidence, failure probability, and telemetry trends instead of relying on a single model.

---

# 13. Recommendation Engine

The recommendation engine converts the detected condition and risk information into operator-facing advisory guidance.

Supported urgency levels:

```text
MONITOR
PREVENTIVE_ACTION
URGENT_ACTION
IMMEDIATE_ACTION
```

Example recommendations may include:

* Continue monitoring
* Review transformer loading
* Inspect cooling systems
* Investigate abnormal vibration
* Inspect oil/DGA-related conditions
* Reduce transformer feeder load when critical conditions are detected

Recommendations are **advisory only**.

The AI does not directly operate physical grid equipment.

---

# 14. Frontend Dashboard

The React frontend runs on:

```text
http://localhost:5173
```

The frontend communicates with the FastAPI backend using:

```text
VITE_BACKEND_URL=http://127.0.0.1:8001
```

## Dashboard Capabilities

### System Status

Displays:

* PEKKA AI backend connection
* Active telemetry probes
* Last telemetry update
* Current scenario

### Live Telemetry

Displays all 9 sensor types for the selected transformer.

Each sensor card can show:

* Sensor ID
* Equipment ID
* Current value
* Unit
* Status
* Timestamp
* Operating range
* Anomaly score
* Trend/sparkline

### Equipment Switching

Operators can switch between:

```text
TRANSFORMER-01
TRANSFORMER-02
```

### Anomaly Detection

The dashboard displays:

* Anomaly score
* Severity
* Affected sensors
* Explanation

### Failure Prediction

Displays:

* Predicted failure mode
* Failure probability
* Confidence
* Supporting features
* Risk classification

### Risk

Displays:

* Risk score
* Risk level
* Contributing factors

### Recommendations

Displays:

* Urgency
* Recommended actions
* Operator notes
* Human approval controls

---

# 15. Frontend Data Flow

The frontend does **not** generate fake telemetry or fake AI results.

```text
Java Simulator
      ↓
FastAPI Backend
      ↓
AI/ML Processing
      ↓
REST API
      ↓
React Frontend
      ↓
Human Operator
```

The frontend polls the backend approximately every **1.5 seconds** for live monitoring data.

If the backend becomes unavailable, the dashboard displays:

```text
PEKKA AI Backend Offline
```

No fake telemetry is generated while the backend is unavailable.

When the backend recovers, the frontend reconnects automatically.

---

# 16. Normal / Warning / Critical Scenarios

PEKKA AI supports three important operating scenarios.

## NORMAL

Typical operating values are maintained.

Example:

```text
Temperature: ~60°C
Voltage:     ~231V
Load:        ~51%
Vibration:   ~1.8 mm/s
Frequency:   ~50 Hz
```

Expected system behavior:

```text
Anomaly: Low
Risk:    LOW
Action:  MONITOR
```

---

## WARNING

The simulator increases selected operating parameters.

Example:

```text
Temperature: ~72°C
Current:     ~459A
Load:        ~71%
Vibration:   ~3.6 mm/s
```

The AI can identify abnormal behavior and may predict:

```text
THERMAL_OVERLOAD
```

The dashboard changes to the WARNING scenario and presents increased urgency.

---

## CRITICAL

The simulator introduces severe operating conditions.

Example:

```text
Temperature: ~91.7°C
Current:     ~646.7A
Load:        ~96.6%
Vibration:   ~7.7 mm/s
Frequency:   ~48.93 Hz
```

The system can produce:

```text
High anomaly score
CRITICAL risk
CRITICAL_FAILURE prediction
IMMEDIATE_ACTION recommendation
```

The recommendation remains advisory and requires human operator judgment.

---

# 17. Running the System

## Step 1 — Start FastAPI Backend

From the PEKKA AI backend directory:

```powershell
uvicorn app.main:app --reload --port 8001
```

Backend:

```text
http://127.0.0.1:8001
```

Swagger:

```text
http://127.0.0.1:8001/docs
```

ReDoc:

```text
http://127.0.0.1:8001/redoc
```

---

## Step 2 — Start Java Simulator

Start the Spring Boot simulator using its Maven configuration.

The simulator sends telemetry to:

```text
http://127.0.0.1:8001/api/v1/readings
```

The simulator is designed to continue operating even when the backend temporarily becomes unavailable and resume transmission after backend recovery.

---

## Step 3 — Start Frontend

From:

```text
frontend/pekka-ai
```

Run:

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 18. Testing

## Backend

```powershell
pytest tests/ -v
```

Current regression result:

```text
38 passed
```

## Java Simulator

```powershell
.\mvnw.cmd test
```

Current regression result:

```text
12 tests
0 failures
0 errors
BUILD SUCCESS
```

## Frontend

```powershell
npm run build
```

Current result:

```text
Build successful
0 errors
```

Lint:

```powershell
npm run lint
```

Current result:

```text
0 errors
```

---

# 19. End-to-End System Verification

The complete system flow is:

```text
JAVA SIMULATOR
      ↓
18 LIVE SENSORS
      ↓
FASTAPI INGESTION
      ↓
FEATURE ENGINEERING
      ↓
RULE SAFETY
      +
ISOLATION FOREST
      ↓
RANDOM FOREST
      ↓
RISK ENGINE
      ↓
RECOMMENDATION ENGINE
      ↓
REACT DASHBOARD
      ↓
HUMAN OPERATOR
```

The verified scenarios include:

```text
NORMAL
WARNING
CRITICAL
BACKEND OFFLINE
BACKEND RECOVERY
```

The frontend automatically reflects the current backend state.

---

# 20. Human-in-the-Loop Safety

PEKKA AI is a **decision-support system**, not an autonomous physical-control system.

The AI does not:

* Open circuit breakers
* Disconnect transformers
* Change transformer taps
* Operate valves
* Perform automatic load shedding
* Directly control physical grid equipment

Instead, it:

```text
Detects
   ↓
Predicts
   ↓
Calculates Risk
   ↓
Recommends
   ↓
Human Operator Decides
```

The final operational decision remains with qualified human operators.

---

# 21. Dataset and Model Transparency

PEKKA AI is a hackathon prototype.

The current ML models were trained using synthetic physics-informed telemetry because proprietary utility failure/outage datasets are not available in the project.

Therefore:

> Model metrics demonstrate prototype behavior on the synthetic evaluation dataset and must not be interpreted as production or real-world field validation.

Future production deployment would require:

* Real utility telemetry
* Historical failure records
* Real maintenance records
* Domain expert validation
* Field testing
* Model monitoring
* Safety certification and operational approval

---

# 22. Project Structure

```text
PEKKA AI/
│
├── app/
│   ├── api/
│   ├── detection/
│   ├── ingestion/
│   ├── prediction/
│   ├── processing/
│   ├── recommendation/
│   ├── risk/
│   ├── schemas/
│   ├── storage/
│   ├── config.py
│   └── main.py
│
├── training/
│   ├── generate_dataset.py
│   ├── train_anomaly_model.py
│   ├── train_failure_model.py
│   ├── evaluate_models.py
│   └── run_pipeline.py
│
├── models/
│   ├── isolation_forest.joblib
│   ├── failure_rf.joblib
│   ├── scaler.joblib
│   └── metadata.joblib
│
├── data/
│   ├── synthetic_transformer_telemetry.csv
│   └── model_evaluation_metrics.json
│
├── tests/
│
├── simulator/
│   └── Spring Boot Java Sensor Simulator
│
├── frontend/
│   └── pekka-ai/
│       ├── src/
│       ├── .env
│       ├── package.json
│       └── vite.config.*
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

# 23. Current System Status

| Component                | Status       |
| ------------------------ | ------------ |
| Java Sensor Simulator    | ✅ Integrated |
| 18 Live Sensors          | ✅            |
| FastAPI Backend          | ✅            |
| Feature Engineering      | ✅            |
| Rule-Based Safety        | ✅            |
| Isolation Forest         | ✅            |
| Random Forest            | ✅            |
| Risk Engine              | ✅            |
| Recommendation Engine    | ✅            |
| React Frontend           | ✅            |
| Live Telemetry           | ✅            |
| Equipment Switching      | ✅            |
| NORMAL Scenario          | ✅            |
| WARNING Scenario         | ✅            |
| CRITICAL Scenario        | ✅            |
| Backend Offline Handling | ✅            |
| Backend Recovery         | ✅            |
| Python Tests             | ✅ 38 passed  |
| Java Tests               | ✅ 12 passed  |
| Frontend Build           | ✅            |
| Frontend Lint            | ✅            |

---

# 24. Project Summary

**PEKKA AI transforms raw transformer telemetry into actionable infrastructure intelligence.**

```text
RAW SENSOR DATA
      ↓
EARLY ANOMALY DETECTION
      ↓
FAILURE PREDICTION
      ↓
RISK ASSESSMENT
      ↓
PREVENTIVE RECOMMENDATION
      ↓
HUMAN DECISION
```

The system demonstrates how AI can support **predictive maintenance, infrastructure reliability, and early-warning decision support** for critical power-grid assets while keeping humans responsible for physical infrastructure decisions.
