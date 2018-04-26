import { Injectable } from '@angular/core';
import { KMCPermissionsService } from '../../kmc-permissions';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KmcDetailsViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-details-view-base.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaConversionProfile } from 'kaltura-ngx-client/api/types/KalturaConversionProfile';
import { KalturaConversionProfileAssetParams } from 'kaltura-ngx-client/api/types/KalturaConversionProfileAssetParams';

export interface KalturaConversionProfileWithAsset extends KalturaConversionProfile {
    assets?: KalturaConversionProfileAssetParams[];
}

export enum SettingsTranscodingProfileViewSections {
    Metadata = 'Metadata',
    Flavors = 'Flavors'
}

export interface SettingsTranscodingProfileViewArgs {
    profile: KalturaConversionProfileWithAsset;
    section?: SettingsTranscodingProfileViewSections;
}


@Injectable()
export class SettingsTranscodingProfileViewService extends KmcDetailsViewBaseService<SettingsTranscodingProfileViewArgs> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                private _router: Router) {
        super();
    }

    isAvailable(args: SettingsTranscodingProfileViewArgs): boolean {
        return this._isSectionEnabled(args.section, args.profile);
    }

    private _getSectionRouteToken(section?: SettingsTranscodingProfileViewSections): string {
        let result;

        switch (section) {
            case SettingsTranscodingProfileViewSections.Flavors:
                result = 'flavors';
                break;
            case SettingsTranscodingProfileViewSections.Metadata:
            default:
                result = 'metadata';
                break;
        }

        return result;
    }

    private _isSectionEnabled(section: SettingsTranscodingProfileViewSections, profile: KalturaConversionProfileWithAsset): boolean {
        switch (section) {
            case SettingsTranscodingProfileViewSections.Flavors:
            case SettingsTranscodingProfileViewSections.Metadata:
                return true;
            default:
                return false;
        }
    }

    protected _open(args: SettingsTranscodingProfileViewArgs): Observable<boolean> {
        const sectionToken = this._getSectionRouteToken(args.section);
        return Observable.fromPromise(this._router.navigateByUrl(`/settings/transcoding/profile/${args.profile.id}/${sectionToken}`));
    }
}
