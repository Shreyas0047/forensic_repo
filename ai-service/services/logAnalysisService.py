import re
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

LOG_PATTERN_WEIGHTS = {
    "failed": 12,
    "error": 10,
    "denied": 14,
    "unauthorized": 18,
    "sudo": 10,
    "admin": 8,
    "login": 6,
    "deleted": 14,
    "download": 8,
    "exfil": 20,
}


def _extract_features(log_lines):
    feature_rows = []

    for line in log_lines:
        lowered = line.lower()
        digits = re.findall(r"\d+", line)
        feature_rows.append(
            {
                "length": len(line),
                "uppercase_ratio": sum(char.isupper() for char in line) / max(len(line), 1),
                "digit_count": len(digits),
                "ip_count": len(re.findall(r"(?:\d{1,3}\.){3}\d{1,3}", line)),
                "timestamp_count": len(re.findall(r"\d{2}:\d{2}:\d{2}", line)),
                "severity_hits": sum(weight for pattern, weight in LOG_PATTERN_WEIGHTS.items() if pattern in lowered),
                "special_char_ratio": sum(not char.isalnum() and not char.isspace() for char in line) / max(len(line), 1),
            }
        )

    return pd.DataFrame(feature_rows)


def analyze_log_evidence(log_data):
    log_lines = [line.strip() for line in log_data.splitlines() if line.strip()]
    if not log_lines:
        raise ValueError("No log entries available for analysis.")

    feature_frame = _extract_features(log_lines)
    contamination = min(max(1 / max(len(log_lines), 1), 0.05), 0.35)
    model = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        random_state=42,
    )
    anomaly_labels = model.fit_predict(feature_frame.to_numpy())
    anomaly_scores = model.decision_function(feature_frame.to_numpy())

    anomalies = [log_lines[index] for index, label in enumerate(anomaly_labels) if label == -1]
    anomalous_ratio = len(anomalies) / max(len(log_lines), 1)
    pattern_risk = min(int(feature_frame["severity_hits"].sum() / max(len(log_lines), 1)), 45)
    anomaly_risk = min(int(anomalous_ratio * 100) + 20, 55)
    risk_score = min(pattern_risk + anomaly_risk, 100)

    explanation = (
        f"Processed {len(log_lines)} log entries with Isolation Forest. "
        f"Detected {len(anomalies)} anomalous entries based on structural deviations, severity markers, and token density. "
        f"Average anomaly decision score: {float(np.mean(anomaly_scores)):.4f}."
    )

    return {
        "anomaliesDetected": len(anomalies) > 0,
        "riskScore": risk_score,
        "explanation": explanation,
        "anomalousEntries": anomalies[:10],
    }
