import { Injectable } from '@angular/core';
import { KalturaClient } from 'kaltura-ngx-client';

@Injectable()
export class SettingsTranscodingSettingsService {

  constructor(private _kalturaServerClient: KalturaClient) {
  }
}
