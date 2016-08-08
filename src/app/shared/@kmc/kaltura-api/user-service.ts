import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, URLSearchParams } from '@angular/http';
import { KalturaMultiRequest } from "./kaltura-multi-request";
import { KalturaAPIClient } from "./kaltura-api-client";
import {KalturaRequest} from "./kaltura-request";


export class UserService {

    constructor(){
        throw new Error('This class should not be initialized (you should use its static functions to create new requests)');
    }

    static getByLoginId(loginId : string, options? : { ks? : string }) :  KalturaRequest<string>
    {
        const parameters : any = {
            loginId : loginId
        };

        if (options && options.ks) {
            parameters.ks = options.ks;
        }

        return new KalturaRequest<string>('user','getByLoginId',parameters);
    }

    static loginByLoginId(loginId :string, password : string, options? : { expiry? : number | string, privileges? : string} ) : KalturaRequest<string>
    {
        const parameters : any = {
            loginId : loginId,
            password : password,
            partnerId : null
        };

        if (options && options.expiry) {
            parameters.expiry = options.expiry;
        }

        if (options && options.privileges) {
            parameters.privileges = options.privileges;
        }

        return new KalturaRequest<string>('user','loginByLoginId', parameters, { ksValueGenerator : true });
    }
}