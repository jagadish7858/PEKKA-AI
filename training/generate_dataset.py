"""
Synthetic Telemetry Dataset Generator for Power Grid Transformers.
------------------------------------------------------------------
NOTICE: This dataset is SYNTHETIC / DEMO training data generated strictly
from domain physics rules and IEEE C57 transformer operating limits.
It is intended for training and evaluating prototype AI/ML models in environments
without access to physical industrial SCADA failure logs.
DO NOT claim this dataset represents empirical physical failure recordings.
"""

import os
import numpy as np
import pandas as pd

# 15 Engineered Features matching the live inference pipeline
FEATURE_NAMES = [
    "temperature",
    "oil_temperature",
    "oil_pressure",
    "voltage",
    "current",
    "vibration",
    "load",
    "power_factor",
    "frequency",
    "temp_oil_delta",
    "apparent_power_ratio",
    "temp_rate_of_change",
    "vib_rate_of_change",
    "rolling_temp_std",
    "rolling_current_std",
]


def generate_synthetic_dataset(
    n_samples: int = 6000,
    random_seed: int = 42,
    output_path: str = "data/synthetic_transformer_telemetry.csv",
) -> pd.DataFrame:
    """
    Generates a labelled multivariate time-series feature dataset across 5 operational regimes:
    0: NORMAL (65% of samples)
    1: THERMAL_OVERLOAD (12% of samples)
    2: MECHANICAL_FAULT (10% of samples)
    3: DIELECTRIC_FAULT (8% of samples)
    4: CRITICAL_FAILURE (5% of samples)
    """
    np.random.seed(random_seed)

    n_normal = int(n_samples * 0.65)
    n_thermal = int(n_samples * 0.12)
    n_mech = int(n_samples * 0.10)
    n_dielectric = int(n_samples * 0.08)
    n_critical = n_samples - (n_normal + n_thermal + n_mech + n_dielectric)

    records = []

    # 1. NORMAL REGIME
    for _ in range(n_normal):
        load = np.random.uniform(45.0, 78.0)
        curr = (load / 100.0) * 60.0 + np.random.normal(0, 1.5)
        volt = np.random.normal(400.0, 4.0)
        temp = 48.0 + (load * 0.25) + np.random.normal(0, 1.8)
        oil_temp = temp - np.random.uniform(4.0, 10.0)
        oil_press = np.random.normal(25.0, 2.0)
        vib = np.random.uniform(0.8, 2.2)
        pf = np.random.uniform(0.93, 0.98)
        freq = np.random.normal(50.0, 0.05)

        records.append({
            "temperature": round(temp, 2),
            "oil_temperature": round(oil_temp, 2),
            "oil_pressure": round(oil_press, 2),
            "voltage": round(volt, 2),
            "current": round(max(5.0, curr), 2),
            "vibration": round(vib, 2),
            "load": round(load, 2),
            "power_factor": round(pf, 3),
            "frequency": round(freq, 2),
            "temp_oil_delta": round(temp - oil_temp, 2),
            "apparent_power_ratio": round((volt * curr) / (400.0 * 50.0), 3),
            "temp_rate_of_change": round(np.random.normal(0.0, 0.03), 4),
            "vib_rate_of_change": round(np.random.normal(0.0, 0.02), 4),
            "rolling_temp_std": round(np.random.uniform(0.2, 1.2), 3),
            "rolling_current_std": round(np.random.uniform(0.5, 2.0), 3),
            "failure_label": 0,
            "failure_mode": "NORMAL",
            "is_failure": 0,
        })

    # 2. THERMAL_OVERLOAD REGIME
    for _ in range(n_thermal):
        load = np.random.uniform(95.0, 135.0)
        curr = (load / 100.0) * 65.0 + np.random.normal(0, 2.5)
        volt = np.random.normal(395.0, 6.0)
        temp = np.random.uniform(88.0, 118.0)
        oil_temp = np.random.uniform(82.0, 105.0)
        oil_press = np.random.normal(32.0, 4.0)
        vib = np.random.uniform(2.0, 4.0)
        pf = np.random.uniform(0.88, 0.94)
        freq = np.random.normal(49.9, 0.1)

        records.append({
            "temperature": round(temp, 2),
            "oil_temperature": round(oil_temp, 2),
            "oil_pressure": round(oil_press, 2),
            "voltage": round(volt, 2),
            "current": round(curr, 2),
            "vibration": round(vib, 2),
            "load": round(load, 2),
            "power_factor": round(pf, 3),
            "frequency": round(freq, 2),
            "temp_oil_delta": round(temp - oil_temp, 2),
            "apparent_power_ratio": round((volt * curr) / (400.0 * 50.0), 3),
            "temp_rate_of_change": round(np.random.uniform(0.15, 0.85), 4),
            "vib_rate_of_change": round(np.random.normal(0.02, 0.05), 4),
            "rolling_temp_std": round(np.random.uniform(2.5, 6.5), 3),
            "rolling_current_std": round(np.random.uniform(3.0, 7.0), 3),
            "failure_label": 1,
            "failure_mode": "THERMAL_OVERLOAD",
            "is_failure": 1,
        })

    # 3. MECHANICAL_FAULT REGIME
    for _ in range(n_mech):
        load = np.random.uniform(60.0, 85.0)
        curr = (load / 100.0) * 55.0 + np.random.normal(0, 2.0)
        volt = np.random.normal(398.0, 5.0)
        temp = np.random.uniform(55.0, 78.0)
        oil_temp = temp - np.random.uniform(5.0, 9.0)
        oil_press = np.random.normal(25.0, 2.5)
        vib = np.random.uniform(5.2, 12.0)  # Distinct high vibration
        pf = np.random.uniform(0.90, 0.96)
        freq = np.random.normal(50.0, 0.08)

        records.append({
            "temperature": round(temp, 2),
            "oil_temperature": round(oil_temp, 2),
            "oil_pressure": round(oil_press, 2),
            "voltage": round(volt, 2),
            "current": round(curr, 2),
            "vibration": round(vib, 2),
            "load": round(load, 2),
            "power_factor": round(pf, 3),
            "frequency": round(freq, 2),
            "temp_oil_delta": round(temp - oil_temp, 2),
            "apparent_power_ratio": round((volt * curr) / (400.0 * 50.0), 3),
            "temp_rate_of_change": round(np.random.normal(0.02, 0.05), 4),
            "vib_rate_of_change": round(np.random.uniform(0.12, 0.65), 4),
            "rolling_temp_std": round(np.random.uniform(0.8, 2.0), 3),
            "rolling_current_std": round(np.random.uniform(1.0, 3.0), 3),
            "failure_label": 2,
            "failure_mode": "MECHANICAL_FAULT",
            "is_failure": 1,
        })

    # 4. DIELECTRIC_FAULT REGIME (Insulation / Oil Breakdown)
    for _ in range(n_dielectric):
        load = np.random.uniform(50.0, 90.0)
        curr = (load / 100.0) * 55.0 + np.random.normal(0, 3.0)
        volt = np.random.normal(385.0, 15.0)
        temp = np.random.uniform(70.0, 92.0)
        oil_temp = np.random.uniform(75.0, 96.0)
        # Pressure leak (<12) or pressure surge (>44)
        oil_press = np.random.choice([np.random.uniform(6.0, 12.0), np.random.uniform(43.0, 58.0)])
        vib = np.random.uniform(1.8, 3.8)
        pf = np.random.uniform(0.68, 0.84)  # Severely degraded power factor
        freq = np.random.normal(49.8, 0.2)

        records.append({
            "temperature": round(temp, 2),
            "oil_temperature": round(oil_temp, 2),
            "oil_pressure": round(oil_press, 2),
            "voltage": round(volt, 2),
            "current": round(curr, 2),
            "vibration": round(vib, 2),
            "load": round(load, 2),
            "power_factor": round(pf, 3),
            "frequency": round(freq, 2),
            "temp_oil_delta": round(temp - oil_temp, 2),
            "apparent_power_ratio": round((volt * curr) / (400.0 * 50.0), 3),
            "temp_rate_of_change": round(np.random.uniform(0.08, 0.40), 4),
            "vib_rate_of_change": round(np.random.normal(0.03, 0.06), 4),
            "rolling_temp_std": round(np.random.uniform(1.5, 4.0), 3),
            "rolling_current_std": round(np.random.uniform(2.0, 5.0), 3),
            "failure_label": 3,
            "failure_mode": "DIELECTRIC_FAULT",
            "is_failure": 1,
        })

    # 5. CRITICAL_FAILURE (Compound cascading fault)
    for _ in range(n_critical):
        load = np.random.uniform(120.0, 160.0)
        curr = np.random.uniform(88.0, 125.0)
        volt = np.random.uniform(330.0, 360.0)  # Severe voltage collapse
        temp = np.random.uniform(105.0, 135.0)
        oil_temp = np.random.uniform(98.0, 120.0)
        oil_press = np.random.uniform(48.0, 65.0)
        vib = np.random.uniform(8.5, 16.0)
        pf = np.random.uniform(0.60, 0.78)
        freq = np.random.uniform(48.2, 49.2)

        records.append({
            "temperature": round(temp, 2),
            "oil_temperature": round(oil_temp, 2),
            "oil_pressure": round(oil_press, 2),
            "voltage": round(volt, 2),
            "current": round(curr, 2),
            "vibration": round(vib, 2),
            "load": round(load, 2),
            "power_factor": round(pf, 3),
            "frequency": round(freq, 2),
            "temp_oil_delta": round(temp - oil_temp, 2),
            "apparent_power_ratio": round((volt * curr) / (400.0 * 50.0), 3),
            "temp_rate_of_change": round(np.random.uniform(0.60, 2.10), 4),
            "vib_rate_of_change": round(np.random.uniform(0.40, 1.20), 4),
            "rolling_temp_std": round(np.random.uniform(5.0, 12.0), 3),
            "rolling_current_std": round(np.random.uniform(6.0, 15.0), 3),
            "failure_label": 4,
            "failure_mode": "CRITICAL_FAILURE",
            "is_failure": 1,
        })

    df = pd.DataFrame(records)
    # Shuffle
    df = df.sample(frac=1.0, random_state=random_seed).reset_index(drop=True)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} synthetic transformer telemetry samples -> {output_path}")
    print(f"Class distribution:\n{df['failure_mode'].value_counts()}")
    return df


if __name__ == "__main__":
    generate_synthetic_dataset()
