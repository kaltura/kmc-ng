import { Component, OnDestroy } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';

@Component({
    selector: 'kKMCError',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnDestroy{

    constructor(private _browserService: BrowserService) {
        if (typeof this._browserService.previousUrl === 'undefined') {
            this._browserService.navigateToDefault();
        }else{
            document.body.style.overflowY = 'hidden';
            this.showPage = true;
        }
    }

    showPage = false;
    eggReady = false;

    private prepareEgg = {
        eye1: false,
        eye2: false,
        ear1: false,
        ear2: false
    }

    public _updateEgg(key: string) {
        this.prepareEgg[key] = true;
        this.eggReady = Object.keys(this.prepareEgg).every((key) => {
            return this.prepareEgg[key]
        });
    }

    public openLink(link) {
        window.open(link, '_blank');
    }

    ngOnDestroy(){
        document.body.style.overflowY = 'auto';
    }
}
