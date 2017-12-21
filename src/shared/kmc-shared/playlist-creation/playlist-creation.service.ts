import { Injectable, OnDestroy } from '@angular/core';
import { AppEventsService } from 'app-shared/kmc-shared';
import { CreateNewPlaylistEvent, CreateNewPlaylistEventArgs } from 'app-shared/kmc-shared/playlist-creation';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { routingAliases } from 'app-shared/app-routing-aliases';

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
          this._router.navigate(routingAliases.content.newPlaylist(tabName));
        });
    } else {
      console.warn('Service was already initialized!');
    }
  }

  public getNewPlaylistData(): CreateNewPlaylistEventArgs {
    return this._newPlaylistData;
  }

  public clearNewPlaylistData(): void {
    this._newPlaylistData = null;
  }
}
