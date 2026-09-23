"""
End-to-End AI Model Training & Evaluation Pipeline Runner.
---------------------------------------------------------
Executes:
1. Synthetic Physics Dataset Generation (IEEE C57 domain limits)
2. Isolation Forest Unsupervised Anomaly Model Training
3. Random Forest Supervised Failure Risk Model Training
4. Validation & Empirical Metrics Calculation
"""

import sys
from training.generate_dataset import generate_synthetic_dataset
from training.train_anomaly_model import train_anomaly_detector
from training.train_failure_model import train_failure_predictor
from training.evaluate_models import evaluate_models


def run_training_pipeline():
    print("=======================================================")
    print("     STARTING TRUVEX AI/ML TRAINING & EVALUATION       ")
    print("=======================================================")

    # Step 1: Generate dataset
    generate_synthetic_dataset(n_samples=6000, random_seed=42)

    # Step 2: Train Anomaly Detector
    train_anomaly_detector()

    # Step 3: Train Failure Predictor
    train_failure_predictor()

    # Step 4: Evaluate Models
    metrics = evaluate_models()

    print("=======================================================")
    print("         TRAINING & EVALUATION PIPELINE COMPLETE       ")
    print("=======================================================")
    return metrics


if __name__ == "__main__":
    run_training_pipeline()
