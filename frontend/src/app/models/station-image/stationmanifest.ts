import type { StationImageModel } from "@app/models/station-image/stationimage";

export interface StationManifestModel
{
    generatedAt: string;
    images: StationImageModel[];
}