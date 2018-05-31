import { Component, OnDestroy } from '@angular/core';
import { NavigationCancel, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';

@Component({
    selector: 'kLazyModuleLoadingProgressBar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnDestroy {
    private _step3Timeout: number;

    public _step1 = false;
    public _step2 = false;
    public _step3 = false;
    public _visible = false;

    constructor(router: Router) {
        let step2Timeout: number;

        router.events
            .cancelOnDestroy(this)
            .subscribe(event => {
                if (event instanceof RouteConfigLoadStart) {
                    this._visible = true;
                    this._step1 = true;
                    this._step3 = false;

                    step2Timeout = setTimeout(() => {
                        this._step1 = false;
                        this._step2 = true;
                        this._step3 = false;
                    }, 2e3); // 2 sec
                }

                if ((event instanceof RouteConfigLoadEnd || event instanceof NavigationCancel)) {
                    clearTimeout(step2Timeout);
                    this._step1 = false;
                    this._step2 = false;
                    this._step3 = true;

                    this._step3Timeout = setTimeout(() => {
                        this._visible = false;
                    }, 100);
                }
            });
    }

    ngOnDestroy() {
        clearTimeout(this._step3Timeout);
    }
}

