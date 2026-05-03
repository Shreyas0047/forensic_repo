from flask import Blueprint, jsonify, request
from services.analysis_service import analyze_evidence_payload

analysis_blueprint = Blueprint("analysis", __name__)


@analysis_blueprint.post("/analyze")
def analyze():
    payload = request.get_json(force=True)
    result = analyze_evidence_payload(payload)
    return jsonify({"success": True, "data": result})
