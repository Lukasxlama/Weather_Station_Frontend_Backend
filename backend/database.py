import sqlite3
from models import ReceivedPacket

def init_db():
    with sqlite3.connect("data.db") as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        
        conn.execute("""
            CREATE TABLE IF NOT EXISTS packets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                temperature REAL,
                humidity REAL,
                pressure REAL,
                gas_resistance REAL,
                rssi INTEGER,
                snr REAL,
                error TEXT
            )
        """)

        # ---- Indizes anlegen ----
        # Für /latest: neuestes Paket per timestamp holen
        conn.execute("CREATE INDEX IF NOT EXISTS idx_packets_ts ON packets(timestamp);")
        # Stabil bei gleichen Timestamps: sekundäre Sortierung über id
        conn.execute("CREATE INDEX IF NOT EXISTS idx_packets_ts_id ON packets(timestamp, id);")
        # (Optional) Häufige Suchen per id
        conn.execute("CREATE INDEX IF NOT EXISTS idx_packets_id ON packets(id);")
        # Für /trends
        conn.execute("CREATE INDEX IF NOT EXISTS idx_packets_ts ON packets(timestamp);")
        # --------------------------------
        
def save_packet(packet: ReceivedPacket):
    if not packet.sensor_data:
        return
    
    with sqlite3.connect("data.db") as conn:
        conn.execute("""
            INSERT INTO packets (
                timestamp, temperature, humidity, pressure, gas_resistance, rssi, snr, error
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            packet.timestamp.isoformat(),
            packet.sensor_data.temperature,
            packet.sensor_data.humidity,
            packet.sensor_data.pressure,
            packet.sensor_data.gas_resistance,
            packet.rssi,
            packet.snr,
            packet.error
        ))
