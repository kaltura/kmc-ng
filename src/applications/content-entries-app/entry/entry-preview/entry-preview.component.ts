import { Component, OnInit, Input } from '@angular/core';
import { EntryStore } from '../../entry-store/entry-store.service';
import {
	KalturaMediaEntry,
	KalturaEntryStatus,
	KalturaSourceType,
	KalturaMediaType
} from 'kaltura-ts-api/types';
import { BrowserService } from 'kmc-shell';
import { EntryPreviewHandler } from './entry-preview-handler';

@Component({
	selector: 'kEntryPreview',
	templateUrl: './entry-preview.component.html',
	styleUrls: ['./entry-preview.component.scss']
})
export class EntryPreview implements OnInit {

	public _entryReady: boolean = false;
	public _isLive: boolean = false;
	public _isRecordedLive: boolean = false;
	public _hasDuration: boolean = false;
	public _isClip: boolean = false;

	private _currentEntry: KalturaMediaEntry;

	get currentEntry(): KalturaMediaEntry {
		return this._currentEntry;
	}


	constructor(private browserService: BrowserService,
				public _handler : EntryPreviewHandler,
				public _entryStore: EntryStore) {
	}

	ngOnInit() {
		this._handler.data$.subscribe(
			data => {
				if (data) {
					this._currentEntry = data;
					this._entryReady = this._currentEntry.status !== KalturaEntryStatus.noContent;
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

	openPreviewAndEmbed() {
		alert("Open Preview & Embed Window");
	}

	openLandingPage(landingPage: string) {
		this.browserService.openLink(landingPage);
	}

	navigateToEntry(entryId) {
		this._entryStore.openEntry(entryId);
	}

}

