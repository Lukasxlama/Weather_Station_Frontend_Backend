import { StationImage } from "./stationimage";

export interface StationManifest
{
    generatedAt: string;
    images: StationImage[];
}