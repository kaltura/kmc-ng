import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntryPreviewWidget } from './entry-preview-widget.service';

import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';

import { AppEventsService } from 'app-shared/kmc-shared';
import { PreviewAndEmbedEvent } from 'app-shared/kmc-shared/events';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions/kmc-permissions.service';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
	selector: 'kEntryPreview',
	templateUrl: './entry-preview.component.html',
	styleUrls: ['./entry-preview.component.scss']
})
export class EntryPreview implements OnInit, OnDestroy {


	public _entryHasContent: boolean = false;
	public _entryReady: boolean = false;
	public _actionLabel: string;

	private _currentEntry: KalturaMediaEntry;


	constructor(public _widgetService: EntryPreviewWidget,
              private _appLocalization: AppLocalization,
              private _permissionsService: KMCPermissionsService,
              private _appEvents: AppEventsService) {
	}

	ngOnInit() {
    const hasEmbedPermission = this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_EMBED_CODE);
    this._actionLabel = hasEmbedPermission
      ? this._appLocalization.get('applications.content.entryDetails.preview.pande')
      : this._appLocalization.get('applications.content.entryDetails.preview.previewInPlayer');

        this._widgetService.attachForm();
		this._widgetService.data$.subscribe(
			data => {
				if (data) {
					this._currentEntry = data;
					this._entryHasContent = this._currentEntry.status.toString() !== KalturaEntryStatus.noContent.toString();
					this._entryReady = this._currentEntry.status.toString() === KalturaEntryStatus.ready.toString();
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

