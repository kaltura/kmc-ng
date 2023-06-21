import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { BaseEntryListAction, KalturaDetachedResponseProfile, KalturaFilterPager, KalturaMediaEntry, KalturaMediaEntryFilter, KalturaRequestOptions, KalturaResponseProfileType } from 'kaltura-ngx-client';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KalturaClient } from 'kaltura-ngx-client';
import { AppEventsService } from 'app-shared/kmc-shared';
import { RoomWidget } from '../room-widget';
import { KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { ContentRoomViewSections } from "app-shared/kmc-shared/kmc-views/details-views";
import { RoomStore } from "../room-store.service";

@Injectable()
export class RoomRecordingsWidget extends RoomWidget {
    private _recordings = new BehaviorSubject<{ items: KalturaMediaEntry[] }>(
        {items: []}
    );

    public _recordings$ = this._recordings.asObservable();
    public _loadThumbnailWithKs = false;
    public _ks = '';

    private sortBy = 'name';
    private sortDirection = -1;

    constructor(private _kalturaServerClient: KalturaClient, private _appAuthentication: AppAuthentication,
                private _permissionsService: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _appEvents: AppEventsService,
                public _logger: KalturaLogger,
                public _roomStore: RoomStore,
                private _browserService: BrowserService,
                logger: KalturaLogger) {
        super(ContentRoomViewSections.Recordings, logger);
        this._loadThumbnailWithKs = _appAuthentication.appUser.partnerInfo.loadThumbnailWithKs;
        this._ks = _appAuthentication.appUser.ks;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset() {
    }

    protected onActivate(firstTimeActivating: boolean) {
        this.reloadRecordings();
    }

    public reloadRecordings() {
        if (!this._roomStore.room.redirectEntryId) {
            this._logger.info('No redirectEntryId found on room entry. Aborting...');
            this._recordings.next({items: []});
            return;
        }
        super._showLoader();
        this._recordings.next({items: []});
        const defaultPageSize = this._browserService.getFromLocalStorage('rooms.list.pageSize') || 50;
        const filter = new KalturaMediaEntryFilter({idIn: this._roomStore.room.redirectEntryId, orderBy: this.sortDirection === 1 ? `+${this.sortBy}` : `-${this.sortBy}`});
        let pager: KalturaFilterPager = new KalturaFilterPager({pageIndex: 1, pageSize: defaultPageSize});
        this._kalturaServerClient.request(new BaseEntryListAction({filter, pager})
            .setRequestOptions(
                new KalturaRequestOptions({
                    responseProfile: new KalturaDetachedResponseProfile({
                        type: KalturaResponseProfileType.includeFields,
                        fields: 'id,name,thumbnailUrl,mediaType,plays,createdAt,duration,status,startDate,endDate,moderationStatus,moderationCount,tags,adminTags,categoriesIds,downloadUrl,sourceType,entitledUsersPublish,entitledUsersView,entitledUsersEdit,externalSourceType,capabilities'
                    })
                })))
            .pipe(cancelOnDestroy(this))
            .subscribe(
                response => {
                    if (response.objects) {
                        this._recordings.next({items: response.objects as KalturaMediaEntry[]});
                        super._hideLoader();
                    }
                },
                error => {
                    const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
                    super._hideLoader();
                    this.sectionBlockerMessage = new AreaBlockerMessage({
                        message: errorMessage,
                        buttons: [
                            {
                                label: this._appLocalization.get('app.common.ok'),
                                action: () => this.sectionBlockerMessage = null
                            }
                        ]
                    });
                });
    }

    onSortChanged(event) {
        if (event.field && event.order) {
            // primeng workaround: must check that field and order was provided to prevent reset of sort value
            if (event.field !== this.sortBy || event.order !== this.sortDirection) {
                this.sortBy = event.field;
                this.sortDirection = event.order;
                this.reloadRecordings();
            }
        }
    }

    // animate uploading thumbnail row
    public getRowStyle(rowData): string {
        return rowData.uploadStatus ? 'uploading' : '';
    }

    ngOnDestroy() {
    }
}
