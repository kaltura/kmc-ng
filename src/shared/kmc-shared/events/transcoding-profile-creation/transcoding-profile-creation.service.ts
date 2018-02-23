import { Injectable, OnDestroy } from '@angular/core';
import { AppEventsService } from 'shared/kmc-shared/app-events';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { CreateNewTranscodingProfileEvent, CreateNewTranscodingProfileEventArgs } from './create-new-transcoding-profile.event';

@Injectable()
export class TranscodingProfileCreationService implements OnDestroy {
  private _creationSubscription: ISubscription;
  private _newProfileData: CreateNewTranscodingProfileEventArgs;

  constructor(private _appEvents: AppEventsService, private _router: Router) {
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
          this._newProfileData = data;
          this._router.navigate([`/settings/transcoding/profile/new/flavors`])
            .catch(() => {
              this._newProfileData = null;
            });
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
