import {Component, OnDestroy, OnInit} from '@angular/core';

import {globalConfig} from 'config/global';
import {EntryClipsWidget} from './entry-clips-widget.service';
import {serverConfig} from 'config/server';
import {KalturaLogger} from "@kaltura-ng/kaltura-logger";
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions/kmc-permissions.service';


@Component({
    selector: 'kEntryClips',
    templateUrl: './entry-clips.component.html',
    styleUrls: ['./entry-clips.component.scss']
})
export class EntryClips implements OnInit, OnDestroy {
    public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;
    public _loading = false;
    public _loadingError = null;

    public _clipAndTrimEnabled = false;

    constructor(public _widgetService: EntryClipsWidget,
                private _permissionsService: KMCPermissionsService,
                logger: KalturaLogger) {
      const hasIngestClipPermission = this._permissionsService.hasPermission(KMCPermissions.CONTENT_INGEST_CLIP_MEDIA);
      this._clipAndTrimEnabled = serverConfig.externalApps.clipAndTrim.enabled && hasIngestClipPermission;
    }

    _convertSortValue(value: boolean): number {
        return value ? 1 : -1;

    }
    public _onSortChanged(event: any)
    {
        this._widgetService.sortAsc = event.order === 1;
        this._widgetService.sortBy = event.field;

        this._widgetService.updateClips();
    }

    public _onPaginationChanged(state: any): void {
        if (state.page !== this._widgetService.pageIndex || state.rows !== this._widgetService.pageSize) {
            this._widgetService.pageIndex = state.page;
            this._widgetService.pageSize = state.rows;
            this._widgetService.updateClips();
        }
    }

    ngOnInit() {
        this._widgetService.attachForm();
    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }
}

