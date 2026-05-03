def analyze_evidence_payload(payload):
    filename = (payload.get("filename") or "").lower()
    notes = (payload.get("notes") or "").lower()
    mime_type = payload.get("mimeType") or "unknown"
    indicators = []
    risk_score = 35

    keyword_map = {
        "phish": "Potential phishing artifact pattern detected.",
        "credential": "Credential-focused evidence marker identified.",
        "malware": "Malware-related nomenclature present in artifact metadata.",
        "wallet": "Crypto wallet related signal detected.",
        "telegram": "Messaging-platform coordination indicator found.",
        "ransom": "Ransomware-associated terminology present.",
    }

    combined_text = f"{filename} {notes}"
    for keyword, indicator in keyword_map.items():
        if keyword in combined_text:
            indicators.append(indicator)
            risk_score += 10

    if mime_type.startswith("image/"):
        indicators.append("Image-based evidence may require EXIF and OCR expansion.")
        risk_score += 5
    if mime_type in {"application/zip", "application/x-zip-compressed"}:
        indicators.append("Compressed archive submitted for staged payload review.")
        risk_score += 15

    if not indicators:
        indicators.append("No high-confidence pattern detected from metadata-only triage.")

    return {
        "summary": (
            f"AI triage completed for {payload.get('filename', 'artifact')}. "
            f"Metadata signals indicate {len(indicators)} investigative observation(s)."
        ),
        "indicators": indicators,
        "riskScore": min(risk_score, 100),
        "model": "forensics-triage-sim-v1",
    }
