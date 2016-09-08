import { Injectable } from '@angular/core';
import { PostLoadAdapter } from '@kaltura/kmcng-core';
import { KalturaApiModule } from '@kaltura/kaltura-api';
import { KalturaAPIConfig } from '@kaltura/kaltura-api';


@Injectable()
export class KalturaAPIConfigAdapter implements PostLoadAdapter
{
    constructor(private kalturaAPIConfig : KalturaAPIConfig){

    }
    execute(config : any) : void{
        // TODO [kmc] handle error scenarios (missing core.kaltura)
        const { apiUrl, apiVersion }  = config.core.kaltura;
        const kalturaAPIConfig  = this.kalturaAPIConfig;
        kalturaAPIConfig.apiUrl = apiUrl;
        kalturaAPIConfig.apiVersion = apiVersion;
    }
}