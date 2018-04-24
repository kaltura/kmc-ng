import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router, NavigationEnd } from '@angular/router';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import { KmcDetailsViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-details-view-base.service';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';

export interface ViewArgs {
    category: {
        id: number;
        tags: string;
    };
}


@Injectable()
export class ContentCategoryViewService extends KmcDetailsViewBaseService<ViewArgs> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                private router: Router) {
        super();
    }

    isAvailable(args: ViewArgs): boolean {
        return true;
    }

    protected _open(args: ViewArgs): Observable<boolean> {
        // show category edit warning if needed
        if (args.category.tags && args.category.tags.indexOf('__EditWarning') > -1) {
            this._browserService.confirm(
                {
                    header: this._appLocalization.get('applications.content.categories.editCategory'),
                    message: this._appLocalization.get('applications.content.categories.editWithEditWarningTags'),
                    accept: () => {
                        return Observable.fromPromise(this.router.navigateByUrl(`/content/categories/category/${args.category.id}`));
                    }
                }
            );
        } else {
            return Observable.fromPromise(this.router.navigateByUrl(`/content/categories/category/${args.category.id}`));
        }
    }
}
