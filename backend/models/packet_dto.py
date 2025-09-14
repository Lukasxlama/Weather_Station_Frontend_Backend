"""
Lightweight DTOs used by the backend.

This module exposes:
- PacketDTO: envelope fields stored in the packets table.
"""

### Imports ###
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


### Dataclasses ###
@dataclass(frozen=True)
class PacketDTO:
    """
    Packet metadata as published by the middleware.

    :param timestamp: ISO 8601 timestamp string.
    :param rssi_dbm: RSSI in dBm (approx.).
    :param snr_db: SNR in dB (fractional allowed).
    :param error: True if parsing failed on the Pi; False otherwise.
    :param error_type: Optional error type name.
    :param raw_hex: Raw hex payload if error=True; otherwise None.
    """

    timestamp: str
    rssi_dbm: int
    snr_db: float
    error: bool
    error_type: Optional[str]
    raw_hex: Optional[str]
