import { Component, OnDestroy } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell/providers';

@Component({
    selector: 'kKMCError',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnDestroy{

    constructor(private _browserService: BrowserService) {
        if (typeof this._browserService.previousRoute === 'undefined') {
            this._browserService.navigateToDefault();
        } else {
            document.body.style.overflowY = 'hidden';
            this.showPage = true;
        }
    }

    showPage = false;

    ngOnDestroy(){
        document.body.style.overflowY = 'auto';
    }
}
