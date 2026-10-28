import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { AppEventsService } from 'app-shared/kmc-shared';
import { getUriOrigin, serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { HideMenuEvent, PlayersUpdatedEvent, ShowMenuEvent } from 'app-shared/kmc-shared/events';
import { StudioV3MainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kStudioV7',
  templateUrl: './studio-v7.component.html',
  styleUrls: ['./studio-v7.component.scss']
})
export class StudioV7Component implements OnInit, OnDestroy {

  public studioUrl = '';
  public iframeHeight = '932px';
  public currentView = 'list';
  public _windowEventListener = null;
  private _studioOrigin: string = null;
  @ViewChild('studioFrame', { static: true}) studioFrame: ElementRef;

  constructor(
        private _appEvents: AppEventsService, private logger: KalturaLogger,
        private _appAuthentication: AppAuthentication,
        private _browserService: BrowserService,
        private _ngZone: NgZone,
        private _studioV3MainView: StudioV3MainViewService) {
  }

  ngOnInit() {
      if (this._studioV3MainView.viewEntered()) {
          window['kmc'] = {
              'preview_embed': {
                  'updateList': (isPlaylist: boolean) => {
                      this._ngZone.run(() => {
                          this._appEvents.publish(new PlayersUpdatedEvent(isPlaylist));
                      });
                  }
              },
              'useCanary': false, // this._browserService.getInitialQueryParam('useCanary') removed as per SECF-30927
              'dateFormat': this._browserService.getFromLocalStorage('kmc_date_format') || 'month-day-year',
              'publisherEnvType': this._appAuthentication.appUser.partnerInfo.publisherEnvironmentType,
              'updateView': (view: string) => {
                  this._ngZone.run(() => {
                      this.currentView = view;
                      if (view === 'list') {
                          this._appEvents.publish(new ShowMenuEvent());
                          this.iframeHeight = '932px';
                      } else {
                          this._appEvents.publish(new HideMenuEvent());
                          this.iframeHeight = '100vh';
                      }
                  });
              }
          };
          this.studioUrl = `${serverConfig.externalApps.studioV7.uri}?rnd=${Math.random()}`;
          this._studioOrigin = getUriOrigin(serverConfig.externalApps.studioV7.uri);

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
                      'payload': {
                          'ks': this._appAuthentication.appUser.ks,
                          'pid': this._appAuthentication.appUser.partnerId
                      }
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

  ngOnDestroy() {
    window['kmc'] = null;
    this.studioUrl = '';
    window.removeEventListener('message', this._windowEventListener);
  }
}
