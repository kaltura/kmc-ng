import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router, NavigationEnd } from '@angular/router';
import { KmcDetailsViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-details-view-base.service';

export interface ViewArgs {
    entryId: number;
}

@Injectable()
export class ContentEntryViewService extends KmcDetailsViewBaseService<ViewArgs> {

    constructor(
        private _appPermissions: KMCPermissionsService,
        private router: Router
    ) {
        super();
    }

    isAvailable(args: ViewArgs): boolean {
        return true;
    }

    protected _open(args: ViewArgs): Observable<boolean> {
        return Observable.fromPromise(this.router.navigateByUrl('content/categories'));
    }
}
