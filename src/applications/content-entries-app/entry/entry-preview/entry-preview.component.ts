import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EntryPreviewWidget} from './entry-preview-widget.service';
import {KalturaMediaEntry, KalturaMediaType} from 'kaltura-ngx-client';
import {KalturaEntryStatus} from 'kaltura-ngx-client';
import {AppEventsService} from 'app-shared/kmc-shared';
import {PreviewAndEmbedEvent} from 'app-shared/kmc-shared/events';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions/kmc-permissions.service';
import {KMCPermissions} from 'app-shared/kmc-shared/kmc-permissions';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import { ClipAndTrimAppViewService } from 'app-shared/kmc-shared/kmc-views/component-views';
import { EntryStore } from '../entry-store.service';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import {AppAnalytics, AppAuthentication} from "app-shared/kmc-shell";
import {buildCDNUrl, getKalturaServerUri, serverConfig} from "config/server";
import {PreviewMetadataChangedEvent} from "../../preview-metadata-changed-event";
import {EmbedConfig, EmbedParams, PreviewEmbedService} from "../../../preview-and-embed/preview-and-embed.service";

@Component({
	selector: 'kEntryPreview',
	templateUrl: './entry-preview.component.html',
	styleUrls: ['./entry-preview.component.scss'],
    providers: [PreviewEmbedService, KalturaLogger.createLogger('EntryPreviewComponent')]
})
export class EntryPreview implements OnInit, OnDestroy {

    @ViewChild('previewIframe') previewIframe: ElementRef;
    public serverUri = getKalturaServerUri();
    public playerConfig: any;
    public renderPlayer = null;
    public _showPlayer = true;
    public _generatedPreviewCode: string | EmbedParams = "";


	public _actionLabel: string;
    public _clipAndTrimEnabled = false;
    public _clipAndTrimDisabledReason: string = null;
    public _previewDisabled = false;
    public _entryId = '';
    public _isImage = false;
    public _loadThumbnailWithKs = false;
    public _thumbnailUrl = '';
    public _ks = '';

    private _currentEntry: KalturaMediaEntry;

	constructor(public _widgetService: EntryPreviewWidget,
                private _appLocalization: AppLocalization,
                private _analytics: AppAnalytics,
                private _clipAndTrimAppViewService: ClipAndTrimAppViewService,
                private _appAuthentication: AppAuthentication,
                private _permissionsService: KMCPermissionsService,
                private _previewEmbedService: PreviewEmbedService,
                private _appEvents: AppEventsService,
                private _store: EntryStore) {
	}

	private _checkClipAndTrimAvailability(): void {

	    if (this._currentEntry) {
            this._clipAndTrimEnabled = this._clipAndTrimAppViewService.isAvailable({
                entry: this._currentEntry,
                hasSource: this._store.hasSource.value()
            });
        } else {
            this._clipAndTrimEnabled = false;
        }
    }

	ngOnInit() {
        this._ks = this._appAuthentication.appUser.ks;
        this.renderPlayer = (e) => {
            if (!e.data) {
                return;
            }
            if (e.origin === window.location.origin && e.data.messageType === 'init' && !this._isImage && this.previewIframe.nativeElement.contentWindow) {
                if (e.data.context === 'preview') {
                    this.previewIframe.nativeElement.contentWindow.postMessage({
                        'messageType': 'embed',
                        embedParams: this._generatedPreviewCode
                    }, window.location.origin);
                }
            }
        }
        this._loadThumbnailWithKs = this._appAuthentication.appUser.partnerInfo.loadThumbnailWithKs;
        const hasEmbedPermission = this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_EMBED_CODE);
        this._actionLabel = hasEmbedPermission
            ? this._appLocalization.get('applications.content.entryDetails.preview.pande')
            : this._appLocalization.get('applications.content.entryDetails.preview.previewInPlayer');

        this._widgetService.attachForm();

        this._store.hasSource.value$
            .pipe(cancelOnDestroy(this))
            .subscribe(
                data => {
                    this._checkClipAndTrimAvailability();
                });

        this._widgetService.data$
            .pipe(cancelOnDestroy(this))
            .subscribe(
            data => {
                if (data) {
                    this._currentEntry = data;
                    this._showPlayer = false;
                    // force player reload
                    setTimeout(() => {
                        this._entryId = this._currentEntry.id;
                        this._showPlayer = this._entryId.length && !this._isImage;
                        if (this._showPlayer) {
                            this.showPreview();
                        }
                    })
                    this._isImage = data.mediaType === KalturaMediaType.image;
                    this._thumbnailUrl = data.thumbnailUrl + '/width/280';
                    const entryHasContent = this._currentEntry.status.toString() !== KalturaEntryStatus.noContent.toString();

                    this._previewDisabled = !entryHasContent;
                }

                this._checkClipAndTrimAvailability();

            }
        );

        this._appEvents.event(PreviewMetadataChangedEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe(({entryId}) => {
                if (this._currentEntry && this._currentEntry.id === entryId) {
                    this._showPlayer = false;
                    // force player reload
                    setTimeout(() => {
                        this._entryId = this._currentEntry.id;
                        this._showPlayer = this._entryId.length && !this._isImage;
                        if (this._showPlayer) {
                            this.showPreview();
                        }
                    })
                }
            });
    }

    private generateV3code(): string | EmbedParams {
        const uiConfId = serverConfig.kalturaServer.previewUIConfV7.toString();
        const embedType = 'dynamic';
        const ks = this._appAuthentication.appUser.ks;
        let embedConfig: EmbedConfig = {
            embedType,
            ks,
            entryId: this._entryId,
            uiConfId,
            width: 280,
            height: 158,
            pid: this._appAuthentication.appUser.partnerId,
            serverUri: buildCDNUrl(''),
            playerConfig: ''
        }
        let config = '';
        let poster = '';
        config = `{"ks": "${ks}"}`;
        // force thumbnail download using ks if needed
        if (this._appAuthentication.appUser.partnerInfo.loadThumbnailWithKs) {
            poster = `${this._thumbnailUrl}/width/340/ks/${this._appAuthentication.appUser.ks}`;
        }
        embedConfig.playerConfig = config;
        return this._previewEmbedService.generateV3EmbedCode(embedConfig, true, poster);
    }

    private showPreview(): void {
        setTimeout(() => { // use a timeout to allow the iframe to render before accessing its native element
            window.addEventListener('message', this.renderPlayer);
            const uri = serverConfig.externalApps.playerWrapper ? serverConfig.externalApps.playerWrapper.uri : '/public/playerWrapper.html?context=preview';
            this.previewIframe.nativeElement.src = uri;
            this._generatedPreviewCode = this.generateV3code();
        }, 0);
    }

	openPreviewAndEmbed() {
        this._analytics.trackClickEvent('Share_Embed');
		this._appEvents.publish(new PreviewAndEmbedEvent(this._currentEntry));
	}

	ngOnDestroy() {
        window.removeEventListener('message', this.renderPlayer);
		this._widgetService.detachForm();
	}

    public _onThumbLoadError(event): void {
        event.target.style.display = 'none';
    }
}

