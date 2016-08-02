import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import {AppContainerComponent} from "../../../../shared/@kmc/hostedApps/app-container/app-container.component";
declare var window:any;

@Component({
  moduleId: module.id,
  selector: 'kmc-universal-studio',
  templateUrl: './universal-studio.component.html',
  styleUrls: ['./universal-studio.component.scss'],
  directives : [AppContainerComponent]
})
export class UniversalStudioComponent implements OnInit {

  constructor() {}

  // private variables


  // properties
  studioAppPath : string;

  // private functions

  // public functions
  ngOnInit() {
    this.initializeBridgeVariables();
    // TODO currently hardcoded - will be taken from configuration.
    this.studioAppPath = 'player-studio/';
  }

  initializeBridgeVariables() : void{


    window.kmc = {
      version : '3',
      preview_embed: null, // redundant feature (null on purpose)
      vars: {
        ks : 'jJ8MTgwMjM4MXzG91x-G8o9ni9jVJnwIexP4msJg6W_oOvDgajmIgERMFQm0UiywSZmcEJh27oyQnFlJed4s5W0vlQCQqAVelIDu8eGZ2zE3hJ0OH6Sdpegf8u7QaV6RpNCs9xuyk2weWSHoOPxTsoz7WxJPYCmtGEuLdtG3zF43ZxsNV4f3WAhbA==',  // TODO should get from the kmc host dynamically
        api_url : 'http://www.kaltura.com', // TODO should get from the kmc host dynamically
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