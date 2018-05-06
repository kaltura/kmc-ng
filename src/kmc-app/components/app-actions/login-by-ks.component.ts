import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { AppAuthentication, AppNavigator, BrowserService } from 'app-shared/kmc-shell';
import 'rxjs/add/operator/first';

@Component({
    selector: 'kLoginByKSComponent',
    template: '<k-area-blocker classes="kAreaBlockerCoverAll" [showLoader]="true"></k-area-blocker>',
    providers: [KalturaLogger.createLogger('LoginByKSComponent')]
})
export class LoginByKSComponent implements OnInit, OnDestroy {
    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _appAuth: AppAuthentication,
                private _appNavigator: AppNavigator,
                private _browserService: BrowserService,
                private _logger: KalturaLogger) {

    }

    ngOnInit() {
        this._logger.info(`handle 'login-by-ks' action`);
        const ks = (this._route.snapshot.params['ks'] || '').trim();
        if (!ks) {
            this._logger.info(`missing 'ks' value, navigating to default page`);
            this._appNavigator.navigateToDefault();
            return;
        }

        const replaceBrowserHistory = true;
        this._logger.info(`handle login by ks by the user, navigating to default page`, {replaceBrowserHistory});

        this._appAuth.setAutomaticLoginCredentials(ks);
        this._appNavigator.navigateToDefault({
            replaceUrl: replaceBrowserHistory
        });
    }

    ngOnDestroy() {
    }
}
