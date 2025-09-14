import type { SensorDataModel } from "@app/models/shared/sensordata";

/**
 * Represents a packet received from the MQTT broker, optionally containing sensor data.
 */
export interface ReceivedPacketModel
{
    /** Sequential packet number */
    packet_number: number;

    /** ISO-8601 string of when the packet was received */
    timestamp: string;

    /** Received signal strength indicator in dBm */
    rssi: number;

    /** Signal-to-noise ratio */
    snr: number;

    /** Nested sensor data (if available) */
    sensor_data: SensorDataModel;

    /** Error message string, if any */
    error?: string;
}