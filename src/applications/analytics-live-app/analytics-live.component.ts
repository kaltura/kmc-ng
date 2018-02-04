import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { environment } from 'app-environment';

@Component({
    selector: 'kAnalyticsLive',
    templateUrl: './analytics-live.component.html',
    styleUrls: ['./analytics-live.component.scss'],
    providers : []
})
export class AnalyticsLiveComponent implements OnInit, AfterViewInit, OnDestroy {

    public appUrl : string

    constructor(private appAuthentication: AppAuthentication) {
    }

    ngOnInit() {
        this.appUrl = `${environment.modules.analyticsLive.url}?ks=${this.appAuthentication.appUser.ks}`;
    }

    ngAfterViewInit() {
    }


    ngOnDestroy() {

    }

}
