"""
Supervised Failure & Risk Prediction Model Training using RandomForestClassifier.
--------------------------------------------------------------------------------
Trains a Random Forest classifier to predict failure probability and failure modes
(THERMAL_OVERLOAD, MECHANICAL_FAULT, DIELECTRIC_FAULT, CRITICAL_FAILURE, NORMAL).
"""

import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from training.generate_dataset import FEATURE_NAMES

LABEL_NAMES = [
    "NORMAL",
    "THERMAL_OVERLOAD",
    "MECHANICAL_FAULT",
    "DIELECTRIC_FAULT",
    "CRITICAL_FAILURE",
]


def train_failure_predictor(
    dataset_path: str = "data/synthetic_transformer_telemetry.csv",
    models_dir: str = "models",
    random_seed: int = 42,
) -> RandomForestClassifier:
    print(f"\n--- Training Failure Predictor (Random Forest Classifier) ---")
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Run generate_dataset.py first.")

    df = pd.read_csv(dataset_path)
    X = df[FEATURE_NAMES].values
    y = df["failure_label"].values

    # Load the scaler fitted during anomaly detection or fit one here
    scaler_path = os.path.join(models_dir, "scaler.joblib")
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)
        X_scaled = scaler.transform(X)
    else:
        from sklearn.preprocessing import StandardScaler
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        joblib.dump(scaler, scaler_path)

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.20, random_state=random_seed, stratify=y
    )

    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=4,
        class_weight="balanced",
        random_state=random_seed,
        n_jobs=-1,
    )
    rf.fit(X_train, y_train)

    # Save model and metadata
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "failure_rf.joblib")
    metadata_path = os.path.join(models_dir, "metadata.joblib")

    joblib.dump(rf, model_path)
    metadata = {
        "feature_names": FEATURE_NAMES,
        "label_names": LABEL_NAMES,
        "feature_importances": dict(zip(FEATURE_NAMES, [float(x) for x in rf.feature_importances_])),
    }
    joblib.dump(metadata, metadata_path)

    print(f"Random Forest model trained and saved to: {model_path}")
    print(f"Model metadata saved to: {metadata_path}")
    return rf


if __name__ == "__main__":
    train_failure_predictor()
