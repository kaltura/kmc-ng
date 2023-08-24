import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { KalturaClient } from 'kaltura-ngx-client';

@Injectable()
export class ProfilesStoreService {

    constructor(private _http: HttpClient, private _kalturaServerClient: KalturaClient) {
    }

}
