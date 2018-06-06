import { Observable } from 'rxjs/Observable';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { Title } from '@angular/platform-browser';


export interface DetailsViewMetadata {
    title: string;
}

export abstract class KmcDetailsViewBaseService<TArgs extends {}> {

    protected constructor(protected _logger: KalturaLogger,
                          protected _browserService: BrowserService,
                          private _titleService: Title) {
    }

    protected abstract _open(args: TArgs): Observable<boolean>;

    abstract isAvailable(args: TArgs): boolean;

    abstract getViewMetadata(args: TArgs): DetailsViewMetadata;

    open(args: TArgs): void {
        if (this.isAvailable(args)) {
            this._open(args)
                .map(result => result === null ? true : result) // treat navigation to save route as successful operation
                .subscribe(
                result => {
                    if (!result) {
                        this._logger.info('open view operation failed');
                    }

                }, error => {
                    this._logger.error('open view operation failed', { errorMessage: error ? error.message : '' });
                    this._browserService.handleUnpermittedAction(false);
                }
            );
        } else {
            this._logger.warn('ignore open view operation request, view is not available');
            this._browserService.handleUnpermittedAction(false);
        }
    }

    viewEntered(args: TArgs, redirectToDefault = true): boolean {
        this._logger.info('handle view entered');
        if (this.isAvailable(args)) {
            const title = `KMC > ${this.getViewMetadata(args).title || ''}`;
            this._logger.info('update browser page title', { title });
            this._titleService.setTitle(title);
            return true;
        } else {
            this._logger.warn('view is not available, handle unpermitted action');
            this._browserService.handleUnpermittedAction(redirectToDefault);
            return false;
        }
    }
}
