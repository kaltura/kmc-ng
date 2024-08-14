import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntryCaptionsWidget } from './entry-captions-widget.service';
import { ReachAppViewService, ReachPages } from 'app-shared/kmc-shared/kmc-views/details-views';
import {
    AppearInListType
} from '../../../content-categories-app/categories/bulk-actions/components/bulk-change-category-listing/bulk-change-category-listing.component';
import {KMCPermissions} from 'app-shared/kmc-shared/kmc-permissions';
import {KalturaStreamContainer} from 'kaltura-ngx-client/lib/api/types/KalturaStreamContainer';
import {KalturaLiveStreamEntry} from 'kaltura-ngx-client';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';

export enum LiveCaptionsType {
    Reach = 0,
    UserIngested = 1
}

@Component({
    selector: 'kEntryLiveCaptions',
    templateUrl: './entry-live-captions.component.html',
    styleUrls: ['./entry-live-captions.component.scss']
})
export class EntryLiveCaptions implements OnInit, OnDestroy {
    public _liveCaptionsType = LiveCaptionsType;
    public _captionsType = null;
    public _requestCaptionsAvailable = true;

    public _specialCharacters = false;
    public _streams: KalturaStreamContainer[] = [];

    constructor(public _widgetService: EntryCaptionsWidget,
                private _reachAppViewService: ReachAppViewService) {
    }

    ngOnInit() {
        this._widgetService.attachForm();

        this._widgetService.data$
            .pipe(cancelOnDestroy(this))
            .subscribe(entry => {
                this._requestCaptionsAvailable = this._reachAppViewService.isAvailable({ page: ReachPages.entry, entry });
                this._captionsType = entry.adminTags?.indexOf('prioritize_reach_captions') > -1 ? LiveCaptionsType.Reach : LiveCaptionsType.UserIngested;
                this._specialCharacters = entry.adminTags?.indexOf('extract_closed_caption_feature') > -1;
                const streams = (entry as KalturaLiveStreamEntry).streams;
                if (streams?.length) {
                    this._streams = JSON.parse(JSON.stringify(streams));
                }
            });
    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }

    public onCaptionTypeChange(): void {
        this._widgetService.liveCaptions.adminTag = this._captionsType === LiveCaptionsType.Reach ? 'prioritize_reach_captions' : '';
        this._widgetService.setDirty();
    }

    public onSpecialCharactersChange(): void {
        this._widgetService.liveCaptions.adminTag = this._specialCharacters ? 'extract_closed_caption_feature' : '';
        this._widgetService.setDirty();
    }

    public _requestCaptions(): void {
        const entry = this._widgetService.data;
        this._reachAppViewService.open({ entry, page: ReachPages.entry });
    }

    protected readonly _kmcPermissions = KMCPermissions;
}

