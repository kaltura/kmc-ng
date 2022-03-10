import { Injectable, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaMediaListResponse, KalturaMediaEntryFilter, KalturaFilterPager, MediaListAction, MediaGetAction, FlavorAssetGetDownloadUrlAction, KalturaClient } from 'kaltura-ngx-client';
import { FlavorAssetGetFlavorAssetsWithParamsAction, KalturaMediaEntry, KalturaFlavorAssetWithParams } from 'kaltura-ngx-client';
import { Flavor } from './flavor';
import { EntryWidget } from '../entry-widget';
import { ContentEntryViewSections } from 'app-shared/kmc-shared/kmc-views/details-views/content-entry-view.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';

@Injectable()
export class EntryFlavoursChildrenWidget extends EntryWidget implements OnDestroy {
    public showFlavorActions = true;

    constructor(private _kalturaServerClient: KalturaClient,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                logger: KalturaLogger) {
        super(ContentEntryViewSections.Flavours, logger);
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset() {
        this.showFlavorActions = true;
    }

    protected onActivate(firstTimeActivating: boolean) {
    }

    public getEntry(entryid : string) : Observable<KalturaMediaEntry> {
        const action = new MediaGetAction({
            entryId: entryid
        }) 
        return this._kalturaServerClient.request(action)    }

    public getFlavorAssetWithParams(entryid : string): Observable<KalturaFlavorAssetWithParams[]> {
        const action = new FlavorAssetGetFlavorAssetsWithParamsAction({
            entryId: entryid
        }) 
        return this._kalturaServerClient.request(action)
    }
    
    public downloadFlavor(flavor: Flavor): void {
        const id = flavor.flavorAsset.id;
        this._kalturaServerClient.request(new FlavorAssetGetDownloadUrlAction({
            id: id
        }))
            .pipe(cancelOnDestroy(this, this.widgetReset$))
            .subscribe(
                downloadUrl => {
                    this._browserService.openLink(downloadUrl);
                },
                error => {
                    this._browserService.showToastMessage({
                        severity: 'error',
                        detail: this._appLocalization.get('applications.content.entryDetails.flavours.downloadFailure')
                    });
                }
            );
    }
    
    public getChildEntries(entry : string) : Observable<KalturaMediaListResponse> {
        const listMediaEntryAction = new MediaListAction({
            filter: new KalturaMediaEntryFilter({
                parentEntryIdEqual: entry
            }),
            pager: new KalturaFilterPager({ pageSize : 30})
        });
        return this._kalturaServerClient.request(listMediaEntryAction);
    }

    ngOnDestroy() {
    }
}
