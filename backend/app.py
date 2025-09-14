"""
Single entrypoint that wires DB, MQTT ingestor, and Flask API.

Environment:
  DB_PATH=./data/weather.db

  MQTT_HOST=localhost
  MQTT_PORT=1883
  MQTT_BASE_TOPIC=weather_station
  MQTT_QOS=1
  MQTT_USER=
  MQTT_PASSWORD=
  MQTT_KEEPALIVE=60

  HTTP_HOST=0.0.0.0
  HTTP_PORT=8080
  CORS_ORIGINS=*

Run:
  Local:     python app.py
  Docker:    gunicorn -w 1 -k gthread --threads 4 --timeout 60 -b 0.0.0.0:5000 app:app
"""

from __future__ import annotations

import logging
import os
import signal
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask

from core.database import open_db, ensure_schema, Database
from core.ingestor import start_ingestor
from core.flask_api import create_app

# Load env (works for local + Docker)
load_dotenv()

# --- Config ---
db_path = Path(os.getenv("DB_PATH", "data/weather.db"))

mqtt_host = os.getenv("MQTT_HOST", "localhost")
mqtt_port = int(os.getenv("MQTT_PORT", "1883"))
mqtt_base = os.getenv("MQTT_BASE_TOPIC", "weather_station")
mqtt_qos = int(os.getenv("MQTT_QOS", "1"))
mqtt_user = os.getenv("MQTT_USER") or None
mqtt_pass = os.getenv("MQTT_PASSWORD") or None
mqtt_keepalive = int(os.getenv("MQTT_KEEPALIVE", "60"))

# --- Logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
log = logging.getLogger("backend")

# --- DB ---
con = open_db(db_path)
ensure_schema(con)
db = Database(con)

# --- MQTT ingest (daemon thread) ---
th = start_ingestor(
    db=db,
    host=mqtt_host,
    port=mqtt_port,
    base_topic=mqtt_base,
    qos=mqtt_qos,
    user=mqtt_user,
    password=mqtt_pass,
    keepalive=mqtt_keepalive,
)

# --- Flask App ---
app: Flask = create_app(db)


def _shutdown(*_a):
    try:
        con.close()
    except Exception:
        pass
    os._exit(0)


signal.signal(signal.SIGINT, _shutdown)
signal.signal(signal.SIGTERM, _shutdown)

# Run only if started directly (not in Gunicorn)
if __name__ == "__main__":
    log.info("Starting Flask dev server at %s:%d", "0.0.0.0", 5000)
    app.run(host="0.0.0.0", port=5000, debug=False)
