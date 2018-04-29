import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { AppAuthentication, AppNavigator, BrowserService } from 'app-shared/kmc-shell';
import 'rxjs/add/operator/first';

@Component({
    selector: 'kKMCAppActions',
    template: '<k-area-blocker classes="kAreaBlockerCoverAll" [showLoader]="true"></k-area-blocker>',
    providers: [KalturaLogger.createLogger('AppActionsComponent')]
})
export class AppActionsComponent implements OnInit, OnDestroy {
    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _appAuth: AppAuthentication,
                private _appNavigator: AppNavigator,
                private _browserService: BrowserService,
                private _logger: KalturaLogger) {

    }

    ngOnInit() {
        this._prepare();
    }

    ngOnDestroy() {

    }

    private _prepare(): void {
        this._route.params
            .cancelOnDestroy(this)
            .first()
            .subscribe(param => {
                switch (param['action']) {
                    case 'login-by-ks':
                        this._logger.info(`handle 'login-by-ks' action`);
                        this._handleLoginByKS(this._route.snapshot.queryParams['ks']);
                        break;
                    default:
                        this._logger.info(`unknown action received, redirect to login page`, { action: param['action'] });
                        this._router.navigate(['/login']);
                        break;
                }
            });
    }

    private _handleLoginByKS(ks: string): void {

        this._appAuth.clearSessionCredentials();
        if (typeof ks !== 'string' || !ks.trim()) {
            this._logger.info(`ks is not defined, redirect to login page`);
            this._router.navigate(['/login']);
            return;
        }

        this._logger.info(`try to login by ks provided from query params`, { ks });

        this._browserService.removeFromSessionStorage('auth.login.ks');

        this._appAuth.loginByKS(ks, false)
            .cancelOnDestroy(this)
            .subscribe(result => {
                if (result) {
                    this._logger.info(`login successful, navigate to the default page`);
                    this._appNavigator.navigateToDefault();
                } else {
                    this._logger.info(`login failed, navigate to the login page`);
                    this._router.navigate(['/login']);
                }
            });

    }
}
