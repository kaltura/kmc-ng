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

    transmit(args : {parameters : {}, ksValue : {assignAutomatically : boolean}}):Observable<any> {

        // We use the actual args parameters to optimize performance, it should affect the api since the arguments are created inside the library elements.

        if (args.parameters) {

            args.parameters['clientTag'] = this.config.clientTag;
            args.parameters['format'] = this.config.format;
            args.parameters['apiVersion'] = this.config.apiVersion;

            if (args.ksValue && args.ksValue.assignAutomatically) {
                if (this.config.ks) {
                    args.parameters['ks'] = this.config.ks;
                } else {
                    return Observable.throw({errorCode: 'cannot_invoke_request_without_ks'});
                }
            }

            return this.http.request(this.config.apiUrl,
                {
                    method: 'post',
                    body: JSON.stringify(args.parameters),
                    headers : new Headers(this.config.headers)
                }
            )
            .map(result => result.json());

        }else {
            return Observable.throw({ errorCode : 'missing_request_parameters'});
        }
    }
}