function calculateRiskScore(inputs = {}) {
  const aiRiskScore = Number(inputs.aiRiskScore || 0);
  const threatCount = Number(inputs.threatCount || 0);
  const anomalyFlags = Number(inputs.anomalyFlags || 0);
  const darkWebFlags = Number(inputs.darkWebFlags || 0);

  const weightedScore =
    aiRiskScore * 0.62 +
    Math.min(threatCount * 8, 18) +
    Math.min(anomalyFlags * 12, 24) +
    Math.min(darkWebFlags * 18, 28);

  const finalRiskScore = Math.max(0, Math.min(100, Math.round(weightedScore)));

  let severity = "low";
  if (finalRiskScore >= 90) {
    severity = "critical";
  } else if (finalRiskScore >= 70) {
    severity = "high";
  } else if (finalRiskScore >= 40) {
    severity = "medium";
  }

  return {
    finalRiskScore,
    severity,
  };
}

module.exports = {
  calculateRiskScore,
};
