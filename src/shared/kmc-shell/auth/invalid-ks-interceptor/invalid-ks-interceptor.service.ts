import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';

@Injectable()
export class InvalidKsInterceptorService implements HttpInterceptor {
    constructor(private _appAuth: AppAuthentication,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService) {

    }

    private _createAlert(): any {
        return Observable.create(observer => {
            this._browserService.alert({
                header: this._appLocalization.get('app.common.error'),
                message: this._appLocalization.get('app.common.invalidKs'),
                accept: () => {
                    this._appAuth.logout();
                    observer.complete();
                }
            });
        });
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request)
            .switchMap((event: HttpResponse<any>) => {
                if (event.body && event.body.code === 'INVALID_KS') {
                    return this._createAlert();
                }

                return Observable.of(event);
            });
    }
}
