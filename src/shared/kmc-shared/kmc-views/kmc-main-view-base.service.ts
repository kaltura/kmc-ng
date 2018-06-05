import { Observable } from 'rxjs/Observable';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { Router } from '@angular/router';
import { BrowserService } from 'app-shared/kmc-shell';
import { Title } from '@angular/platform-browser';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';

export interface ViewMetadata {
    menu: string;
    title: string;
}

export abstract class KmcMainViewBaseService {

    constructor(protected _logger: KalturaLogger,
                protected _browserService: BrowserService,
                private _router: Router,
                private _titleService: Title) {
    }

    abstract isAvailable(): boolean;

    abstract getRoutePath(): string;

    abstract getViewMetadata(): ViewMetadata;

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
                        const openState = result === null ? true : result; // treat navigation to save route as successful operation
                        if (!openState) {
                            this._logger.info('handle open view operation failure');
                        }

                        observer.next({opened: openState});
                        observer.complete();
                    }, error => {
                        this._logger.error('handle open view operation failure', { errorMessage: error ? error.message : '' });
                        this._browserService.handleUnpermittedAction(false);
                        observer.next({opened: false});
                        observer.complete();
                    }
                );
            } else {
                this._logger.warn('ignore open view operation request, view is not available');
                this._browserService.handleUnpermittedAction(false);
                observer.next({opened: false});
                observer.complete();
            }
        });

    }

    viewEntered(): boolean {
        if (this.isAvailable()) {
            this._titleService.setTitle(this.getViewMetadata().title);
            return true;
        } else {
            this._browserService.handleUnpermittedAction(true);
            return false;
        }
    }
}
