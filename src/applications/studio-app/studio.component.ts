import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication} from 'app-shared/kmc-shell';
import {AppEventsService} from 'app-shared/kmc-shared';
import {environment} from 'app-environment';
import {environment as env} from '../../kmc-app/environments/environment';
import {UpdatePlayersEvent} from 'app-shared/kmc-shared/events';

@Component({
  selector: 'kStudio',
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.scss']
})
export class StudioComponent implements OnInit, AfterViewInit, OnDestroy {

  public studioUrl: string = "";
  public isProduction = false;

  constructor(private appAuthentication: AppAuthentication, private _appEvents: AppEventsService) {
    const serverUrlPrefix: string = environment.core.kaltura.useHttpsProtocol ? 'https://' : 'http://';

    window["kmc"] = {
      "version": "3",
      "preview_embed":{
        "updateList": (isPlaylist: boolean) => {this._updatePlayers(isPlaylist)}
      },
      "vars": {
        "ks": this.appAuthentication.appUser.ks,
        "api_url": serverUrlPrefix + environment.core.kaltura.serverEndpoint,
        "studio": {
          "config": '{"version":' + environment.modules.studio.version + ', "name":"Video Studio V2", "tags":"studio_v2", "html5_version":' + environment.modules.studio.html5_version + ', "html5lib":' + environment.modules.studio.html5lib + '}',
          "showFlashStudio": false,
          "showHTMLStudio": true,
          "uiConfID": parseInt(environment.modules.studio.uiConfId),
          "version": environment.modules.studio.version
        }
      }
    }
  }

  ngOnInit() {
    if (env.production) {
      this.isProduction = true;
      this.studioUrl = environment.modules.studio.path;
    }
  }

  ngAfterViewInit() {
  }

  _updatePlayers(isPlaylist):void{
    this._appEvents.publish(new UpdatePlayersEvent(isPlaylist));
  }

  ngOnDestroy() {
    this.studioUrl = "";
    window["kmc"] = null;
  }

}
