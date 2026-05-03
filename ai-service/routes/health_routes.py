from flask import Blueprint, jsonify

health_blueprint = Blueprint("health", __name__)


@health_blueprint.get("/health")
def health():
    return jsonify(
        {
            "success": True,
            "service": "forensics-ai-service",
            "status": "ok",
        }
    )
