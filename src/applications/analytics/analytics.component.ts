import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsNewMainViewService, KMCAppMenuItem, LiveAnalyticsMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AppEventsService } from 'app-shared/kmc-shared';
import { ResetMenuEvent, UpdateMenuEvent } from 'app-shared/kmc-shared/events';
import { BrowserService } from 'app-shared/kmc-shell/providers';

@Component({
    selector: 'kAnalytics',
    templateUrl: './analytics.component.html',
    styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {

    public _multiAccountFlag: string = null;
    private menuConfig: KMCAppMenuItem[] = [];

    constructor(private _appLocalization: AppLocalization,
                private _appEvents: AppEventsService,
                private _router: Router,
                private _browserService: BrowserService,
                private _analyticsNewView: AnalyticsNewMainViewService,
                private _liveAnalyticsView: LiveAnalyticsMainViewService) {
        if (!this._analyticsNewView.isAvailable()) {
            if (this._liveAnalyticsView.isAvailable()) {
                this._liveAnalyticsView.open();
            } else {
                this._browserService.navigateToDefault();
            }
            return;
        }

        this.menuConfig = [
            {
                isAvailable: true,
                isActiveView: () => { return false },
                menuTitle: '',
                customMenuItemId: 'analyticsMultiAccount',
                customMenuItemCallback: (event) => this.onMultiAccountSelected(event)
            },
            {
                isAvailable: true,
                isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/technology`) !== -1 ||
                    activePath.indexOf(`/analytics/geo-location`) !== -1 ||
                    activePath.indexOf(`/analytics/content-interactions`) !== -1 ||
                    activePath.indexOf(`/analytics/engagement`) !== -1),
                open: () => {
                    this._router.navigateByUrl('/analytics/engagement');
                },
                menuTitle: this._appLocalization.get('app.titles.audience'),
                children: [
                    {
                        isAvailable: true,
                        isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/engagement`) !== -1),
                        open: () => {
                            this._router.navigateByUrl('/analytics/engagement');
                        },
                        menuTitle: this._appLocalization.get('app.titles.analyticsEngagement')
                    },
                    {
                        isAvailable: true,
                        isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/content-interactions`) !== -1),
                        open: () => {
                            this._router.navigateByUrl('/analytics/content-interactions');
                        },
                        menuTitle: this._appLocalization.get('app.titles.analyticsInteractions')
                    },
                    {
                        isAvailable: true,
                        isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/technology`) !== -1),
                        open: () => {
                            this._router.navigateByUrl('/analytics/technology');
                        },
                        menuTitle: this._appLocalization.get('app.titles.analyticsTechnology')
                    },
                    {
                        isAvailable: true,
                        isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/geo-location`) !== -1),
                        open: () => {
                            this._router.navigateByUrl('/analytics/geo-location');
                        },
                        menuTitle: this._appLocalization.get('app.titles.analyticsGeo')
                    },
                ]
            },
            {
                isAvailable: true,
                isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/contributors`) !== -1),
                open: () => {
                    this._router.navigateByUrl('/analytics/contributors');
                },
                menuTitle: this._appLocalization.get('app.titles.contributors'),
            },
            {
                menuTitle: this._appLocalization.get('app.titles.analyticsBW'),
                isAvailable: true,
                isActiveView: (activePath: string) => (activePath.indexOf(`/analytics/overview`) !== -1 || activePath.indexOf(`/analytics/publisher`) !== -1 || activePath.indexOf(`/analytics/enduser`) !== -1 ),
                open: () => {
                    this._router.navigateByUrl('/analytics/overview');
                },
                children: [
                    {
                        isAvailable: true,
                        isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/overview`) !== -1),
                        open: () => {
                            this._router.navigateByUrl('/analytics/overview');
                        },
                        menuTitle: this._appLocalization.get('app.titles.analyticsOverview')
                    },
                    {
                        isAvailable: true,
                        isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/publisher`) !== -1),
                        open: () => {
                            this._router.navigateByUrl('/analytics/publisher');
                        },
                        menuTitle: this._appLocalization.get('app.titles.analyticsPublisher')
                    },
                    {
                        isAvailable: true,
                        isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/enduser`) !== -1),
                        open: () => {
                            this._router.navigateByUrl('/analytics/enduser');
                        },
                        menuTitle: this._appLocalization.get('app.titles.analyticsEndUser')
                    }
                ]
            },
        ];

        if (this._liveAnalyticsView.isAvailable()) {
            this.menuConfig.push({
                isAvailable: true,
                isActiveView: (activePath: string) => (activePath.indexOf(`/analytics/live`) !== -1),
                open: () => {
                    this._router.navigateByUrl('/analytics/live');
                },
                menuTitle: this._appLocalization.get('app.titles.realtime'),
            });
        }
    }

    private onMultiAccountSelected(event: string): void {
        this._multiAccountFlag = event;
    }

    ngOnInit() {
        if (this._analyticsNewView.isAvailable()) {
            this._appEvents.publish(new UpdateMenuEvent('analytics', this.menuConfig, 'left'));
            this._analyticsNewView.viewEntered();
        }
    }

    ngOnDestroy() {
        if (this._analyticsNewView.isAvailable()) {
            this._appEvents.publish(new ResetMenuEvent());
        }
    }
}
