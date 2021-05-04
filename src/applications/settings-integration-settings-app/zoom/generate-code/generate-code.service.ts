import {Injectable} from '@angular/core';
import {KalturaClient, SessionStartAction} from 'kaltura-ngx-client';
import { Observable } from 'rxjs';

@Injectable()
export class GenerateCodeService {

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  public generateCode(): Observable<string> {
    return this._kalturaServerClient.request(new SessionStartAction({secret: '12345'}))
  }
}
