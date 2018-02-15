import { Injectable, OnDestroy } from '@angular/core';
import { AppEventsService } from 'shared/kmc-shared/app-events';
import { CreateNewPlaylistEvent, CreateNewPlaylistEventArgs } from './create-new-playlist.event';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';

@Injectable()
export class PlaylistCreationService implements OnDestroy {
  private _creationSubscription: ISubscription;
  private _newPlaylistData: CreateNewPlaylistEventArgs;

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
      this._creationSubscription = this._appEvents.event(CreateNewPlaylistEvent)
        .subscribe(({ data, tabName = 'content' }) => {
          this._newPlaylistData = data;
          this._router.navigate([`/content/playlists/playlist/new/${tabName}`])
            .catch(() => {
              this._newPlaylistData = null;
            });
        });
    } else {
      console.warn('Service was already initialized!');
    }
  }

  public popNewPlaylistData(): CreateNewPlaylistEventArgs {
    const newPlaylistData = this._newPlaylistData;
    this._newPlaylistData = null;
    return newPlaylistData;
  }
}
