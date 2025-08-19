export interface TrendsSeries
{
    temperature: { t: string; v: number }[];
    humidity: { t: string; v: number }[];
    pressure: { t: string; v: number }[];
    gas_resistance: { t: string; v: number }[];
}