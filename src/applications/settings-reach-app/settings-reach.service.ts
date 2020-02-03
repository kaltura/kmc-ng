import { Injectable } from '@angular/core';
import { KalturaClient } from 'kaltura-ngx-client';

@Injectable()
export class SettingsReachService {

  constructor(private _kalturaServerClient: KalturaClient) {
  }
}
