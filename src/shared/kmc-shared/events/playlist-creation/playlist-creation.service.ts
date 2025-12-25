import { Injectable, OnDestroy } from '@angular/core';
import { AppEventsService } from 'shared/kmc-shared/app-events';
import { CreateNewPlaylistEvent, CreateNewPlaylistEventArgs } from './create-new-playlist.event';
import { ISubscription } from 'rxjs/Subscription';
import { ContentPlaylistViewSections, ContentPlaylistViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
import { KalturaEntryApplication, KalturaPlaylist } from 'kaltura-ngx-client';
import { KalturaPlaylistType } from 'kaltura-ngx-client';
import {globalConfig} from 'config/global';

@Injectable()
export class PlaylistCreationService implements OnDestroy {
  private _creationSubscription: ISubscription;
  private _newPlaylistData: CreateNewPlaylistEventArgs;

  constructor(private _appEvents: AppEventsService,
              private _contentPlaylistViewService: ContentPlaylistViewService) {
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
        .subscribe(({ data, section }) => {
          this._newPlaylistData = data;
            const playlist = new KalturaPlaylist({ 
              playlistType: data.type,
              application: KalturaEntryApplication.kmc,
              applicationVersion: globalConfig.client.appVersion
            });
            (<any>playlist).id = 'new';
            if (!section) {
              section = playlist.playlistType === KalturaPlaylistType.staticList
                  ? ContentPlaylistViewSections.Content
                  : ContentPlaylistViewSections.ContentRuleBased;
            }
            this._contentPlaylistViewService.open({ playlist, section });
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
