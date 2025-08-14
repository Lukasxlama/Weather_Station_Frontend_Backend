import os
import re
import time
import sqlite3
import unicodedata
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import paho.mqtt.client as mqtt

from models import ReceivedPacket
from database import init_db, save_packet

# === Application Setup ===
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
init_db()  # ensure database/tables exist

# === MQTT Ingestion ===
MQTT_HOST     = os.getenv("MQTT_HOST", "10.0.0.30")
MQTT_PORT     = int(os.getenv("MQTT_PORT", "1883"))
MQTT_USER     = os.getenv("MQTT_USER", "AnimeArchive")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "AnimeArchive")
MQTT_TOPIC    = os.getenv("MQTT_TOPIC", "weather_station/bme680")

def on_message(client, userdata, msg):
    """Callback: parse incoming MQTT JSON and persist via save_packet()."""
    try:
        packet = ReceivedPacket.from_json(msg.payload.decode("utf-8"))
        save_packet(packet)
    except Exception as e:
        # In production: use proper logging
        print(f"Error processing MQTT packet: {e}")

mqtt_client = mqtt.Client(protocol=mqtt.MQTTv311)
if MQTT_USER and MQTT_PASSWORD:
    mqtt_client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_HOST, MQTT_PORT, 60)
mqtt_client.subscribe(MQTT_TOPIC)
mqtt_client.loop_start()

# === Helper: execute a SQL query against data.db (not used by /debug/sql, kept for completeness) ===
def query_db(sql, params=(), one=False):
    """
    Open a connection to data.db, execute the given SQL with parameters,
    fetch all or one, then close the connection.
    """
    with sqlite3.connect("data.db") as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute(sql, params)
        rows = cur.fetchall()
    return (rows[0] if rows else None) if one else rows

# === SQL utils ===
def strip_sql_comments_and_strings(sql: str) -> str:
    """
    Entfernt SQL-Kommentare (-- ... und /* ... */)
    und ersetzt String-Literale ('...' oder "...") durch Leerzeichen,
    damit sie nicht auf Keyword-Checks wirken.
    """
    # Entferne -- Kommentare bis zum Zeilenende
    no_line_comments = re.sub(r'--.*?(\r\n|\r|\n|$)', ' ', sql)
    # Entferne /* ... */ Kommentare (auch über mehrere Zeilen)
    no_block_comments = re.sub(r'/\*.*?\*/', ' ', no_line_comments, flags=re.S)
    # Ersetze String-Literale in '...' oder "..." durch Leerzeichen
    no_strings = re.sub(r"('([^']|'')*'|\"([^\"]|\"\")*\")", ' ', no_block_comments)
    # Mehrfache Whitespaces auf einen reduzieren
    cleaned = re.sub(r'\s+', ' ', no_strings)
    return cleaned.strip()

# === Latest API ===
@app.route("/latest", methods=["GET"])
def latest():
    """
    Gibt den neuesten Datensatz als ReceivedPacket-kompatibles JSON zurück.
    """
    row = query_db(
        """
        SELECT *
        FROM packets
        ORDER BY timestamp DESC, id DESC
        LIMIT 1
        """,
        one=True
    )

    if not row:
        return jsonify({"error": "No data available"}), 404

    # in dict umwandeln, damit .get() funktioniert
    row = dict(row)

    packet = {
        "packet_number": row["id"],
        "timestamp": row["timestamp"],
        "rssi": row["rssi"],
        "snr": row["snr"],
        "sensor_data": {
            "temperature": row["temperature"],
            "humidity": row["humidity"],
            "pressure": row["pressure"],
            "gas_resistance": row["gas_resistance"],
            "timestamp": row["timestamp"]  # ggf. separaten Sensor-Timestamp
        },
        "error": row.get("error")
    }

    return jsonify(packet)

# === Debug SQL API ===
@app.route("/debug/sql", methods=["POST"])
def debug_sql():
    """
    Accepts JSON { "sql": "<SELECT statement>" }.
    - Enforces single SELECT-only
    - Read-only SQLite connection
    - Server-side row cap (max 999 rows), independent of user SQL
    - Short execution timeout via progress handler
    """
    payload = request.get_json(silent=True) or {}
    raw_sql = (payload.get("sql") or "").strip().rstrip(";")
    if not raw_sql:
        abort(400, description="Missing 'sql'")

    # Unicode normalisieren (verhindert Homoglyphen-Tricks)
    raw_sql = unicodedata.normalize("NFKC", raw_sql)

    # Für Prüfungen: Strings/Kommentare entfernen
    stripped = strip_sql_comments_and_strings(raw_sql)

    # Optional: Klammer-SELECTs erlauben (z. B. "(SELECT 1)")
    while stripped.startswith("(") and stripped.endswith(")"):
        stripped = stripped[1:-1].strip()

    # Genau ein Statement (kein weiteres ';' außerhalb von Strings/Kommentaren)
    if ";" in stripped:
        abort(400, description="Only a single SELECT statement is allowed")

    # Muss mit SELECT beginnen (nach Stripping)
    if not stripped.lower().startswith("select"):
        abort(400, description="Only SELECT statements are allowed")

    # Kleine Eingabe-Guards (DoS)
    if len(raw_sql) > 10000:
        abort(400, description="SQL too long")
    if raw_sql.count("\n") > 500:
        abort(400, description="Too many lines")

    # Read-only Verbindung + Sicherheits-PRAGMAs
    con = sqlite3.connect("file:data.db?mode=ro", uri=True, check_same_thread=False)
    con.enable_load_extension(False)
    con.execute("PRAGMA query_only = ON;")
    con.execute("PRAGMA busy_timeout = 2000;")  # weniger 'database is locked'

    # Kurzer Timeout über Progress-Handler (z. B. 500ms)
    timeout_ms = 500
    deadline = time.time() + (timeout_ms / 1000.0)

    def stopper():
        return 1 if time.time() > deadline else 0

    con.set_progress_handler(stopper, 1000)

    try:
        cur = con.cursor()
        cur.execute(raw_sql)

        # Spaltennamen ziehen (kann None sein, falls kein Resultset)
        cols = [d[0] for d in cur.description] if cur.description else []

        # Harte Row-Cap (serverseitig, unabhängig vom SQL der Nutzer)
        rows = cur.fetchmany(999)

        # rows -> JSON-serialisierbar
        result = [dict(zip(cols, r)) for r in rows]
        return jsonify(result)

    except sqlite3.OperationalError as e:
        # Progress-Handler-Abbruch -> Timeout
        if "interrupted" in str(e).lower():
            abort(408, description="Query timeout")
        abort(400, description="Query execution error")
    except sqlite3.Error:
        abort(400, description="Query execution error")
    finally:
        con.set_progress_handler(None, 0)
        con.close()

# === Application Entry Point ===
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
