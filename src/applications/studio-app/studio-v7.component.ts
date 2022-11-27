import {ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { AppEventsService } from 'app-shared/kmc-shared';
import { serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import {HideMenuEvent, PlayersUpdatedEvent} from 'app-shared/kmc-shared/events';
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
  public _windowEventListener = null;
  @ViewChild('studioFrame', { static: true}) studioFrame: ElementRef;

  constructor(
        private _appEvents: AppEventsService, private logger: KalturaLogger,
        private _appAuthentication: AppAuthentication,
        private _ngZone: NgZone,
        private _studioV7MainView: StudioV7MainViewService) {
  }

  ngOnInit() {
      window['kmc'] = {
          'preview_embed': {
              'updateList': (isPlaylist: boolean) => {
                  this._ngZone.run(() => {
                      this._appEvents.publish(new PlayersUpdatedEvent(isPlaylist));
                  });
              }
          },
          'pid': this._appAuthentication.appUser.partnerId,
          'publisherEnvType': this._appAuthentication.appUser.partnerInfo.publisherEnvironmentType,
          'updateView': (view: string) => {
              this._ngZone.run(() => {
                  this.currentView = view;
                  if (view === 'list') {
                      this._appEvents.publish(new HideMenuEvent(true));
                      this.iframeHeight = '920px';
                  } else {
                      this._appEvents.publish(new HideMenuEvent(false));
                      this.iframeHeight = '100vh';
                  }
              });
          }
      };
      this.studioUrl = serverConfig.externalApps.studioV7.uri;

      // all commented out code is a placeholder to use postmessage communication instead of window vars to support unfriendly iframe (KMS)
      /*
      const config = {
          'pid': this._appAuthentication.appUser.partnerId,
          'ks': this._appAuthentication.appUser.ks,
          'publisherEnvType': this._appAuthentication.appUser.partnerInfo.publisherEnvironmentType,
      };
      this.studioUrl = "http://localhost:3000/index.html";  // TODO - update to serverConfig.externalApps.studioV7.uri

      this._windowEventListener = (e) => {
          let postMessageData;
          try {
              postMessageData = e.data;
          } catch (ex) {
              return;
          }

          if (postMessageData.messageType === 'studioInit') {
              this.sendMessageToStudio({'messageType': 'init', 'payload': config });
          }
          if (postMessageData.messageType === 'listView') {
              this._appEvents.publish(new HideMenuEvent(true));
              this.iframeHeight = '920px';
          }
          if (postMessageData.messageType === 'editView') {
              this._appEvents.publish(new HideMenuEvent(false));
              this.iframeHeight = '100vh';
          }
      };
      this._addPostMessagesListener();*/
  }

  /*
    private sendMessageToStudio(message: any): void{
        if (this.studioFrame && this.studioFrame.nativeElement.contentWindow && this.studioFrame.nativeElement.contentWindow.postMessage){
            this.studioFrame.nativeElement.contentWindow.postMessage(message, '*');
        }
    }

    private _addPostMessagesListener() {
        this._removePostMessagesListener();
        window.addEventListener('message', this._windowEventListener);
    }


    private _removePostMessagesListener(): void {
        window.removeEventListener('message', this._windowEventListener);
    }*/

  ngOnDestroy() {
    window['kmc'] = null;
    this.studioUrl = '';
    // this._removePostMessagesListener();
  }
}
