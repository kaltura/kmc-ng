import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as R from 'ramda';

import { KalturaRequest } from "./kaltura-request";
import { KMCConfig } from "../core/kmc-config.service.ts";
import { KalturaAPIConfig } from "./kaltura-api-config";
import { KalturaAPIClient } from "./kaltura-api-client";

@Injectable()
export class BaseEntryService {

    constructor(private kalturaAPIClient : KalturaAPIClient, private kmcConfig : KMCConfig, private kalturaAPIConfig : KalturaAPIConfig){
    }

    list(search: string = '', filter: any = {}, responseProfile: any = {}, pageSize: number = 30, pageIndex: number = 1): Observable<any> {

        const parameters :any = {
          pager: {
            objectType: "KalturaFilterPager",
            pageSize: pageSize,
            pageIndex: pageIndex
          },
          responseProfile: Object.assign({}, responseProfile),
          filter: Object.assign({}, filter)
        };

        if (search.length){
          Object.assign(parameters.filter, {freeText: search});
        }

        const request = new KalturaRequest('baseEntry', 'list', parameters);

        return request.execute(this.kalturaAPIClient)
          .map(result => result.objects)
    }

}
