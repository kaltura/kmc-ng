import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {buildCDNUrl, serverConfig} from "config/server";
import {PreviewMetadataChangedEvent} from "../../preview-metadata-changed-event";

@Component({
	selector: 'kEntryPreview',
	templateUrl: './entry-preview.component.html',
	styleUrls: ['./entry-preview.component.scss'],
  providers: [
    KalturaLogger.createLogger('EntryPreviewComponent')
  ]
})
export class EntryPreview implements OnInit, OnDestroy {

	public _actionLabel: string;
    public _clipAndTrimEnabled = false;
    public _clipAndTrimDisabledReason: string = null;
    public _previewDisabled = false;
    public _pid = this.appAuthentication.appUser.partnerId;
    public _cdnUrl = buildCDNUrl("");
    public _uiconf = 50344782;//serverConfig.kalturaServer.previewUIConfV7;
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
                private appAuthentication: AppAuthentication,
                private _permissionsService: KMCPermissionsService,
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
        this._loadThumbnailWithKs = this.appAuthentication.appUser.partnerInfo.loadThumbnailWithKs;
        this._ks = this.appAuthentication.appUser.ks;
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
                    this._entryId = data.id;
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
                    this._entryId = '';
                    // force player reload
                    setTimeout(() => {
                        this._entryId = this._currentEntry.id;
                    })
                }
            });
    }

	openPreviewAndEmbed() {
        this._analytics.trackClickEvent('Share_Embed');
		this._appEvents.publish(new PreviewAndEmbedEvent(this._currentEntry));
	}

	ngOnDestroy() {
		this._widgetService.detachForm();
	}

    public _onThumbLoadError(event): void {
        event.target.style.display = 'none';
    }
}

