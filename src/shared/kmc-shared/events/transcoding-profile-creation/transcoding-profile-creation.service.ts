import { Injectable, OnDestroy } from '@angular/core';
import { AppEventsService } from 'shared/kmc-shared/app-events';
import { ISubscription } from 'rxjs/Subscription';
import { CreateNewTranscodingProfileEvent, CreateNewTranscodingProfileEventArgs } from './create-new-transcoding-profile.event';
import {
    SettingsTranscodingProfileViewSections,
    SettingsTranscodingProfileViewService
} from 'app-shared/kmc-shared/kmc-views/details-views';
import { BrowserService } from 'app-shared/kmc-shell';

@Injectable()
export class TranscodingProfileCreationService implements OnDestroy {
  private _creationSubscription: ISubscription;
  private _newProfileData: CreateNewTranscodingProfileEventArgs;

  constructor(private _appEvents: AppEventsService,
              private _browserService: BrowserService,
              private _settingsTranscodingProfileViewService: SettingsTranscodingProfileViewService) {
  }

  ngOnDestroy() {
    if (this._creationSubscription) {
      this._creationSubscription.unsubscribe();
      this._creationSubscription = null;
    }
  }

  public init(): void {
    if (!this._creationSubscription) {
      this._creationSubscription = this._appEvents.event(CreateNewTranscodingProfileEvent)
        .subscribe(({ data }) => {
            const profile = data.profile;
            this._newProfileData = data;
            (<any>profile).id = 'new';
            this._settingsTranscodingProfileViewService.open({ profile, section: SettingsTranscodingProfileViewSections.Flavors });
        });
    } else {
      console.warn('Service was already initialized!');
    }
  }

  public popNewProfileData(): CreateNewTranscodingProfileEventArgs {
    const newProfileData = this._newProfileData;
    this._newProfileData = null;
    return newProfileData;
  }
}
