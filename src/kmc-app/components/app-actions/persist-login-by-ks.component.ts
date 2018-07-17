import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';

@Component({
    selector: 'kPersistLoginByKs',
    template: '<k-area-blocker classes="kAreaBlockerCoverAll" [showLoader]="true"></k-area-blocker>',
    providers: [KalturaLogger.createLogger('PersistLoginByKsComponent')]
})
export class PersistLoginByKsComponent implements OnInit, OnDestroy {
    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _appAuth: AppAuthentication,
                private _browserService: BrowserService,
                private _logger: KalturaLogger) {
    }

    ngOnInit() {
        this._logger.info(`handle 'persist-login-by-ks' action`);
        const ks = (this._route.snapshot.params['ks'] || '').trim();
        if (!ks) {
            this._logger.info(`missing 'ks' value, navigating to default page`);
            this._browserService.navigateToDefault();
            return;
        }

        const replaceBrowserHistory = true;
        this._logger.info(`handle persist-login-by-ks by the user, navigating to default page`, { replaceBrowserHistory });

        this._appAuth.setAutomaticLoginCredentials(ks, true);
        this._browserService.navigateToDefault(replaceBrowserHistory);
    }

    ngOnDestroy() {
    }
}
