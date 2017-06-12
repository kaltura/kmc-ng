import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntryStore } from '../entry-store.service';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaEntryStatus } from 'kaltura-typescript-client/types/KalturaEntryStatus';
import { KalturaSourceType } from 'kaltura-typescript-client/types/KalturaSourceType';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { BrowserService } from 'kmc-shell';
import { EntryPreviewHandler } from './entry-preview-handler';
import { EntryFormManager } from '../entry-form-manager';

@Component({
	selector: 'kEntryPreview',
	templateUrl: './entry-preview.component.html',
	styleUrls: ['./entry-preview.component.scss']
})
export class EntryPreview implements OnInit, OnDestroy {

	public _entryReady: boolean = false;
	public _isLive: boolean = false;
	public _isRecordedLive: boolean = false;
	public _hasDuration: boolean = false;
	public _isClip: boolean = false;

	private _currentEntry: KalturaMediaEntry;

	get currentEntry(): KalturaMediaEntry {
		return this._currentEntry;
	}
	public _handler : EntryPreviewHandler;


	constructor(private _entryFormManager : EntryFormManager,
				private browserService: BrowserService,

				public _entryStore: EntryStore) {
	}

	ngOnInit() {

		this._handler = this._entryFormManager.attachWidget(EntryPreviewHandler);
		this._handler.data$.subscribe(
			data => {
				if (data) {
					this._currentEntry = data;
					this._entryReady = this._currentEntry.status.toString() !== KalturaEntryStatus.noContent.toString();
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


	ngOnDestroy() {
		this._entryFormManager.detachWidget(this._handler);
	}
}

