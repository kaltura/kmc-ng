import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { EntryStore } from '../../entry-store/entry-store.service';


import { AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import {
	KalturaMediaEntry,
	KalturaEntryStatus,
	KalturaSourceType,
	KalturaMediaType
} from '@kaltura-ng2/kaltura-api/types';
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
		this._entryStore.entry$.subscribe(
			response => {
				if (response) {
					this._currentEntry = response;
					this._entryReady = this._currentEntry.status !== KalturaEntryStatus.NoContent;
					const sourceType = this._currentEntry.sourceType.toString();
					this._isLive = (sourceType === KalturaSourceType.LiveStream.toString() ||
					sourceType === KalturaSourceType.AkamaiLive.toString() ||
					sourceType === KalturaSourceType.AkamaiUniversalLive.toString() ||
					sourceType === KalturaSourceType.ManualLiveStream.toString());
					this._isRecordedLive = (sourceType === KalturaSourceType.RecordedLive.toString());
					this._hasDuration = (this._currentEntry.status !== KalturaEntryStatus.NoContent && !this._isLive && this._currentEntry.mediaType.toString() !== KalturaMediaType.Image.toString());
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

