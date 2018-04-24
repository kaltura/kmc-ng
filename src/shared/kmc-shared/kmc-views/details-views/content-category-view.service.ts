import { Injectable } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router, NavigationEnd } from '@angular/router';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import { KmcDetailsViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-details-view-base.service';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import { modulesConfig } from 'config/modules';

export enum ContentCategoryViewSections {
    Metadata = 'Metadata',
    Entitlements = 'Entitlements',
    SubCategories = 'SubCategories'
}

export interface ContentCategoryViewArgs {
    category: KalturaCategory;
    section?: ContentCategoryViewSections;
    ignoreWarningTag?: boolean;
}


@Injectable()
export class ContentCategoryViewService extends KmcDetailsViewBaseService<ContentCategoryViewArgs> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                private router: Router) {
        super();
    }

    isAvailable(args: ContentCategoryViewArgs): boolean {
        return this._isSectionEnabled(args.section, args.category);
    }

    private _getSectionRouteToken(section?: ContentCategoryViewSections): string {
        let result;

        switch (section) {
            case ContentCategoryViewSections.SubCategories:
                result = 'subcategories';
                break;
            case ContentCategoryViewSections.Entitlements:
                result = 'entitlements';
                break;
            case ContentCategoryViewSections.Metadata:
            default:
                result = 'metadata';
                break;
        }

        return result;
    }

    private _isSectionEnabled(section: ContentCategoryViewSections, category: KalturaCategory): boolean {
        switch (section) {
            case ContentCategoryViewSections.Metadata:
                return true;
            case ContentCategoryViewSections.Entitlements:
                const hasPrivacyContexts = category.privacyContexts && typeof(category.privacyContexts) !== 'undefined';
                const hasFeatureEntitlementPermission = this._appPermissions.hasPermission(KMCPermissions.FEATURE_ENTITLEMENT);
                return hasPrivacyContexts && hasFeatureEntitlementPermission;
            case ContentCategoryViewSections.SubCategories:
                return category.directSubCategoriesCount > 0 &&
                    category.directSubCategoriesCount <= modulesConfig.contentShared.categories.subCategoriesLimit;
            default:
                return false;
        }
    }

    protected _open(args: ContentCategoryViewArgs): Observable<boolean> {
        const navigate = (): Observable<boolean> => {
            const sectionToken = this._getSectionRouteToken(args.section);
            return Observable.fromPromise(this.router.navigateByUrl(`/content/categories/category/${args.category.id}/${sectionToken}`));
    };
        // show category edit warning if needed
        if (!args.ignoreWarningTag && args.category.tags && args.category.tags.indexOf('__EditWarning') > -1) {
            return Observable.create(observer => {
                this._browserService.confirm(
                    {
                        header: this._appLocalization.get('applications.content.categories.editCategory'),
                        message: this._appLocalization.get('applications.content.categories.editWithEditWarningTags'),
                        accept: () => {
                            navigate().subscribe(observer);
                        }
                    }
                );
            });
        } else {
            return navigate();
        }
    }
}
