from flask import Flask, jsonify
from flask_cors import CORS
from routes.analysisRoutes import analysis_blueprint


def create_app():
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
    CORS(app)

    @app.get("/health")
    def health():
        return jsonify({"success": True, "data": {"status": "AI service running"}}), 200

    @app.errorhandler(400)
    def handle_bad_request(error):
        return jsonify({"success": False, "error": str(error)}), 400

    @app.errorhandler(413)
    def handle_large_file(error):
        return jsonify({"success": False, "error": "Uploaded file exceeds maximum allowed size."}), 413

    @app.errorhandler(500)
    def handle_server_error(error):
        return jsonify({"success": False, "error": "Internal AI service error."}), 500

    app.register_blueprint(analysis_blueprint, url_prefix="/analyze")
    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
