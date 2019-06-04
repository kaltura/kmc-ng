import {Component, OnDestroy, ViewChild} from '@angular/core';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {PreviewAndEmbedEvent} from 'app-shared/kmc-shared/events';
import {AppEventsService} from 'app-shared/kmc-shared';
import {KalturaPlaylist} from 'kaltura-ngx-client';
import {KalturaMediaEntry} from 'kaltura-ngx-client';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {PlatformLocation} from '@angular/common';
import {EntryLoadedEvent} from 'app-shared/kmc-shared/events/entry-loaded-event';

@Component({
    selector: 'kPreviewEmbed',
    templateUrl: './preview-and-embed.component.html',
    styleUrls: ['./preview-and-embed.component.scss']
})
export class PreviewEmbedComponent implements OnDestroy {

    @ViewChild('previewEmbed') previewEmbedPopup: PopupWidgetComponent;

    public _media: KalturaPlaylist | KalturaMediaEntry;

    private _popupID = '#preview-embed';


    constructor(appEvents: AppEventsService, private _location: PlatformLocation) {
        appEvents.event(PreviewAndEmbedEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe(({media}) => {
                this._media = media;
                if ((media instanceof KalturaPlaylist || media instanceof KalturaMediaEntry) && !this.previewEmbedPopup.isShow) {
                    this.previewEmbedPopup.open();

                    window.history.pushState({}, '', `${window.location.href}${this._popupID}`);
                } else {
                    console.warn('Cannot open preview & embed (window already open?)');
                }
            });

        appEvents.event(EntryLoadedEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe(({media}) => {
                this._media = media;
                if (window.location.href.includes(this._popupID)) {
                    this.previewEmbedPopup.open();
                }
            });

        _location.onPopState(() => {
            if (this._media instanceof KalturaPlaylist || this._media instanceof KalturaMediaEntry) {
                if (this.previewEmbedPopup.isShow) {

                    this.previewEmbedPopup.close();

                } else if (window.location.href.includes(this._popupID)) {
                    this.previewEmbedPopup.open();
                }
            }
        });
    }

    public close(): void {
        this.previewEmbedPopup.close();
        this._location.back();
    }

    ngOnDestroy() {

    }
}

