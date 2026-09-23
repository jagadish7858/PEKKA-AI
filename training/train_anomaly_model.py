"""
Anomaly Detection Model Training using scikit-learn IsolationForest.
------------------------------------------------------------------
Trains an unsupervised Isolation Forest on normal transformer operational patterns.
Saves the trained model and feature scaler to models/ for low-latency live inference.
"""

import os
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from training.generate_dataset import FEATURE_NAMES


def train_anomaly_detector(
    dataset_path: str = "data/synthetic_transformer_telemetry.csv",
    models_dir: str = "models",
    contamination: float = 0.05,
    random_seed: int = 42,
) -> IsolationForest:
    """
    Trains Isolation Forest on transformer operational data.
    """
    print(f"\n--- Training Unsupervised Anomaly Detector (Isolation Forest) ---")
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Run generate_dataset.py first.")

    df = pd.read_csv(dataset_path)
    X = df[FEATURE_NAMES].values

    # Fit scaler on all training data
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train Isolation Forest
    # n_estimators=150 gives stable decision path lengths without excessive latency
    iso_forest = IsolationForest(
        n_estimators=150,
        contamination=contamination,
        random_state=random_seed,
        n_jobs=-1,
    )
    iso_forest.fit(X_scaled)

    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "isolation_forest.joblib")
    scaler_path = os.path.join(models_dir, "scaler.joblib")

    joblib.dump(iso_forest, model_path)
    joblib.dump(scaler, scaler_path)

    print(f"Isolation Forest model trained and saved to: {model_path}")
    print(f"Feature scaler saved to: {scaler_path}")
    return iso_forest


if __name__ == "__main__":
    train_anomaly_detector()
