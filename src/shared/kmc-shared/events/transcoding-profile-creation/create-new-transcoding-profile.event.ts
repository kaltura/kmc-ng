import { AppEvent } from 'shared/kmc-shared/app-events/app-event';
import { KalturaConversionProfile } from 'kaltura-ngx-client';

export interface CreateNewTranscodingProfileEventArgs {
  profile: KalturaConversionProfile;
}

export class CreateNewTranscodingProfileEvent extends AppEvent {
  constructor(public data: CreateNewTranscodingProfileEventArgs) {
    super('CreateNewTranscodingProfile');
  }
}
