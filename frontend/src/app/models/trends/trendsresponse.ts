import { TrendsSeries } from "./trendsseries";

export interface TrendsResponse
{
    bucket_seconds: number;
    from: string;
    to: string;
    series: TrendsSeries;
}