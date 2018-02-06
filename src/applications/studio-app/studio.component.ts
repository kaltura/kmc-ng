import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { AppEventsService } from 'app-shared/kmc-shared';
import { subApplicationsConfig } from 'config/sub-applications';
import { environment as env} from '../../environments/environment';
import { UpdatePlayersEvent } from 'app-shared/kmc-shared/events';

@Component({
  selector: 'kStudio',
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.scss']
})
export class StudioComponent implements OnInit, AfterViewInit, OnDestroy {

  public studioUrl: string = "";
  public isProduction = false;

  constructor(private appAuthentication: AppAuthentication, private _appEvents: AppEventsService) {
    window["kmc"] = {
      "version": "3",
      "preview_embed":{
        "updateList": (isPlaylist: boolean) => {this._updatePlayers(isPlaylist)}
      },
      "vars": {
        "ks": this.appAuthentication.appUser.ks,
        "api_url": subApplicationsConfig.modules.studio.api_url,
        "studio": {
          "config": '{"version":' + subApplicationsConfig.modules.studio.version + ', "name":"Video Studio V2", "tags":"studio_v2", "html5_version":' + subApplicationsConfig.modules.studio.html5_version + ', "html5lib":' + subApplicationsConfig.modules.studio.html5lib + '}',
          "showFlashStudio": false,
          "showHTMLStudio": true,
          "uiConfID": parseInt(subApplicationsConfig.modules.studio.uiConfId),
          "version": subApplicationsConfig.modules.studio.version
        }
      }
    }
  }

  ngOnInit() {
    if (env.production) {
      this.isProduction = true;
      this.studioUrl = subApplicationsConfig.modules.studio.path;
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
