import { Observable } from 'rxjs/Observable';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { Router } from '@angular/router';
import { BrowserService, UnpermittedActionReasons } from 'app-shared/kmc-shell';

export abstract class KmcMainViewBaseService {

    constructor(protected _logger: KalturaLogger,
                protected _browserService: BrowserService,
                private _router: Router) {
    }

    abstract isAvailable(): boolean;

    abstract getRoutePath(): string;

    protected _open(): Observable<boolean> {
        return Observable.create(observer => {
            try {
                this._router.navigateByUrl(this.getRoutePath()).then(
                    result => {
                        observer.next(result);
                        observer.complete();
                    },
                    error => {
                        observer.error(error);
                    }
                );
            } catch (error) {
                observer.error(error);
            }
        });
    }

    isActiveView(activePath: string): boolean {
        return activePath.indexOf(this.getRoutePath()) !== -1;
    }

    open(): void {
        this.openWithState().subscribe();
    }

    openWithState(): Observable<{ opened: boolean }> {
        return Observable.create(observer => {
            if (this.isAvailable()) {
                this._open().subscribe(
                    result => {
                        if (!result) {
                            this._logger.info('open view operation failed');
                            // TODO sakal consult with Amir what to show if failed to navigate
                            this._browserService.handleUnpermittedAction(UnpermittedActionReasons.General);
                        }

                        observer.next({opened: result});
                        observer.complete();
                    }, error => {
                        this._logger.info('open view operation failed', { errorMessage: error ? error.message : '' });
                        // TODO sakal consult with Amir what to show if failed to navigate
                        this._browserService.handleUnpermittedAction(UnpermittedActionReasons.General);
                        observer.next({opened: false});
                        observer.complete();
                    }
                );
            } else {
                this._logger.info('ignore open view operation request, view is not available');
                this._browserService.handleUnpermittedAction(UnpermittedActionReasons.General);
                observer.next({opened: false});
                observer.complete();
            }
        });

    }
}
