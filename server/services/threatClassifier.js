const threatRules = [
  {
    threatType: "Credential Theft",
    keywords: ["password leak", "password", "credentials", "credential", "2fa", "token", "stolen login"],
  },
  {
    threatType: "Ransomware",
    keywords: ["ransom", "ransomware", "encrypt files", "decrypt", "locker"],
  },
  {
    threatType: "DDoS Attack",
    keywords: ["ddos", "traffic spike", "botnet", "flood", "amplification"],
  },
  {
    threatType: "Phishing Attack",
    keywords: ["phishing", "fake login", "spoof", "credential stuffing", "login page"],
  },
  {
    threatType: "Malware Infection",
    keywords: ["malware", "trojan", "loader", "backdoor", "payload", "persistence"],
  },
  {
    threatType: "Data Breach",
    keywords: ["breach", "leaked data", "database dump", "dump", "exfiltration", "customer records"],
  },
  {
    threatType: "Insider Threat",
    keywords: ["insider", "employee access", "admin panel", "privilege abuse"],
  },
];

function normalizeParts(value) {
  if (Array.isArray(value)) {
    return value.join(" ");
  }

  if (value && typeof value === "object") {
    return Object.values(value).flat().join(" ");
  }

  return String(value || "");
}

function classifyThreat(data = {}) {
  const corpus = [
    normalizeParts(data.threatsDetected),
    normalizeParts(data.logAnomalies),
    normalizeParts(data.darkWebFlags),
    normalizeParts(data.content),
    normalizeParts(data.explanation),
  ]
    .join(" ")
    .toLowerCase();

  const ranked = threatRules
    .map((rule) => {
      const matchedKeywords = rule.keywords.filter((keyword) => corpus.includes(keyword));
      return {
        threatType: rule.threatType,
        matchedKeywords,
        score: matchedKeywords.length / rule.keywords.length,
      };
    })
    .sort((left, right) => right.matchedKeywords.length - left.matchedKeywords.length || right.score - left.score);

  const best = ranked[0];
  if (!best || best.matchedKeywords.length === 0) {
    return {
      threatType: "Suspicious Activity",
      confidenceScore: 0.42,
      reasoning: "No dominant threat-specific keyword cluster was found; activity remains suspicious based on available context.",
    };
  }

  const confidenceScore = Math.min(0.98, Number((0.48 + best.matchedKeywords.length * 0.14 + best.score * 0.2).toFixed(2)));

  return {
    threatType: best.threatType,
    confidenceScore,
    reasoning: `Matched ${best.matchedKeywords.join(", ")} to ${best.threatType}.`,
  };
}

module.exports = {
  classifyThreat,
};
