import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { environment } from 'app-environment';
import { environment as env} from '../../environments/environment';

@Component({
  selector: 'kStudio',
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.scss']
})
export class StudioComponent implements OnInit, AfterViewInit, OnDestroy {

  public studioUrl: string = "";
  public isProduction = false;

  constructor(private appAuthentication: AppAuthentication) {
    window["kmc"] = {
      "version": "3",
      "vars": {
        "ks": this.appAuthentication.appUser.ks,
        "api_url": environment.modules.studio.api_url,
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


  ngOnDestroy() {
    this.studioUrl = "";
  }

}
