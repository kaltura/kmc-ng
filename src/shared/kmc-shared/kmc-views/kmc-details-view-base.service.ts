import { Observable } from 'rxjs/Observable';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell';

export abstract class KmcDetailsViewBaseService<TArgs extends {}> {

    protected constructor(protected _logger: KalturaLogger,
                          protected _browserService: BrowserService) {
    }

    protected abstract _open(args: TArgs): Observable<boolean>;

    abstract isAvailable(args: TArgs): boolean;

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
                    this._logger.info('open view operation failed', { errorMessage: error ? error.message : '' });
                    this._browserService.handleUnpermittedAction(false);
                }
            );
        } else {
            this._logger.info('ignore open view operation request, view is not available');
            this._browserService.handleUnpermittedAction(false);
        }
    }
}
