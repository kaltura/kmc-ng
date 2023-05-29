import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { forkJoin } from 'rxjs';
import { throwError } from 'rxjs';
import {
    KalturaBaseEntry, KalturaBaseEntryListResponse, KalturaDetachedResponseProfile,
    KalturaEntryStatus, KalturaFilterPager, KalturaRequestOptions, KalturaResponseProfileType,
    KalturaRoomEntryFilter, KalturaRoomType, RoomListAction,
    ThumbAssetSetAsDefaultAction
} from 'kaltura-ngx-client';
import { ThumbAssetGetByEntryIdAction } from 'kaltura-ngx-client';
import { KalturaThumbAsset } from 'kaltura-ngx-client';
import { DistributionProfileListAction } from 'kaltura-ngx-client';
import { KalturaDistributionProfileListResponse } from 'kaltura-ngx-client';
import { KalturaDistributionProfile } from 'kaltura-ngx-client';
import { KalturaThumbAssetStatus } from 'kaltura-ngx-client';
import { KalturaDistributionThumbDimensions } from 'kaltura-ngx-client';
import { ThumbAssetDeleteAction } from 'kaltura-ngx-client';
import { ThumbAssetAddFromImageAction } from 'kaltura-ngx-client';
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
import {SortDirection} from "../../../content-playlists-app/playlists/playlists-store/playlists-store.service";

@Injectable()
export class RoomBreakoutWidget extends RoomWidget {
    private _breakoutRooms = new BehaviorSubject<{ items: KalturaBaseEntry[] }>(
        {items: []}
    );

    public _breakoutRooms$ = this._breakoutRooms.asObservable();

    private sortBy = 'name';
    private sortDirection = -1;

    constructor(private _kalturaServerClient: KalturaClient, private _appAuthentication: AppAuthentication,
                private _permissionsService: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _appEvents: AppEventsService,
                private _browserService: BrowserService,
                logger: KalturaLogger) {
        super(ContentRoomViewSections.Breakout, logger);
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset() {
    }

    protected onActivate(firstTimeActivating: boolean) {
        this.loadBreakoutRooms();
    }

    private loadBreakoutRooms(): void {
        super._showLoader();
        this._breakoutRooms.next({items: []});
        const defaultPageSize = this._browserService.getFromLocalStorage('rooms.list.pageSize') || 50;
        const filter = new KalturaRoomEntryFilter({statusEqual: KalturaEntryStatus.noContent, roomTypeEqual: KalturaRoomType.breakout, parentEntryIdEqual: this.data.id, orderBy: this.sortDirection === 1 ? `+${this.sortBy}` : `-${this.sortBy}`});
        let pager: KalturaFilterPager = new KalturaFilterPager({pageIndex: 1, pageSize: defaultPageSize});
        this._kalturaServerClient.request(new RoomListAction({filter, pager})
            .setRequestOptions(
            new KalturaRequestOptions({
                responseProfile: new KalturaDetachedResponseProfile({
                    type: KalturaResponseProfileType.includeFields,
                    fields: 'id,name,createdAt'
                })
            })))
            .pipe(cancelOnDestroy(this))
            .subscribe(
                response => {
                    if (response.objects) {
                        this._breakoutRooms.next({items: response.objects});
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
                this.loadBreakoutRooms();
            }
        }
    }

    ngOnDestroy() {
    }
}
