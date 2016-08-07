import { Injectable,ReflectiveInjector } from '@angular/core';
import { Http, URLSearchParams, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { UserService } from './user-service';
import {KMCConfig} from "../core/kmc-config.service";
import {KalturaMultiRequest} from "./kaltura-multi-request";
import {KalturaRequest} from "./kaltura-request";
import {KalturaAPIConfig} from "./kaltura-api-config";



@Injectable()
export class KalturaAPIClient {

    constructor(private http:Http, public config:KalturaAPIConfig) {
        if (!config) {
            throw new Error("missing configuration argument");
        }
    }

    transmit(args : {parameters : {}, ksValue : {assignAutomatically : boolean, customKSValue? : string}}):Observable<any> {

        // We use the actual args parameters to optimize performance, it should affect the api since the arguments are created inside the library elements.

        if (args.parameters) {
            if (args.ksValue && args.ksValue.assignAutomatically) {
                if (this.config.ks) {
                    args.parameters['ks'] = this.config.ks;
                } else {
                    return Observable.throw({errorCode: 'cannot_invoke_request_without_ks'});
                }
            }else if (args.ksValue && args.ksValue.customKSValue)
            {
                args.parameters['ks'] = args.ksValue.customKSValue
            }

            // TODO [es] get from args - search: 'service=multirequest&action=null&format=1',
            return this.http.request(this.config.apiUrl ,
                {
                    method: 'post',
                    search: 'service=multirequest&action=null&format=1',
                    body: JSON.stringify(args.parameters),
                    headers: new Headers({
                        contentType: 'application/json',
                        dataType: 'json'
                    })
                }
            )
            .map(result => result.json());

        }else {
            return Observable.throw({ errorCode : 'missing_request_parameters'});
        }
    }
}