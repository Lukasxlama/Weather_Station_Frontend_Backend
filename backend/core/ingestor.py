"""
MQTT ingestion: subscribe to {base_topic}/json and write into SQLite.

This module exposes:
- start_ingestor(db, env): starts a daemon thread running the MQTT loop
"""

### Imports ###
from __future__ import annotations

import json
import logging
import threading
from typing import Optional

import paho.mqtt.client as mqtt

from core.database import Database


### Functions ###
def start_ingestor(
    db: Database,
    host: str,
    port: int,
    base_topic: str,
    qos: int = 1,
    user: Optional[str] = None,
    password: Optional[str] = None,
    keepalive: int = 60,
) -> threading.Thread:
    """
    Start the MQTT client in a background daemon thread.

    :param db: Database helper instance.
    :param host: MQTT host.
    :param port: MQTT port.
    :param base_topic: Base topic (subscribes to {base}/json).
    :param qos: MQTT QoS for subscription.
    :param user: Optional username.
    :param password: Optional password.
    :param keepalive: Keepalive seconds.

    :return: Started Thread (daemon=True).
    """

    log = logging.getLogger("ingestor")
    topic = f"{base_topic.rstrip('/')}/json"

    client = mqtt.Client(protocol=mqtt.MQTTv311)

    # paho-mqtt >= 2 supports username_pw_set the same way
    if user:
        client.username_pw_set(user, password=password)

    client.enable_logger(logging.getLogger("mqtt"))

    def on_connect(c: mqtt.Client, _ud, _flags, rc, properties=None):
        if rc == 0:
            c.subscribe(topic, qos=qos)
            log.info("MQTT connected. Subscribed to %s (qos=%d).", topic, qos)
        else:
            log.warning("MQTT connect failed rc=%s", rc)

    def on_message(_c, _ud, msg: mqtt.MQTTMessage):
        try:
            payload = msg.payload or b""
            if not payload:
                return
            env = json.loads(payload.decode("utf-8"))
            db.insert_packet_with_sensor(env, payload)
        except Exception as exc:
            log.exception("Failed to process MQTT message: %s", exc)

    client.on_connect = on_connect
    client.on_message = on_message

    def _loop():
        try:
            log.info("Connecting MQTT %s:%d ...", host, port)
            client.connect(host, port, keepalive=keepalive)
            client.loop_forever(retry_first_connection=True)
        except Exception as exc:
            log.exception("MQTT loop terminated: %s", exc)

    th = threading.Thread(target=_loop, name="mqtt-ingestor", daemon=True)
    th.start()
    return th
