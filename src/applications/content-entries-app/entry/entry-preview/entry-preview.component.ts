import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntryPreviewHandler } from './entry-preview-handler';
import { EntryFormManager } from '../entry-form-manager';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaEntryStatus } from 'kaltura-typescript-client/types/KalturaEntryStatus';

@Component({
	selector: 'kEntryPreview',
	templateUrl: './entry-preview.component.html',
	styleUrls: ['./entry-preview.component.scss']
})
export class EntryPreview implements OnInit, OnDestroy {

	public _handler : EntryPreviewHandler;
	public _entryHasContent: boolean = false;
	public _entryReady: boolean = false;

	private _currentEntry: KalturaMediaEntry;


	constructor(private _entryFormManager : EntryFormManager) {
	}

	ngOnInit() {

		this._handler = this._entryFormManager.attachWidget(EntryPreviewHandler);
		this._handler.data$.subscribe(
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
		alert("Open Preview & Embed Window");
	}

	ngOnDestroy() {
		this._entryFormManager.detachWidget(this._handler);
	}
}

