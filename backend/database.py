# database.py
import os, sqlite3
from datetime import datetime

DB_PATH = os.getenv("DB_PATH", "/var/lib/weather/data.db")

def _ensure_dir(path: str) -> None:
    d = os.path.dirname(os.path.abspath(path))
    os.makedirs(d, exist_ok=True)

def ensure_schema(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS packets
    (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        packet_number  INTEGER,
        timestamp      TEXT NOT NULL,        -- ISO8601
        rssi           INTEGER,
        snr            REAL,
        temperature    REAL,
        humidity       REAL,
        pressure       REAL,
        gas_resistance REAL,
        error          TEXT
    );
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS ix_packets_ts ON packets(timestamp);")
    cur.execute("CREATE INDEX IF NOT EXISTS ix_packets_ts_id ON packets(timestamp, id);")
    conn.commit()

def init_db() -> None:
    _ensure_dir(DB_PATH)
    with sqlite3.connect(DB_PATH, timeout=5, check_same_thread=False) as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        ensure_schema(conn)

def connect_ro():
    return sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True, check_same_thread=False)

def query_db(sql: str, params=(), one: bool = False):
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute(sql, params)
        rows = cur.fetchall()
    return (rows[0] if rows else None) if one else rows

def _coerce_iso(ts) -> str:
    # nimmt epoch (int/float) oder ISO-String
    if ts is None:
        return datetime.utcnow().isoformat(timespec="seconds") + "Z"
    if isinstance(ts, (int, float)):
        return datetime.utcfromtimestamp(ts).isoformat(timespec="seconds") + "Z"
    return str(ts)

def save_packet(pkt) -> None:
    """
    Akzeptiert dict oder Objekt mit Attributen:
      packet_number, timestamp, rssi, snr, temperature, humidity, pressure, gas_resistance, error
    """
    # tolerant: funktioniert mit dict oder dataclass
    get = (lambda k: getattr(pkt, k, None)) if not isinstance(pkt, dict) else pkt.get

    with sqlite3.connect(DB_PATH, timeout=5) as conn:
        conn.execute("""
            INSERT INTO packets
            (packet_number, timestamp, rssi, snr, temperature, humidity, pressure, gas_resistance, error)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            get("packet_number"),
            _coerce_iso(get("timestamp")),
            get("rssi"),
            get("snr"),
            get("temperature"),
            get("humidity"),
            get("pressure"),
            get("gas_resistance"),
            get("error"),
        ))
        conn.commit()
