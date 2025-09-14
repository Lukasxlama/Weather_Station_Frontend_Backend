/**
 * Represents raw sensor readings.
 */
export interface SensorDataModel
{
    /** Temperature in °C */
    temperature: number;

    /** Humidity in % */
    humidity: number;

    /** Pressure in hPa */
    pressure: number;

    /** Gas resistance in Ω */
    gas_resistance: number;
    
    /** Unix timestamp (milliseconds since epoch) of the sensor reading */
    timestamp: string;
}