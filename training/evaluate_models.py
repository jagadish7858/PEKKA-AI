"""
Model Evaluation and Metrics Reporting for TRUVEX AI Models.
------------------------------------------------------------
Evaluates both the Isolation Forest and Random Forest classifier on holdout validation data.
Calculates Accuracy, Precision, Recall, F1-Score, Confusion Matrix, and ROC-AUC.
Saves empirical metrics directly to data/model_evaluation_metrics.json.
DO NOT fabricate metrics — all numbers are derived from actual evaluation code execution.
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
    classification_report,
)
from sklearn.model_selection import train_test_split
from training.generate_dataset import FEATURE_NAMES
from training.train_failure_model import LABEL_NAMES


def evaluate_models(
    dataset_path: str = "data/synthetic_transformer_telemetry.csv",
    models_dir: str = "models",
    output_metrics_path: str = "data/model_evaluation_metrics.json",
    random_seed: int = 42,
) -> dict:
    print("\n=======================================================")
    print("      RUNNING MODEL EVALUATION & METRICS GENERATION     ")
    print("=======================================================\n")

    # Load dataset
    df = pd.read_csv(dataset_path)
    X = df[FEATURE_NAMES].values
    y = df["failure_label"].values
    y_binary = df["is_failure"].values

    # Load serialized artifacts
    scaler = joblib.load(os.path.join(models_dir, "scaler.joblib"))
    iso_forest = joblib.load(os.path.join(models_dir, "isolation_forest.joblib"))
    rf = joblib.load(os.path.join(models_dir, "failure_rf.joblib"))
    metadata = joblib.load(os.path.join(models_dir, "metadata.joblib"))

    X_scaled = scaler.transform(X)

    # Split for independent holdout evaluation (20%)
    X_train, X_val, y_train, y_val, y_bin_train, y_bin_val = train_test_split(
        X_scaled, y, y_binary, test_size=0.20, random_state=random_seed, stratify=y
    )

    # 1. EVALUATE SUPERVISED FAILURE PREDICTOR (RANDOM FOREST)
    rf_preds = rf.predict(X_val)
    rf_proba = rf.predict_proba(X_val)

    # Overall accuracy
    acc = float(accuracy_score(y_val, rf_preds))
    # Weighted precision, recall, f1 for multi-class
    prec = float(precision_score(y_val, rf_preds, average="weighted", zero_division=0))
    rec = float(recall_score(y_val, rf_preds, average="weighted", zero_division=0))
    f1 = float(f1_score(y_val, rf_preds, average="weighted", zero_division=0))

    # Multi-class ROC-AUC (OVR)
    try:
        roc_auc = float(roc_auc_score(y_val, rf_proba, multi_class="ovr", average="weighted"))
    except Exception:
        roc_auc = None

    cm = confusion_matrix(y_val, rf_preds).tolist()
    class_rep = classification_report(y_val, rf_preds, target_names=LABEL_NAMES, output_dict=True)

    print("--- 1. RANDOM FOREST FAILURE PREDICTOR METRICS ---")
    print(f"Accuracy:        {acc:.4f} ({acc*100:.2f}%)")
    print(f"Weighted F1:     {f1:.4f}")
    print(f"Precision:       {prec:.4f}")
    print(f"Recall:          {rec:.4f}")
    if roc_auc:
        print(f"ROC-AUC (OVR):   {roc_auc:.4f}")
    print(f"\nConfusion Matrix:\n{np.array(cm)}")

    # 2. EVALUATE UNSUPERVISED ANOMALY DETECTOR (ISOLATION FOREST)
    # IsolationForest outputs: 1 for inlier (normal), -1 for outlier (anomaly)
    iso_raw = iso_forest.predict(X_val)
    iso_binary_pred = np.where(iso_raw == -1, 1, 0)
    # Lower decision_function means more abnormal
    iso_scores = -iso_forest.decision_function(X_val)

    iso_acc = float(accuracy_score(y_bin_val, iso_binary_pred))
    iso_prec = float(precision_score(y_bin_val, iso_binary_pred, zero_division=0))
    iso_rec = float(recall_score(y_bin_val, iso_binary_pred, zero_division=0))
    iso_f1 = float(f1_score(y_bin_val, iso_binary_pred, zero_division=0))
    iso_roc_auc = float(roc_auc_score(y_bin_val, iso_scores))
    iso_cm = confusion_matrix(y_bin_val, iso_binary_pred).tolist()

    print("\n--- 2. ISOLATION FOREST ANOMALY DETECTOR METRICS ---")
    print(f"Validation Accuracy: {iso_acc:.4f}")
    print(f"Precision:           {iso_prec:.4f}")
    print(f"Recall:              {iso_rec:.4f}")
    print(f"F1-Score:            {iso_f1:.4f}")
    print(f"ROC-AUC (Anomaly):   {iso_roc_auc:.4f}")
    print(f"Confusion Matrix:\n{np.array(iso_cm)}")

    # Feature importances ranking
    feat_importances = metadata.get("feature_importances", {})
    sorted_importances = sorted(feat_importances.items(), key=lambda x: x[1], reverse=True)
    print("\n--- Top 5 Important Failure Predictor Features ---")
    for fname, score in sorted_importances[:5]:
        print(f"  • {fname}: {score:.4f}")

    results = {
        "dataset": {
            "source": "SYNTHETIC_TRANSFORMER_TELEMETRY (IEEE C57 domain specifications)",
            "total_samples": len(df),
            "validation_samples": len(X_val),
            "features_count": len(FEATURE_NAMES),
        },
        "random_forest_failure_predictor": {
            "model_type": "RandomForestClassifier",
            "accuracy": acc,
            "weighted_precision": prec,
            "weighted_recall": rec,
            "weighted_f1_score": f1,
            "roc_auc_ovr": roc_auc,
            "confusion_matrix": cm,
            "classes": LABEL_NAMES,
            "per_class_metrics": class_rep,
            "top_features": dict(sorted_importances[:5]),
        },
        "isolation_forest_anomaly_detector": {
            "model_type": "IsolationForest",
            "accuracy": iso_acc,
            "precision": iso_prec,
            "recall": iso_rec,
            "f1_score": iso_f1,
            "roc_auc": iso_roc_auc,
            "confusion_matrix": iso_cm,
        },
    }

    os.makedirs(os.path.dirname(output_metrics_path), exist_ok=True)
    with open(output_metrics_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nEvaluation metrics successfully written to: {output_metrics_path}\n")
    return results


if __name__ == "__main__":
    evaluate_models()
