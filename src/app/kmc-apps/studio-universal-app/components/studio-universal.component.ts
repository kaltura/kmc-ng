import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "../../../shared/@kmc/auth/authentication.service";
import { KMCConfig } from "../../../shared/@kmc/core/kmc-config.service";
import { AppContainerComponent } from "../../../shared/@kmc/hosted-apps/app-container/app-container.component";

declare var window:any;

@Component({
  selector: 'kmc-universal-studio',
  templateUrl: './studio-universal.component.html',
  styleUrls: ['./studio-universal.component.scss']
})
export class StudioUniversalComponent implements OnInit {

  constructor(private authenticationService : AuthenticationService, private kmcConfig : KMCConfig) {}

  // private variables


  // properties
  studioAppPath : string;

  // private functions

  // public functions
  ngOnInit() {
    this.initializeBridgeVariables();
    // TODO currently hardcoded - will be taken from configuration.
    this.studioAppPath = 'http://localhost/html5.kaltura/player-studio/app/index.html';
  }

  initializeBridgeVariables() : void{

    window.kmc = {
      version : '3',
      preview_embed: null, // redundant feature (null on purpose)
      vars: {
        ks : this.authenticationService.userContext.ks,
        api_url : this.kmcConfig.get('modules.studio_universal.apiUrl'),
        studio: {
          version : "v2.0.5",
          showHTMLStudio : false,
          showFlashStudio : false,
          uiConfID : 35833042,
          config : '{"version":"v2.0.5", "name":"Video Studio V2", "tags":"studio_v2", "html5_version":"v2.45", "html5lib":"http://www.kaltura.com/html5/html5lib/v2.45/mwEmbedLoader.php"}'
        }, // TODO should get from the kmc host dynamically
        default_kdp : {
          id: 34808452, height: "333", width: "400", swf_version: "3.9.9"
        } // TODO should get from the kmc host dynamically
      }
    };
  }

}
