import { Observable } from 'rxjs'
import { URLSearchParams } from '@angular/http';

import { KalturaRequest } from "./kaltura-request";
import {KalturaAPIClient} from "./kaltura-api-client";

import * as R from 'ramda';

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

            const ksValue = { assignAutomatically : true};

            const parameters = {
                'service' : 'multirequest'
            };

            var ksValueGeneratorIndex = R.findIndex(R.propEq('ksValueGenerator',true))(this.kalturaRequests);

            if (ksValueGeneratorIndex > -1)
            {
                ksValue.assignAutomatically = false;
            }

            this.kalturaRequests.forEach((request,index) => {

                const requestIdentifier = index + 1;

                const requestParameters = Object.assign({
                    service : request.service,
                    action : request.action
                },request.parameters);

                if (ksValueGeneratorIndex > -1 && ksValueGeneratorIndex !== index){
                    requestParameters['ks'] = `{${ksValueGeneratorIndex+1}:result}`;
                }

                parameters[requestIdentifier] = requestParameters;
            });

            return client.transmit({ parameters,ksValue });

        }else {
            return Observable.throw({errorCode : 'no_requests_provided'});
        }
    }
}