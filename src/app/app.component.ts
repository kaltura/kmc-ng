import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'kmc-root',
  directives: [ROUTER_DIRECTIVES],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  constructor() {
  }
}
