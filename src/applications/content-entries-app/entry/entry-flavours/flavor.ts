import { KalturaFlavorAssetWithParams } from 'kaltura-ngx-client/api/types/KalturaFlavorAssetWithParams';
import { KalturaFlavorAssetStatus } from 'kaltura-ngx-client/api/types/KalturaFlavorAssetStatus';

export interface Flavor extends KalturaFlavorAssetWithParams{
    name: string,
    id: string,
    paramsId: number,
    isSource: boolean,
    isWeb: boolean,
    isWidevine: boolean,
    format: string,
    codec: string,
    bitrate: string,
    size: string,
    dimensions: string,
    status: KalturaFlavorAssetStatus,
    statusLabel: string,
    statusTooltip: string,
    tags: string,
    drm: any,
    uploadFileId: string
}
