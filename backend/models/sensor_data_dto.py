"""
Lightweight DTOs used by the backend.

This module exposes:
- SensorDataDTO: canonical sensor fields with explicit units.
"""

### Imports ###
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Any


### Dataclasses ###
@dataclass(frozen=True)
class SensorDataDTO:
    """
    Canonical BME680 sensor reading (explicit units).

    :param temperature_c: Ambient temperature in degrees Celsius.
    :param humidity_pct: Relative humidity in percent (0..100).
    :param pressure_hpa: Atmospheric pressure in hectopascals.
    :param gas_kohms: Gas resistance in kilo-ohms (BME680 gas sensor).
    """

    temperature_c: float
    humidity_pct: float
    pressure_hpa: float
    gas_kohms: float

    @staticmethod
    def from_dict(src: Dict[str, Any]) -> "SensorDataDTO":
        """
        Build from a dict (expects canonical keys).

        :param src: Dict with keys temperature_c, humidity_pct, pressure_hpa, gas_kohms.

        :return: SensorDataDTO instance.
        """

        return SensorDataDTO(
            temperature_c=float(src["temperature_c"]),
            humidity_pct=float(src["humidity_pct"]),
            pressure_hpa=float(src["pressure_hpa"]),
            gas_kohms=float(src["gas_kohms"]),
        )
