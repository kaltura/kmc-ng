import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntryPreviewWidget } from './entry-preview-widget.service';

import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';

import { AppEventsService } from 'app-shared/kmc-shared';
import { PreviewAndEmbedEvent } from 'app-shared/kmc-shared/events';
import { KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions/kmc-permissions.service';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaExternalMediaEntry } from 'kaltura-ngx-client/api/types/KalturaExternalMediaEntry';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';
import { serverConfig } from 'config/server';

@Component({
	selector: 'kEntryPreview',
	templateUrl: './entry-preview.component.html',
	styleUrls: ['./entry-preview.component.scss']
})
export class EntryPreview implements OnInit, OnDestroy {


	public _entryHasContent: boolean = false;
	public _entryReady: boolean = false;
  public _clipAndTrimEnabled = false;


  private _currentEntry: KalturaMediaEntry;


	constructor(public _widgetService: EntryPreviewWidget,
              private _permissionsService: KMCPermissionsService,
              private _appEvents: AppEventsService) {
	}

	ngOnInit() {

        this._widgetService.attachForm();
		this._widgetService.data$.subscribe(
			data => {
				if (data) {
					this._currentEntry = data;
					this._entryHasContent = this._currentEntry.status.toString() !== KalturaEntryStatus.noContent.toString();
					this._entryReady = this._currentEntry.status.toString() === KalturaEntryStatus.ready.toString();

          const hasIngestClipPermission = this._permissionsService.hasAnyPermissions([
            KMCPermissions.CONTENT_INGEST_CLIP_MEDIA,
            KMCPermissions.CONTENT_INGEST_INTO_READY
          ]);
          const externalMedia = this._currentEntry instanceof KalturaExternalMediaEntry;
          const hasRelevantType = this._currentEntry.mediaType !== KalturaMediaType.image && !externalMedia;
          const enabledByConfig = true || serverConfig.externalApps.clipAndTrim.enabled;
          this._clipAndTrimEnabled = hasIngestClipPermission && hasRelevantType && enabledByConfig;
				}
			}
		);
	}

	openPreviewAndEmbed() {
		this._appEvents.publish(new PreviewAndEmbedEvent(this._currentEntry));
	}

	ngOnDestroy() {
		this._widgetService.detachForm();
	}
}

