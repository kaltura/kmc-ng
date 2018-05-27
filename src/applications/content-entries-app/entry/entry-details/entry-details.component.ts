import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EntryStore } from '../entry-store.service';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import { KalturaSourceType } from 'kaltura-ngx-client/api/types/KalturaSourceType';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';
import { EntryDetailsWidget } from './entry-details-widget.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

export interface EntryDetailsKalturaMediaEntry extends KalturaMediaEntry {
  recordedEntryId?: string
}

@Component({
	selector: 'kEntryDetails',
	templateUrl: './entry-details.component.html',
	styleUrls: ['./entry-details.component.scss'],
    providers: [KalturaLogger.createLogger('EntryDetails')]
})
export class EntryDetails implements OnInit, OnDestroy {

	public _entryHasContent: boolean = false;
	public _entryReady: boolean = false;
	public _isLive: boolean = false;
	public _isRecordedLive: boolean = false;
	public _hasDuration: boolean = false;
	public _isClip: boolean = false;

	public _currentEntry: EntryDetailsKalturaMediaEntry;

	get currentEntry(): EntryDetailsKalturaMediaEntry {
		return this._currentEntry;
	}



	constructor(public _widgetService: EntryDetailsWidget,
				private _logger: KalturaLogger,

				public _entryStore: EntryStore) {
	}

	ngOnInit() {
        this._widgetService.attachForm();

		this._widgetService.data$.subscribe(
			data => {
				if (data) {
					this._currentEntry = data;
					this._entryHasContent = this._currentEntry.status.toString() !== KalturaEntryStatus.noContent.toString();
					this._entryReady = this._currentEntry.status.toString() === KalturaEntryStatus.ready.toString();
					const sourceType = this._currentEntry.sourceType.toString();
					this._isLive = (sourceType === KalturaSourceType.liveStream.toString() ||
					sourceType === KalturaSourceType.akamaiLive.toString() ||
					sourceType === KalturaSourceType.akamaiUniversalLive.toString() ||
					sourceType === KalturaSourceType.manualLiveStream.toString());
					this._isRecordedLive = (sourceType === KalturaSourceType.recordedLive.toString());
					this._hasDuration = (this._currentEntry.status !== KalturaEntryStatus.noContent && !this._isLive && this._currentEntry.mediaType.toString() !== KalturaMediaType.image.toString());
					this._isClip = !this._isRecordedLive && (this._currentEntry.id !== this._currentEntry.rootEntryId);
				}
			}
		);
	}

    navigateToEntry(entryId: string): void {
	    this._logger.info(`handle navigate to entry action by user`, { entryId });
        this._entryStore.openEntry(entryId);
    }

	ngOnDestroy() {
        this._widgetService.detachForm();
	}
}

