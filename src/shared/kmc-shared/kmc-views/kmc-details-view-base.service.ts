import { Observable } from 'rxjs/Observable';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell';

export abstract class KmcDetailsViewBaseService<TArgs extends {}> {

    private _lastArgsUsedByOpen: TArgs = null;

    protected constructor(protected _logger: KalturaLogger,
                          protected _browserService: BrowserService) {
    }

    protected abstract _open(args: TArgs): Observable<boolean>;

    abstract isAvailable(args: TArgs): boolean;

    popOpenArgs(): TArgs | null {
        const result = this._lastArgsUsedByOpen;
        this._lastArgsUsedByOpen = null;
        return result;
    }

    open(args: TArgs): void {
        if (this.isAvailable(args)) {
            this._lastArgsUsedByOpen = args;
            this._open(args)
                .map(result => result === null ? true : result) // treat navigation to save route as successful operation
                .subscribe(
                result => {
                    if (!result) {
                        this._logger.info('open view operation failed');
                        this._lastArgsUsedByOpen = null;
                    }

                }, error => {
                    this._logger.info('open view operation failed', { errorMessage: error ? error.message : '' });
                    this._lastArgsUsedByOpen = null;
                    this._browserService.handleUnpermittedAction(false);
                }
            );
        } else {
            this._logger.info('ignore open view operation request, view is not available');
            this._lastArgsUsedByOpen = null;
            this._browserService.handleUnpermittedAction(false);
        }
    }
}
