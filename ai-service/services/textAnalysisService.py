import re
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize


def _ensure_nltk_assets():
    resource_map = {
        "punkt": "tokenizers/punkt",
        "punkt_tab": "tokenizers/punkt_tab",
        "vader_lexicon": "sentiment/vader_lexicon.zip",
    }

    for package, resource_path in resource_map.items():
        try:
            nltk.data.find(resource_path)
        except LookupError:
            nltk.download(package, quiet=True)


_ensure_nltk_assets()
_sentiment_analyzer = SentimentIntensityAnalyzer()

SUSPICIOUS_KEYWORDS = {
    "hack": 18,
    "hacked": 18,
    "exploit": 16,
    "breach": 20,
    "password": 14,
    "leak": 17,
    "credential": 16,
    "ransomware": 22,
    "phishing": 18,
    "malware": 20,
    "botnet": 22,
    "privilege": 10,
    "exfiltration": 24,
}


def analyze_text_evidence(text):
    normalized_text = text.strip()
    sanitized_text = re.sub(r"\s+", " ", normalized_text)
    tokens = [token.lower() for token in word_tokenize(sanitized_text) if token.isalpha()]
    matched_keywords = sorted({token for token in tokens if token in SUSPICIOUS_KEYWORDS})

    keyword_score = min(sum(SUSPICIOUS_KEYWORDS[keyword] for keyword in matched_keywords), 70)
    sentiment_scores = _sentiment_analyzer.polarity_scores(sanitized_text)
    compound_score = sentiment_scores["compound"]

    if compound_score <= -0.3:
        sentiment = "negative"
    elif compound_score >= 0.3:
        sentiment = "positive"
    else:
        sentiment = "neutral"

    sentiment_risk = 20 if sentiment == "negative" else 8 if sentiment == "neutral" else 2
    density_bonus = min(int((len(matched_keywords) / max(len(tokens), 1)) * 100), 10)
    risk_score = min(keyword_score + sentiment_risk + density_bonus, 100)

    if matched_keywords:
        explanation = (
            f"Detected suspicious keywords related to cyber abuse: {', '.join(matched_keywords)}. "
            f"Sentiment is {sentiment} with compound score {compound_score:.2f}, increasing investigative concern."
        )
    else:
        explanation = (
            f"No direct high-risk keywords were found after NLP preprocessing. "
            f"Sentiment is {sentiment} with compound score {compound_score:.2f}."
        )

    return {
        "riskScore": risk_score,
        "threatsDetected": matched_keywords,
        "sentiment": sentiment,
        "explanation": explanation,
    }
