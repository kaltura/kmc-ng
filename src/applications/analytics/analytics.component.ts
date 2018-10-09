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
                isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/audience`) !== -1),
                open: () => {
                    this._router.navigateByUrl('/analytics/audience');
                },
                menuTitle: this._appLocalization.get('app.titles.audience'),
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
                isAvailable: true,
                isActiveView:  (activePath: string) => (activePath.indexOf(`/analytics/live`) !== -1),
                open: () => {
                    this._router.navigateByUrl('/analytics/live');
                },
                menuTitle: this._appLocalization.get('app.titles.live'),
            },
            {
                menuTitle: this._appLocalization.get('app.titles.analyticsBW'),
                isAvailable: true,
                isActiveView: (activePath: string) => (activePath.indexOf(`/analytics`) !== -1),
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
