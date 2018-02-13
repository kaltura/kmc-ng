import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication, BrowserService, UnpermittedActionReasons} from 'app-shared/kmc-shell';
import {AppEventsService} from 'app-shared/kmc-shared';
import {getKalturaServerUri, serverConfig} from 'config/server';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import { PlayersUpdatedEvent } from 'app-shared/kmc-shared/events';

@Component({
  selector: 'kStudio',
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.scss']
})
export class StudioComponent implements OnInit, AfterViewInit, OnDestroy {

  public studioUrl = '';

  constructor(private appAuthentication: AppAuthentication, private _appEvents: AppEventsService, private logger: KalturaLogger, private browserService: BrowserService) {
  }

  ngOnInit() {
    try {
      if (!serverConfig.externalApps.studio.enabled) { // Deep link when disabled handling
        this.browserService.handleUnpermittedAction(UnpermittedActionReasons.InvalidConfiguration)
        return undefined;
      }
      this.studioUrl = serverConfig.externalApps.studio.uri;
      window['kmc'] = {
        'version': '3',
        'preview_embed': {
          'updateList': (isPlaylist: boolean) => {
            this._updatePlayers(isPlaylist)
          }
        },
        'vars': {
          'ks': this.appAuthentication.appUser.ks,
          'api_url': getKalturaServerUri(),
          'studio': {
            'config': '{"version":' + serverConfig.externalApps.studio.version + ', "name":"Video Studio V2", "tags":"studio_v2", "html5_version":' + serverConfig.externalApps.studio.html5_version + ', "html5lib":' + serverConfig.externalApps.studio.html5lib + '}',
            'showFlashStudio': false,
            'showHTMLStudio': true,
            'uiConfID': +serverConfig.externalApps.studio.uiConfId,
            'version': serverConfig.externalApps.studio.version
          }
        }
      }
    } catch (ex) {
      this.logger.warn(`Could not load Studio, please check that Studio configurations are loaded correctly\n error: ${ex}`);
      this.studioUrl = null;
      window['kmc'] = null;
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
