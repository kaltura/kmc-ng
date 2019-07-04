import { Component, Input, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import {
    ExternalMediaAddAction,
    KalturaClient,
    KalturaExternalMediaEntry,
    KalturaExternalMediaSourceType,
    KalturaMediaType,
    KalturaMultiRequest,
    KalturaThumbAsset,
    KalturaUrlResource,
    ThumbAssetAddAction,
    ThumbAssetSetAsDefaultAction,
    ThumbAssetSetContentAction
} from 'kaltura-ngx-client';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import * as moment from 'moment';
import { UpdateEntriesListEvent } from 'app-shared/kmc-shared/events/update-entries-list-event';
import { ContentEntryViewSections, ContentEntryViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
import { AppEventsService } from 'app-shared/kmc-shared';
import { serverConfig } from 'config/server';
import { KalturaMultiResponse } from 'kaltura-ngx-client/lib/api/kaltura-multi-response';

export interface YoutubeMetadata {
    title: string;
    duration: number;
}

@Component({
    selector: 'kKMCUploadFromYoutube',
    templateUrl: './upload-from-youtube.component.html',
    styleUrls: ['./upload-from-youtube.component.scss']
})
export class UploadFromYoutubeComponent implements OnDestroy {
    @Input() parentPopupWidget: PopupWidgetComponent;

    public _source: string;
    public _sourceInvalid: boolean;

    constructor(private _appLocalization: AppLocalization,
                private _http: HttpClient,
                private _contentEntryViewService: ContentEntryViewService,
                private _appEvents: AppEventsService,
                private _browserService: BrowserService,
                private _serverClient: KalturaClient) {
        if (!serverConfig.externalAPI || !serverConfig.externalAPI
            || !serverConfig.externalAPI.youtube || !serverConfig.externalAPI.youtube.uri) {
            this._browserService.alert({
                header: this._appLocalization.get('app.common.attention'),
                message: this._appLocalization.get('applications.upload.uploadFromYoutube.notSupported'),
                accept: () => {
                    this.parentPopupWidget.close();
                }
            });
        }
    }

    ngOnDestroy() {

    }

    private _validate(source: string): boolean {
        // WARNING: YouTube may change url or id format in the future, once happens - update RegExps accordingly
        const youtubeUrlRegExp = new RegExp('^(http(s)?:\\/\\/)?((w){3}.)?youtu(be|.be)?(\\.com)?\\/(?!channel).+', 'i');
        const youtubeVideoIdRegExp = new RegExp('^[A-Za-z0-9_-]{11}$', 'i');
        return youtubeUrlRegExp.test(source) || youtubeVideoIdRegExp.test(source);
    }

    private _extractReferenceId(source: string): string {
        const idRegExp = new RegExp('([A-Za-z0-9_-]{11})', 'i');

        const match = source.match(idRegExp);
        if (match && match.length) {
            return match[0];
        }

        return null;
    }

    private _createYoutubeEntry(referenceId: string): void {
        // Developer notice: this feature will be added soon.
        this._browserService.alert({
            header: this._appLocalization.get('app.common.attention'),
            message: this._appLocalization.get('applications.upload.uploadFromYoutube.notSupported'),
            accept: () => {
                this.parentPopupWidget.close();
            }
        });
    }

    public _upload(): void {
        const source = (this._source || '').trim();
        if (this._validate(source)) {
            const referenceId = this._extractReferenceId(source);
            this._createYoutubeEntry(referenceId);
        } else {
            this._sourceInvalid = true;
        }
    }
}
