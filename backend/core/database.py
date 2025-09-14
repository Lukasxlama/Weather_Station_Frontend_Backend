"""
SQLite schema + CRUD helpers for the backend.

This module exposes:
- open_db / ensure_schema: connection + schema bootstrap
- insert_packet_with_sensor: upsert-like insert with dedupe (payload_hash)
- get_latest, get_trends, get_debug: query helpers for REST endpoints
"""

### Imports ###
from __future__ import annotations

import hashlib
import sqlite3
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional


### Schema ###
SCHEMA_SQL: str = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS packets (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ts            TEXT    NOT NULL,
  rssi_dbm      INTEGER,
  snr_db        REAL,
  error         INTEGER NOT NULL DEFAULT 0,
  error_type    TEXT,
  raw_hex       TEXT,
  payload_hash  TEXT    NOT NULL,
  inserted_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_packets_payload_hash ON packets(payload_hash);
CREATE INDEX IF NOT EXISTS ix_packets_ts ON packets(ts);

CREATE TABLE IF NOT EXISTS sensor_data (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id     INTEGER NOT NULL,
  temperature_c REAL,
  humidity_pct  REAL,
  pressure_hpa  REAL,
  gas_kohms     REAL,
  FOREIGN KEY (packet_id) REFERENCES packets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_sensor_packet ON sensor_data(packet_id);
"""


### Connection factory ###
def open_db(path: Path) -> sqlite3.Connection:
    """
    Open a SQLite connection configured for WAL and FK checks.

    :param path: Database file path.

    :return: sqlite3.Connection (row_factory = Row).
    """

    path.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(path, check_same_thread=False)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode=WAL")
    con.execute("PRAGMA synchronous=NORMAL")
    con.execute("PRAGMA foreign_keys=ON")

    return con


def ensure_schema(con: sqlite3.Connection) -> None:
    """
    Create tables and indices if they don't exist.

    :param con: Open SQLite connection.

    :return: None.
    """

    con.executescript(SCHEMA_SQL)
    con.commit()


### CRUD helpers ###
class Database:
    """
    Thread-safe DB helper around one shared connection.

    :param con: The underlying sqlite3 connection.
    """

    def __init__(self, con: sqlite3.Connection) -> None:
        self._con = con
        self._lock = threading.Lock()

    @staticmethod
    def sha1(payload: bytes) -> str:
        """
        Return hex SHA1 of bytes payload (used for dedupe).

        :param payload: bytes of the payload.

        :return: hex SHA1 of bytes.
        """

        return hashlib.sha1(payload).hexdigest()

    def insert_packet_with_sensor(self, env: Dict[str, Any], payload_bytes: bytes) -> None:
        """
        Insert one envelope into packets (+ sensor_data if present).
        Idempotent via payload_hash.

        :param env: Envelope dict as published by the middleware.
        :param payload_bytes: Original JSON bytes (for stable hash).

        :return: None.
        """

        payload_hash = self.sha1(payload_bytes)

        ts = env.get("timestamp")
        rssi = env.get("rssi_dbm")
        snr = env.get("snr_db")
        error = 1 if env.get("error") else 0
        error_type = env.get("error_type")
        raw_hex = env.get("raw_hex")
        sensor = env.get("sensor_data") if not env.get("error") else None

        with self._lock, self._con:  # implicit transaction
            self._con.execute(
                """
                INSERT OR IGNORE INTO packets
                  (ts, rssi_dbm, snr_db, error, error_type, raw_hex, payload_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (ts, rssi, snr, error, error_type, raw_hex, payload_hash),
            )

            row = self._con.execute(
                "SELECT id FROM packets WHERE payload_hash = ?",
                (payload_hash,),
            ).fetchone()
            if not row:
                return
            packet_id = row["id"]

            if isinstance(sensor, dict):
                exists = self._con.execute(
                    "SELECT 1 FROM sensor_data WHERE packet_id = ?",
                    (packet_id,),
                ).fetchone()
                if not exists:
                    self._con.execute(
                        """
                        INSERT INTO sensor_data
                          (packet_id, temperature_c, humidity_pct, pressure_hpa, gas_kohms)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (
                            packet_id,
                            sensor.get("temperature_c"),
                            sensor.get("humidity_pct"),
                            sensor.get("pressure_hpa"),
                            sensor.get("gas_kohms"),
                        ),
                    )

    def get_latest(self) -> Optional[Dict[str, Any]]:
        """
        Return latest packet joined with sensor_data (if any).

        :return: Dict row or None if DB empty.
        """

        with self._lock:
            row = self._con.execute(
                """
                SELECT
                  p.ts,
                  p.rssi_dbm,
                  p.snr_db,
                  p.error,
                  p.error_type,
                  s.temperature_c,
                  s.humidity_pct,
                  s.pressure_hpa,
                  s.gas_kohms
                FROM packets p
                LEFT JOIN sensor_data s ON s.packet_id = p.id
                ORDER BY p.ts DESC
                LIMIT 1
                """
            ).fetchone()

        return dict(row) if row else None

    def get_trends(self, hours: int, limit: int) -> List[Dict[str, Any]]:
        """
        Return series for charts.

        :param hours: Lookback window in hours.
        :param limit: Max rows.

        :return: List of dict rows (ordered by ts ASC).
        """

        with self._lock:
            rows = self._con.execute(
                """
                SELECT
                  p.ts,
                  s.temperature_c,
                  s.humidity_pct,
                  s.pressure_hpa,
                  s.gas_kohms,
                  p.rssi_dbm,
                  p.snr_db
                FROM packets p
                LEFT JOIN sensor_data s ON s.packet_id = p.id
                WHERE p.ts >= datetime('now', ?)
                ORDER BY p.ts ASC
                LIMIT ?
                """,
                (f"-{hours} hours", limit),
            ).fetchall()

        return [dict(r) for r in rows]

    def get_debug(self, only_errors: bool, limit: int) -> List[Dict[str, Any]]:
        """
        Return recent packets for diagnostics.

        :param only_errors: If True, filter by error=1.
        :param limit: Max rows.

        :return: List of dict rows (ordered by ts DESC).
        """

        with self._lock:
            if only_errors:
                rows = self._con.execute(
                    """
                    SELECT * FROM packets
                    WHERE error = 1
                    ORDER BY ts DESC
                    LIMIT ?
                    """,
                    (limit,),
                ).fetchall()
            else:
                rows = self._con.execute(
                    """
                    SELECT * FROM packets
                    ORDER BY ts DESC
                    LIMIT ?
                    """,
                    (limit,),
                ).fetchall()

        return [dict(r) for r in rows]
