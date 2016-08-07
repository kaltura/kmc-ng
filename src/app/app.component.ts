import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { ROUTER_DIRECTIVES } from '@angular/router';
import {AuthenticationService} from "./shared/@kmc/auth/authentication.service";
import { KalturaAPIClient, KalturaAPIConfig } from "./shared/@kmc/kaltura-api";

import {KMCConfig} from "./shared/@kmc/core/kmc-config.service";

function buildKalturaAPIConfig(kmcConfig : KMCConfig) {
  const { apiUrl, format = 1}  = kmcConfig.get('core.kaltura');
  const config = new KalturaAPIConfig();
  config.apiUrl = apiUrl;
  config.format = format;

  return config;
}

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'kmc-root',
  directives: [ROUTER_DIRECTIVES],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AuthenticationService,KalturaAPIClient, {provide : KalturaAPIConfig, useFactory : buildKalturaAPIConfig, deps : [KMCConfig]}]
})
export class AppComponent {

  constructor() {
  }
}
