import { Observable } from 'rxjs/Observable';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { Router } from '@angular/router';

export abstract class KmcMainViewBaseService {

    constructor(
        protected _logger: KalturaLogger,
        private _router: Router
    ) {
    }

    abstract isAvailable(): boolean;
    abstract getRoutePath(): string;

    protected _open(): Observable<boolean> {
        return Observable.fromPromise(this._router.navigateByUrl(this.getRoutePath()));
    }

    isActiveView(activePath: string): boolean {
        return activePath.indexOf(this.getRoutePath()) !== -1;
    }

    open(): void {
        this._open().subscribe(); // TODO sakal handle
    }
}
