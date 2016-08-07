import { Observable } from 'rxjs'
import { URLSearchParams } from '@angular/http';

import { KalturaRequest } from "./kaltura-request";
import {KalturaAPIClient} from "./kaltura-api-client";

export  class KalturaMultiRequest {

    private kalturaRequests : KalturaRequest<any>[];

    constructor(){
        this.kalturaRequests = [];
    }

    public addRequest(request : KalturaRequest<any>) : void{
        this.kalturaRequests.push(request);
    }

    public execute(client : KalturaAPIClient) : Observable<any>{

        if (this.kalturaRequests.length) {

            const ksValue = { assignAutomatically : true, customKSValue : '' };

            const parameters = {};

            this.kalturaRequests.forEach((request,index) => {

                const requestIdentifier = index+1;

                const requestParameters = Object.assign({
                    service : request.service,
                    action : request.action
                },request.parameters);

                parameters[requestIdentifier] = requestParameters;

                if (request.ksValueGenerator)
                {
                    ksValue.assignAutomatically = false;
                    ksValue.customKSValue = `{${requestIdentifier}:result}`;
                }
            });

            return client.transmit({ parameters,ksValue });

        }else {
            return Observable.throw({errorCode : 'no_requests_provided'});
        }
    }
}