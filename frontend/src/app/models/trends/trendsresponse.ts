import type { TrendsSeriesModel } from "@app/models/trends/trendsseries";

export interface TrendsResponseModel
{
    bucket_seconds: number;
    from: string;
    to: string;
    series: TrendsSeriesModel;
}