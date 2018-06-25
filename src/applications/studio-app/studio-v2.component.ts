import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import {AppEventsService} from 'app-shared/kmc-shared';
import {getKalturaServerUri, serverConfig} from 'config/server';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import { PlayersUpdatedEvent } from 'app-shared/kmc-shared/events';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { StudioV3MainViewService, StudioV2MainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kStudioV2',
  templateUrl: './studio-v2.component.html',
  styleUrls: ['./studio-v2.component.scss']
})
export class StudioV2Component implements OnInit, AfterViewInit, OnDestroy {

    public studioUrl = '';

    constructor(
                private appAuthentication: AppAuthentication,
                private _appEvents: AppEventsService, private logger: KalturaLogger,
                private browserService: BrowserService,
                private _studioV2MainView: StudioV2MainViewService) {
    }

    ngOnInit() {
        if (this._studioV2MainView.viewEntered()) {
            window['kmc'] = {
                'preview_embed': {
                    'updateList': (isPlaylist: boolean) => {
                        this._updatePlayers(isPlaylist);
                    }
                },
                'vars': {
                    'ks': this.appAuthentication.appUser.ks,
                    'api_url': getKalturaServerUri(),
                    'studio': {
                        'config': {
                            'name': 'Video Studio V2',
                            'tags': 'studio_v2',
                            'html5_version': serverConfig.externalApps.studioV2.html5_version,
                            'html5lib': serverConfig.externalApps.studioV2.html5lib
                        },
                        'showFlashStudio': false,
                        'showStudioV3': false,
                    },
                    'functions': {}
                }
            };
            this.studioUrl = serverConfig.externalApps.studioV2.uri;
        }
    }

    ngAfterViewInit() {
    }

    _updatePlayers(isPlaylist): void {
        this._appEvents.publish(new PlayersUpdatedEvent(isPlaylist));
    }

    ngOnDestroy() {
        this.studioUrl = '';
        window['kmc'] = null;
    }
}
