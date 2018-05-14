import { Component } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';

@Component({
    selector: 'kKMCError',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent {

    constructor(private _browserService: BrowserService) {
      if (typeof this._browserService.previousUrl === 'undefined') {
          this._browserService.navigateToDefault();
      }
    }
}
