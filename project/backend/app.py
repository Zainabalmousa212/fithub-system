# backend/app.py

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

from routes import register_routes
from models import Base, engine

load_dotenv()


def create_app() -> Flask:
    app = Flask(__name__)

    # ===== App Config =====
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET", "change-me")
    app.config["JSON_SORT_KEYS"] = False

    # ===== CORS =====
    CORS(
        app,
        origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
        ],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # ===== JWT =====
    JWTManager(app)

    # ===== Database =====
    Base.metadata.create_all(bind=engine)

    # ===== Health Check =====
    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    # ===== Root Endpoint =====
    @app.get("/")
    def home():
        return jsonify({"message": "FitHub backend running"})

    # ===== Register Routes
    register_routes(app)

    # ===== Error Handlers =====
    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "server error", "detail": str(e)}), 500

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)