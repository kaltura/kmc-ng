import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { AppEventsService } from 'app-shared/kmc-shared';
import { serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { PlayersUpdatedEvent } from 'app-shared/kmc-shared/events';
import { KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { StudioV7MainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kStudioV7',
  templateUrl: './studio-v7.component.html',
  styleUrls: ['./studio-v7.component.scss']
})
export class StudioV7Component implements OnInit, OnDestroy {

  public studioUrl = '';
  public iframeHeight = '920px';
  public currentView = 'list';

  constructor(
        private _appEvents: AppEventsService, private logger: KalturaLogger,
        private _appAuthentication: AppAuthentication,
        private _studioV7MainView: StudioV7MainViewService) {
  }

  ngOnInit() {
       if (this._studioV7MainView.viewEntered()) {
           window['kmc'] = {
               'preview_embed': {
                   'updateList': (isPlaylist: boolean) => {
                       this._updatePlayers(isPlaylist);
                   }
               },
               'pid': this._appAuthentication.appUser.partnerId,
               'publisherEnvType': this._appAuthentication.appUser.partnerInfo.publisherEnvironmentType,
               'updateView': (view: string) => {
                   this.currentView = view;
                   this.iframeHeight = view === 'list' ? '920px' : '100vh';
               }
           };
           this.studioUrl = serverConfig.externalApps.studioV7.uri;
       }
  }

  _updatePlayers(isPlaylist): void {
    this._appEvents.publish(new PlayersUpdatedEvent(isPlaylist));
  }

  ngOnDestroy() {
    this.studioUrl = '';
    window['kmc'] = null;
  }
}
