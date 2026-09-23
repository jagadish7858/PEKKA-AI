import os
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, f1_score
import joblib

from app.ml.feature_engineering import FEATURE_NAMES

def generate_synthetic_dataset(n_samples: int = 6000, random_seed: int = 42):
    np.random.seed(random_seed)
    
    # 1. NORMAL SAMPLES (60%)
    n_normal = int(n_samples * 0.60)
    normal_temp = np.random.uniform(55.0, 70.0, n_normal)
    normal_load = np.random.uniform(40.0, 70.0, n_normal)
    normal_curr = 300.0 + ((normal_load - 40.0) / 30.0) * 140.0 + np.random.normal(0, 5, n_normal)
    normal_volt = 232.0 - ((normal_curr - 300.0) / 150.0) * 4.0 + np.random.normal(0, 1.5, n_normal)
    normal_vibr = 1.6 + ((normal_load - 40.0) / 30.0) * 0.8 + np.random.normal(0, 0.2, n_normal)
    normal_pf = np.random.uniform(0.91, 0.98, n_normal)
    normal_freq = np.random.uniform(49.85, 50.15, n_normal)
    normal_oil_temp = normal_temp - np.random.uniform(6.0, 9.0, n_normal)
    normal_oil_pres = 1.45 + np.random.uniform(0.0, 0.35, n_normal)
    normal_temp_roc = np.random.normal(0.0, 0.3, n_normal)
    normal_vibr_roc = np.random.normal(0.0, 0.1, n_normal)
    normal_load_roc = np.random.normal(0.0, 0.5, n_normal)

    # 2. WARNING / DEGRADATION SAMPLES (25%)
    n_warning = int(n_samples * 0.25)
    warn_load = np.random.uniform(72.0, 89.0, n_warning)
    warn_curr = 460.0 + ((warn_load - 70.0) / 20.0) * 120.0 + np.random.normal(0, 8, n_warning)
    warn_volt = np.random.uniform(208.0, 245.0, n_warning)
    warn_vibr = np.random.uniform(3.2, 5.8, n_warning)
    warn_pf = np.random.uniform(0.83, 0.89, n_warning)
    warn_freq = np.random.uniform(49.3, 50.6, n_warning)
    warn_temp = np.random.uniform(71.0, 85.0, n_warning)
    warn_oil_temp = np.random.uniform(66.0, 81.0, n_warning)
    warn_oil_pres = np.random.uniform(2.05, 2.70, n_warning)
    warn_temp_roc = np.random.normal(0.8, 0.4, n_warning)
    warn_vibr_roc = np.random.normal(0.4, 0.2, n_warning)
    warn_load_roc = np.random.normal(1.2, 0.6, n_warning)

    # 3. CRITICAL / FAILURE SAMPLES (15%)
    n_critical = n_samples - n_normal - n_warning
    crit_load = np.random.uniform(91.0, 115.0, n_critical)
    crit_curr = np.random.uniform(620.0, 880.0, n_critical)
    crit_volt = np.random.uniform(170.0, 202.0, n_critical)
    crit_vibr = np.random.uniform(6.8, 16.0, n_critical)
    crit_pf = np.random.uniform(0.65, 0.79, n_critical)
    crit_freq = np.random.uniform(47.5, 49.2, n_critical)
    crit_temp = np.random.uniform(88.0, 118.0, n_critical)
    crit_oil_temp = np.random.uniform(84.0, 110.0, n_critical)
    crit_oil_pres = np.random.uniform(2.85, 4.2, n_critical)
    crit_temp_roc = np.random.normal(2.5, 0.8, n_critical)
    crit_vibr_roc = np.random.normal(1.2, 0.5, n_critical)
    crit_load_roc = np.random.normal(3.0, 1.0, n_critical)

    # Combine arrays
    temp = np.concatenate([normal_temp, warn_temp, crit_temp])
    volt = np.concatenate([normal_volt, warn_volt, crit_volt])
    curr = np.concatenate([normal_curr, warn_curr, crit_curr])
    vibr = np.concatenate([normal_vibr, warn_vibr, crit_vibr])
    load = np.concatenate([normal_load, warn_load, crit_load])
    pf = np.concatenate([normal_pf, warn_pf, crit_pf])
    freq = np.concatenate([normal_freq, warn_freq, crit_freq])
    oil_temp = np.concatenate([normal_oil_temp, warn_oil_temp, crit_oil_temp])
    oil_pres = np.concatenate([normal_oil_pres, warn_oil_pres, crit_oil_pres])
    temp_roc = np.concatenate([normal_temp_roc, warn_temp_roc, crit_temp_roc])
    vibr_roc = np.concatenate([normal_vibr_roc, warn_vibr_roc, crit_vibr_roc])
    load_roc = np.concatenate([normal_load_roc, warn_load_roc, crit_load_roc])

    temp_oil_gradient = temp - oil_temp
    apparent_power = (volt * curr) / 1000.0
    volt_dev = np.abs(volt - 230.0)
    freq_dev = np.abs(freq - 50.0)

    # Labels: 0 = NORMAL, 1 = WARNING_DEGRADATION, 2 = CRITICAL_FAILURE
    labels = np.array([0] * n_normal + [1] * n_warning + [2] * n_critical, dtype=int)

    df = pd.DataFrame({
        "temperature": temp,
        "voltage": volt,
        "current": curr,
        "vibration": vibr,
        "load_percentage": load,
        "power_factor": pf,
        "frequency": freq,
        "oil_temperature": oil_temp,
        "oil_pressure": oil_pres,
        "temp_oil_gradient": temp_oil_gradient,
        "apparent_power_est": apparent_power,
        "voltage_deviation": volt_dev,
        "freq_deviation": freq_dev,
        "temp_rate_of_change": temp_roc,
        "vibr_rate_of_change": vibr_roc,
        "load_rate_of_change": load_roc,
        "label": labels
    })

    return df

def train_and_save_models(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    print(f"[1/4] Generating physics-informed training dataset...")
    df = generate_synthetic_dataset(n_samples=6000)
    
    X = df[FEATURE_NAMES].values
    y = df["label"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"[2/4] Fitting feature scaler...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 1. Train Isolation Forest (Unsupervised Anomaly Detector)
    print(f"[3/4] Training IsolationForest anomaly detector...")
    # Train on normal and slight warning samples to capture healthy telemetry manifold
    normal_indices = np.where(y_train == 0)[0]
    iso_forest = IsolationForest(
        n_estimators=150,
        contamination=0.08,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_train_scaled[normal_indices])

    # 2. Train Random Forest Classifier (Supervised Failure Prediction)
    print(f"[4/4] Training RandomForest failure prediction classifier...")
    rf_classifier = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )
    rf_classifier.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = rf_classifier.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    print("\n--- MODEL EVALUATION METRICS ---")
    print(f"RandomForest Accuracy: {acc:.4f}")
    print(f"RandomForest F1-Score: {f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["NORMAL", "WARNING", "CRITICAL"]))

    # Test IsolationForest anomaly score distribution
    norm_scores = -iso_forest.score_samples(X_test_scaled[y_test == 0])
    crit_scores = -iso_forest.score_samples(X_test_scaled[y_test == 2])
    print(f"IsolationForest Normal Score Mean: {np.mean(norm_scores):.4f}")
    print(f"IsolationForest Critical Score Mean: {np.mean(crit_scores):.4f}")

    # Save artifacts
    scaler_path = os.path.join(output_dir, "scaler.joblib")
    iso_path = os.path.join(output_dir, "isolation_forest.joblib")
    rf_path = os.path.join(output_dir, "random_forest.joblib")

    joblib.dump(scaler, scaler_path)
    joblib.dump(iso_forest, iso_path)
    joblib.dump(rf_classifier, rf_path)

    print(f"\nSuccessfully saved trained models to:\n  - {scaler_path}\n  - {iso_path}\n  - {rf_path}")
    return {
        "accuracy": acc,
        "f1_score": f1,
        "scaler_path": scaler_path,
        "iso_path": iso_path,
        "rf_path": rf_path
    }

if __name__ == "__main__":
    saved_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "saved_models")
    train_and_save_models(saved_dir)
