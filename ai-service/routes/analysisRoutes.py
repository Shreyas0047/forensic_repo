from flask import Blueprint, jsonify, request
from services.textAnalysisService import analyze_text_evidence
from services.logAnalysisService import analyze_log_evidence
from services.imageAnalysisService import analyze_image_evidence

analysis_blueprint = Blueprint("analysis", __name__)


@analysis_blueprint.post("/text")
def analyze_text():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text")

    if not isinstance(text, str) or not text.strip():
        return jsonify({"success": False, "error": "A non-empty text field is required."}), 400

    try:
        result = analyze_text_evidence(text)
        return jsonify({"success": True, "data": result}), 200
    except ValueError as error:
        return jsonify({"success": False, "error": str(error)}), 400


@analysis_blueprint.post("/log")
def analyze_log():
    payload = request.get_json(silent=True) or {}
    log_data = payload.get("logData")

    if not isinstance(log_data, str) or not log_data.strip():
        return jsonify({"success": False, "error": "A non-empty logData field is required."}), 400

    try:
        result = analyze_log_evidence(log_data)
        return jsonify({"success": True, "data": result}), 200
    except ValueError as error:
        return jsonify({"success": False, "error": str(error)}), 400


@analysis_blueprint.post("/image")
def analyze_image():
    if "image" not in request.files:
        return jsonify({"success": False, "error": "Image file is required."}), 400

    image_file = request.files["image"]
    if not image_file.filename:
        return jsonify({"success": False, "error": "Image file name is required."}), 400

    try:
        result = analyze_image_evidence(image_file)
        return jsonify({"success": True, "data": result}), 200
    except ValueError as error:
        return jsonify({"success": False, "error": str(error)}), 400
