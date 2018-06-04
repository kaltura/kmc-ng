import { Component, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { NavigationCancel, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';

@Component({
    selector: 'kLazyModuleLoadingProgressBar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnDestroy {
    private _timeout: any;
    @ViewChild('bar') _bar: ElementRef;

    constructor(router: Router, renderer: Renderer2) {
        router.events
            .cancelOnDestroy(this)
            .subscribe(event => {
                if (event instanceof RouteConfigLoadStart) {
                    console.log('>>> 1');
                    renderer.addClass(this._bar.nativeElement, 'kProgressStep1');
                }

                if ((event instanceof RouteConfigLoadEnd || event instanceof NavigationCancel)) {
                    console.log('>>> 2');

                    renderer.removeClass(this._bar.nativeElement, 'kProgressStep1');
                    renderer.addClass(this._bar.nativeElement, 'kProgressStep2');

                    this._timeout = setTimeout(() => {
                        console.log('>>> 3');
                        renderer.removeClass(this._bar.nativeElement, 'kProgressStep2');
                    }, 1000);
                }
            });
    }

    ngOnDestroy() {
        clearTimeout(this._timeout);
    }
}

