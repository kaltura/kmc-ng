import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import {AppEventsService} from 'app-shared/kmc-shared';
import { buildCDNUrl, getKalturaServerUri, getUriOrigin, serverConfig } from 'config/server';
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
    @ViewChild('studioFrame') studioFrame: ElementRef;
    private _windowEventListener = null;
    private _studioOrigin: string = null;

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
                    'api_url': getKalturaServerUri(),
                    'studio': {
                        'config': {
                            'name': 'Video Studio V2',
                            'tags': 'studio_v2',
                            'html5_version': serverConfig.externalApps.studioV2.html5_version,
                            'html5lib': buildCDNUrl(serverConfig.externalApps.studioV2.html5lib)
                        },
                        'showFlashStudio': false,
                        'showStudioV3': false,
                    },
                    'functions': {}
                }
            };
            this.studioUrl = `${serverConfig.externalApps.studioV2.uri}?rnd=${Math.random()}`;
            this._studioOrigin = getUriOrigin(serverConfig.externalApps.studioV2.uri);

            // the studio requests its session over postMessage - send it only to the studio frame we created, on its origin
            this._windowEventListener = (e: MessageEvent) => {
                if (!this._studioOrigin || e.origin !== this._studioOrigin) {
                    return;
                }
                if (!this.studioFrame || e.source !== this.studioFrame.nativeElement.contentWindow) {
                    return;
                }
                if (e.data && e.data.messageType === 'studioInit') {
                    this._sendMessageToStudio({
                        'messageType': 'init',
                        'payload': { 'ks': this.appAuthentication.appUser.ks }
                    });
                }
            };
            window.addEventListener('message', this._windowEventListener);
        }
    }

    private _sendMessageToStudio(message: any): void {
        const studioWindow = this.studioFrame && this.studioFrame.nativeElement.contentWindow;
        if (this._studioOrigin && studioWindow) {
            studioWindow.postMessage(message, this._studioOrigin);
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
        window.removeEventListener('message', this._windowEventListener);
    }
}
