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
    ThumbAssetAddFromUrlAction,
    ThumbAssetSetAsDefaultAction
} from 'kaltura-ngx-client';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import * as moment from 'moment';
import { UpdateEntriesListEvent } from 'app-shared/kmc-shared/events/update-entries-list-event';
import { ContentEntryViewSections, ContentEntryViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
import { AppEventsService } from 'app-shared/kmc-shared';
import { serverConfig } from 'config/server';

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
        const fromRegularUrl = new RegExp('(?!v=)([A-Za-z0-9_-]{11})', 'i');
        const fromShortUrl = new RegExp('(?!v=)([A-Za-z0-9_-]{11})', 'i');

        const regularUrlMatch = source.match(fromRegularUrl);
        if (regularUrlMatch && regularUrlMatch.length > 1) {
            return regularUrlMatch[1];
        }

        const shortUrlMatch = source.match(fromShortUrl);
        if (shortUrlMatch && shortUrlMatch.length > 1) {
            return shortUrlMatch[1];
        }

        return null;
    }

    private _getVideoMetadata(referenceId: string): Observable<{ title: string, duration: number }> {
        const { uri, key } = serverConfig.externalApi.youtube;
        const url = `${uri}?part=contentDetails,snippet&fields=items(snippet(title),contentDetails(duration))&id=${referenceId}&key=${key}`;
        return this._http.get(url)
            .pipe(map((response: { items: any[] }) => {
                if (response && Array.isArray(response.items) && response.items.length) {
                    const data = response.items[0] || {};
                    let title = `Youtube Entry ${referenceId}`;
                    let duration = 0;

                    if (data.hasOwnProperty('snippet') && data.snippet.hasOwnProperty('title')) {
                        title = data.snippet.title;
                    }

                    if (data.hasOwnProperty('contentDetails') && data.contentDetails.hasOwnProperty('duration')) {
                        duration = moment.duration(data.contentDetails.duration).asMilliseconds();
                    }

                    return { title, duration };
                }

                throw Error('invalid_referenceId');
            }));
    }

    private _createExternalEntry(referenceId: string, metadata: { title: string, duration: number }): Observable<KalturaExternalMediaEntry> {
        const externalMediaAddAction = new ExternalMediaAddAction({
            entry: new KalturaExternalMediaEntry({
                externalSourceType: KalturaExternalMediaSourceType.youtube,
                mediaType: KalturaMediaType.video,
                name: metadata.title,
                msDuration: metadata.duration,
                referenceId: referenceId,
            })
        });

        const addThumbFromUrl = new ThumbAssetAddFromUrlAction({
            entryId: '',
            url: `http://img.youtube.com/vi/${referenceId}/hqdefault.jpg`
        }).setDependency(['entryId', 0, 'id']);

        const setDefaultThumb = new ThumbAssetSetAsDefaultAction({ thumbAssetId: '' })
            .setDependency(['thumbAssetId', 1, 'id']);

        return this._serverClient.multiRequest(new KalturaMultiRequest(externalMediaAddAction, addThumbFromUrl, setDefaultThumb))
            .pipe(map((responses) => {
                if (responses.hasErrors()) {
                    const errorMessage = responses.reduce((acc, val) => `${acc}${val.error ? `${val.error.message}\n` : ''}`, '');
                    throw Error(errorMessage);
                }

                return responses[0].result;
            }));
    }

    private _createYoutubeEntry(referenceId: string): void {
        if (!referenceId) {
            this._sourceInvalid = true;
            return;
        }

        this._getVideoMetadata(referenceId)
            .pipe(
                switchMap(metadata => this._createExternalEntry(referenceId, metadata)),
                tag('block-shell'),
                cancelOnDestroy(this)
            )
            .subscribe(
                (entry) => {
                    this.parentPopupWidget.close();

                    this._browserService.confirm({
                        header: this._appLocalization.get('applications.upload.uploadFromYoutube.success'),
                        message: this._appLocalization.get('applications.upload.uploadFromYoutube.successMessage'),
                        accept: () => {
                            this._contentEntryViewService.open({
                                entry: entry,
                                section: ContentEntryViewSections.Metadata,
                                reloadEntriesListOnNavigateOut: true
                            });
                        },
                        reject: () => {
                            this._appEvents.publish(new UpdateEntriesListEvent());
                        }
                    });
                },
                error => {
                    if (error.message === 'invalid_referenceId') {
                        this._sourceInvalid = true;
                        return;
                    }

                    this._browserService.alert({
                        header: this._appLocalization.get('app.common.error'),
                        message: error.message
                    });
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
