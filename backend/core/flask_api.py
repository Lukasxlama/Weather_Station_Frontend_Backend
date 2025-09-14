"""
Flask REST API endpoints.

This module exposes:
- create_app(db): returns a configured Flask app with CORS and routes.
"""

### Imports ###
from __future__ import annotations

import logging
import os
from typing import Optional

from flask import Flask, jsonify, request, abort
from flask_cors import CORS

from core.database import Database


### Factory ###
def create_app(db: Database) -> Flask:
    """
    Build and return a Flask app bound to the given Database.

    :param db: Database helper instance.
    :return: Configured Flask app.
    """
    app = Flask(__name__)
    CORS(
        app,
        resources={r"/*": {"origins": os.getenv("CORS_ORIGINS", "*")}},
        supports_credentials=False,
    )

    @app.get("/latest")
    def latest():
        row = db.get_latest()
        if not row:
            abort(404, description="No data yet")
        return jsonify(row)

    @app.get("/trends")
    def trends():
        hours = int(request.args.get("hours", 24))
        limit = int(request.args.get("limit", 1000))
        rows = db.get_trends(hours=hours, limit=limit)
        return jsonify(rows)

    @app.get("/debug")
    def debug():
        only_errors = request.args.get("only_errors", "false").lower() in ("1", "true", "yes")
        limit = int(request.args.get("limit", 50))
        rows = db.get_debug(only_errors=only_errors, limit=limit)
        return jsonify(rows)

    return app
