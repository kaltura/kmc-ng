import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import {AuthenticationService} from "./shared/@kmc/auth/authentication.service";
import {KalturaProxy} from "./shared/@kmc/kaltura-api/kaltura-proxy";

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'kmc-root',
  directives: [ROUTER_DIRECTIVES],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AuthenticationService, KalturaProxy]
})
export class AppComponent {

  constructor() {
  }
}
