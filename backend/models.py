from dataclasses import dataclass
from typing import Optional
from datetime import datetime
import json

@dataclass
class SensorData:
    temperature: float
    humidity: float
    pressure: float
    gas_resistance: float
    timestamp: int

    @classmethod
    def from_dict(cls, data: dict) -> 'SensorData':
        return cls(
            temperature=float(data['temperature']),
            humidity=float(data['humidity']),
            pressure=float(data['pressure']),
            gas_resistance=float(data['gas_resistance']),
            timestamp=int(data['timestamp'])
        )

    def to_dict(self):
        return {
            "temperature": self.temperature,
            "humidity": self.humidity,
            "pressure": self.pressure,
            "gas_resistance": self.gas_resistance,
            "timestamp": self.timestamp
        }

@dataclass
class ReceivedPacket:
    packet_number: int
    timestamp: datetime
    rssi: int
    snr: float
    sensor_data: Optional[SensorData] = None
    error: Optional[str] = None

    @classmethod
    def from_json(cls, json_str: str) -> 'ReceivedPacket':
        data = json.loads(json_str)
        sensor_data = SensorData.from_dict(data['sensor_data']) if data['sensor_data'] else None
        return cls(
            packet_number=data['packet_number'],
            timestamp=datetime.fromisoformat(data['timestamp']),
            rssi=data['rssi'],
            snr=data['snr'],
            sensor_data=sensor_data,
            error=data.get('error')
        )
