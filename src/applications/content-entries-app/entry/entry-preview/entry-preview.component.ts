import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntryPreviewHandler } from './entry-preview-handler';
import { EntryFormManager } from '../entry-form-manager';

@Component({
	selector: 'kEntryPreview',
	templateUrl: './entry-preview.component.html',
	styleUrls: ['./entry-preview.component.scss']
})
export class EntryPreview implements OnInit, OnDestroy {

	public _handler : EntryPreviewHandler;


	constructor(private _entryFormManager : EntryFormManager) {
	}

	ngOnInit() {

		this._handler = this._entryFormManager.attachWidget(EntryPreviewHandler);
	}



	ngOnDestroy() {
		this._entryFormManager.detachWidget(this._handler);
	}
}

