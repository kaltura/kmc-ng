import {Injectable} from '@angular/core';
import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {KalturaMultiRequest} from 'kaltura-typescript-client';
import {Observable} from 'rxjs/Observable';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

@Injectable()
export class SettingsMyUserSettingsService {
  constructor(
    private _kalturaServerClient: KalturaClient
  ) {}

}
