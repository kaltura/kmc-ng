import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntryPreviewWidget } from './entry-preview-widget.service';

import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';

import { AppEventsService } from 'app-shared/kmc-shared';
import { PreviewAndEmbedEvent } from 'app-shared/kmc-shared/events';

@Component({
	selector: 'kEntryPreview',
	templateUrl: './entry-preview.component.html',
	styleUrls: ['./entry-preview.component.scss']
})
export class EntryPreview implements OnInit, OnDestroy {


	public _entryHasContent: boolean = false;
	public _entryReady: boolean = false;

	private _currentEntry: KalturaMediaEntry;


	constructor(public _widgetService: EntryPreviewWidget, private _appEvents: AppEventsService) {
	}

	ngOnInit() {

        this._widgetService.attachForm();
		this._widgetService.data$.subscribe(
			data => {
				if (data) {
					this._currentEntry = data;
					this._entryHasContent = this._currentEntry.status !== KalturaEntryStatus.noContent;
					this._entryReady = this._currentEntry.status === KalturaEntryStatus.ready;
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

