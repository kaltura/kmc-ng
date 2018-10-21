import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KMCAppMenuItem } from 'app-shared/kmc-shared/kmc-views';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AppEventsService } from 'app-shared/kmc-shared';
import { UpdateMenuEvent, ResetMenuEvent } from 'app-shared/kmc-shared/events';

@Component({
    selector: 'kAnalytics',
    templateUrl: './analytics.component.html',
    styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy{
    private menuConfig: KMCAppMenuItem[] = [];
    constructor(private _appLocalization: AppLocalization, private _appEvents: AppEventsService, private _router: Router){
        this.menuConfig = [
            {
                isAvailable: true,
                isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/dashboard`) !== -1),
                open: () => {
                    this._router.navigateByUrl('/analytics/dashboard');
                },
                menuTitle: this._appLocalization.get('app.titles.analyticsDashboard'),
            },
            {
                isAvailable: true,
                isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/technology`) !== -1 ||
                    activePath.indexOf(`/analytics/geo-location`) !== -1 ||
                    activePath.indexOf(`/analytics/content-interactions`) !== -1 ||
                    activePath.indexOf(`/analytics/engagement`) !== -1),
                open: () => {
                    this._router.navigateByUrl('/analytics/technology');
                },
                menuTitle: this._appLocalization.get('app.titles.audience'),
                children: [
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
                        isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/engagement`) !== -1),
                        open: () => {
                            this._router.navigateByUrl('/analytics/engagement');
                        },
                        menuTitle: this._appLocalization.get('app.titles.analyticsEngagement')
                    }
                ]
            },
            {
                isAvailable: true,
                isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/contributors`) !== -1),
                open: () => {
                    this._router.navigateByUrl('/analytics/contributors');
                },
                menuTitle: this._appLocalization.get('app.titles.contributors'),
                children: [
                    {
                        isAvailable: true,
                        isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/contributors`) !== -1),
                        open: () => {
                            this._router.navigateByUrl('/analytics/contributors');
                        },
                        menuTitle: this._appLocalization.get('app.titles.analyticsTopContributors')
                    }
                ]
            },
            {
                menuTitle: this._appLocalization.get('app.titles.analyticsBW'),
                isAvailable: true,
                isActiveView: (activePath: string) => (activePath.indexOf(`/analytics/publisher`) !== -1 || activePath.indexOf(`/analytics/enduser`) !== -1 ),
                open: () => {
                    this._router.navigateByUrl('/analytics/publisher');
                },
                children: [
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
            {
                isAvailable: true,
                isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/live`) !== -1),
                open: () => {
                    this._router.navigateByUrl('/analytics/live');
                },
                menuTitle: this._appLocalization.get('app.titles.live'),
            }
        ]
    }
    ngOnInit(){
        this._appEvents.publish(new UpdateMenuEvent('analytics', this.menuConfig, 'left'));
    }

    ngOnDestroy(){
        this._appEvents.publish(new ResetMenuEvent());
    }
}